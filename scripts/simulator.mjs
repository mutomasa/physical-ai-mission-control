import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { makeEngine } from './sim-core.mjs';

const port = 8787;
const token = process.env.SIM_CONTROL_TOKEN;
if (!token || token.length < 32) {
  console.error('SIM_CONTROL_TOKEN missing/too short; run npm run setup.');
  process.exit(1);
}
const engine = makeEngine();
let nextId = 1;
const history = [];
const sseClients = new Set();
const allowedOrigins = new Set(['http://localhost:3000','http://127.0.0.1:3000']);
const json = (res, code, value) => { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value)); };
function announce(kind,message) {
  const evt = {id:nextId++,kind,message,at:new Date().toISOString(),progress:engine.snapshot().progress};
  history.push(evt); if (history.length > 100) history.shift();
  const wire = `id: ${evt.id}\nevent: mission\ndata: ${JSON.stringify(evt)}\n\n`;
  for (const client of sseClients) client.write(wire);
}
function requireToken(req,res) {
  if (req.headers['x-sim-token'] !== token) {json(res,403,{message:'Forbidden'});return false;}
  return true;
}
function readBody(req,maxBytes=4096) {
  return new Promise((resolve,reject)=>{
    let size=0; let body='';
    req.on('data',chunk=>{
      size+=chunk.length;
      if(size>maxBytes) {reject(new Error('Payload too large'));req.destroy();return;}
      body+=chunk.toString('utf8');
    });
    req.on('end',()=>{try{resolve(JSON.parse(body));}catch{reject(new Error('Invalid JSON'));}});
    req.on('error',reject);
  });
}
function finiteRange(v, min=-20, max=20) {return typeof v==='number' && Number.isFinite(v) && v>=min && v<=max;}
function validateRos(value) {
  if (!value || typeof value !== 'object') return null;
  const result={};
  if (value.tb3 && Object.keys(value.tb3).length) {
    const {x,z,yaw} = value.tb3;
    if (![x,z,yaw].every(v=>finiteRange(v))) return null;
    result.tb3={x,z,yaw};
  }
  if (value.arm && Object.keys(value.arm).length) {
    const keys=['shoulder','elbow','wrist','grip']; const arm={};
    for (const k of keys) {
      if (value.arm[k] === undefined) continue;
      if (!finiteRange(value.arm[k],-Math.PI*2,Math.PI*2)) return null;
      arm[k]=value.arm[k];
    }
    if (Object.keys(arm).length) result.arm=arm;
  }
  return Object.keys(result).length ? result : null;
}
const server = http.createServer(async(req,res)=>{
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (req.method==='GET' && url.pathname==='/health') return json(res,200,{ok:true,mode:'simulation + read-only ROS 2 overlay'});
  if (req.method==='GET' && url.pathname==='/snapshot') return json(res,200,engine.snapshot());
  if (req.method==='GET' && url.pathname==='/events') {
    res.writeHead(200,{
      'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive', 'X-Accel-Buffering':'no',
    });
    res.write(': connected\n\n');
    const lastId = Number(req.headers['last-event-id'] || 0);
    if (Number.isFinite(lastId) && lastId > 0) for (const e of history.filter(e=>e.id>lastId)) {
      res.write(`id: ${e.id}\nevent: mission\ndata: ${JSON.stringify(e)}\n\n`);
    }
    sseClients.add(res);
    const heartbeat=setInterval(()=>res.write(': heartbeat\n\n'),12000);
    res.on('close',()=>{clearInterval(heartbeat);sseClients.delete(res);});
    return;
  }
  if (req.method==='POST' && ['/missions/start','/missions/stop'].includes(url.pathname)) {
    if (!requireToken(req,res)) return;
    const outcome = url.pathname.endsWith('start') ? engine.start() : engine.stop();
    if (outcome.ok) announce('command',outcome.message);
    return json(res,outcome.ok?200:409,outcome);
  }
  if (req.method==='POST' && url.pathname==='/ros/telemetry') {
    if (!requireToken(req,res)) return;
    try {
      const body=validateRos(await readBody(req));
      if(!body) return json(res,400,{message:'Invalid ROS 2 telemetry'});
      engine.setRos(body);
      return json(res,200,{ok:true});
    } catch {return json(res,400,{message:'Invalid JSON or payload'});}
  }
  return json(res,404,{message:'Not found'});
});
const wss = new WebSocketServer({noServer:true,maxPayload:1024});
server.on('upgrade',(req,socket,head)=>{
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const origin = req.headers.origin;
  if(url.pathname !== '/ws' || !origin || !allowedOrigins.has(origin)) {socket.destroy();return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws));
});
wss.on('connection',ws=>{
  ws.send(JSON.stringify({type:'snapshot',data:engine.snapshot()}));
  // No inbound robot commands: WebSocket is strictly telemetry-only.
  ws.on('message',()=>ws.close(1008,'Read-only telemetry'));
});
let previous=performance.now();
let lastPhase=engine.snapshot().phase;
let lastStatus=engine.snapshot().status;
setInterval(()=>{
  const now=performance.now();const dt=(now-previous)/1000;previous=now;
  engine.tick(dt);
  const snapshot=engine.snapshot();
  if (snapshot.phase!==lastPhase || snapshot.status!==lastStatus) {
    announce('phase',snapshot.phase);
    lastPhase=snapshot.phase;lastStatus=snapshot.status;
  }
  const payload=JSON.stringify({type:'snapshot',data:snapshot});
  for(const client of wss.clients) if(client.readyState===WebSocket.OPEN && client.bufferedAmount<65536) client.send(payload);
},200);
server.listen(port,'127.0.0.1',()=>{
  console.log(`Simulator: http://127.0.0.1:${port} (loopback only)`);
  console.log('WebSocket: ws://127.0.0.1:8787/ws (read-only)');
  announce('system','ローカルシミュレータを起動しました。');
});
