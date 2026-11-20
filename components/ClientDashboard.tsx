'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, useTransition } from 'react';
import { startMission, stopMission } from '@/app/actions';
import type { MissionEvent, MissionSnapshot } from '@/lib/types';

const RobotScene=dynamic(()=>import('./RobotScene'),{ssr:false,loading:()=> <div className="sceneLoading">3Dシーンを読み込み中…</div>});
const wsAddress=process.env.NEXT_PUBLIC_WS_URL ?? 'ws://127.0.0.1:8787/ws';

export default function ClientDashboard({initial}:{initial:MissionSnapshot}) {
  const [snapshot,setSnapshot]=useState(initial);
  const [wsStatus,setWsStatus]=useState<'connecting'|'online'|'offline'>('connecting');
  const [sseStatus,setSseStatus]=useState<'connecting'|'online'|'offline'>('connecting');
  const [events,setEvents]=useState<MissionEvent[]>([]);
  const [feedback,setFeedback]=useState('');
  const [pending,startTransition]=useTransition();
  useEffect(()=>{
    let cancelled=false;
    let ws:WebSocket|undefined;
    let retry:ReturnType<typeof setTimeout>|undefined;
    let delay=750;
    function connect() {
      if(cancelled)return;
      setWsStatus('connecting');
      ws=new WebSocket(wsAddress);
      ws.onopen=()=>{setWsStatus('online');delay=750;};
      ws.onmessage=(message:MessageEvent<string>)=>{
        try {
          const payload=JSON.parse(message.data) as {type:string;data:MissionSnapshot};
          if(payload.type==='snapshot')setSnapshot(payload.data);
        } catch { /* Ignore malformed telemetry. */ }
      };
      ws.onclose=()=>{
        if(cancelled)return;
        setWsStatus('offline');
        retry=setTimeout(connect,delay);
        delay=Math.min(delay*2,5000);
      };
      ws.onerror=()=>ws?.close();
    }
    connect();
    return()=>{cancelled=true;clearTimeout(retry);ws?.close();};
  },[]);
  useEffect(()=>{
    const source=new EventSource('/api/events');
    source.onopen=()=>setSseStatus('online');
    source.addEventListener('mission',(event:MessageEvent<string>)=>{
      try {
        const item=JSON.parse(event.data) as MissionEvent;
        setEvents(previous=>[item,...previous.filter(p=>p.id!==item.id)].slice(0,12));
      }catch { /* Ignore malformed SSE. */ }
    });
    source.onerror=()=>setSseStatus('offline');
    return()=>source.close();
  },[]);
  const execute=(which:'start'|'stop')=>{
    setFeedback('');
    startTransition(async()=>{
      const outcome=await (which==='start'?startMission():stopMission());
      setFeedback(outcome.message);
    });
  };
  const offline=wsStatus!=='online';
  const ros=snapshot.source==='ros2';
  return <div className="dashboardGrid">
    <section className="scenePanel">
      <div className="sceneHeader">
        <div><span className="overline">DIGITAL TWIN / SIMULATION</span><h2>協調搬送ミッション</h2></div>
        <span className={`statusPill ${offline?'muted':'on'}`}><span className="statusDot"/>{wsStatus==='online'?'TELEMETRY LIVE':wsStatus==='connecting'?'CONNECTING':'DISCONNECTED'}</span>
      </div>
      <div className="sceneCanvas"><RobotScene snapshot={snapshot}/><div className="sceneCorner">SO-101  •  TURTLEBOT3 BURGER<br/>概念3Dモデル / URDFではありません</div></div>
      <div className="sceneFooter"><span>DRAG 回転</span><span>SCROLL ズーム</span><span>制御モード: {ros?'ROS 2 読取専用':'SIMULATION'}</span></div>
    </section>
    <aside className="controlStack">
      <section className="panel">
        <span className="overline">MISSION CONTROL</span>
        <div className="sectionTitle"><h2>実行状態</h2><span className="codeBadge">{snapshot.status.toUpperCase()}</span></div>
        <div className="metricRow"><div className="hugeNumber">{snapshot.progress}<small>%</small></div><div className="metricAside">{snapshot.elapsedSeconds.toFixed(1)} s<br/><span>経過時間</span></div></div>
        <div className="progressTrack"><div style={{width:`${snapshot.progress}%`}}/></div>
        <p className="phase">{snapshot.phase}</p>
        <div className="actions"><button disabled={pending||offline||ros} onClick={()=>execute('start')}>▶ Start simulation</button><button className="secondaryButton" disabled={pending||offline||ros} onClick={()=>execute('stop')}>■ Stop</button></div>
        {feedback&&<p className="feedback" role="status">{feedback}</p>}
        {ros&&<p className="warning">ROS 2接続中：操作ボタンは無効。テレメトリ表示のみです。</p>}
      </section>
      <section className="panel">
        <span className="overline">LIVE ROBOT TELEMETRY / WS</span>
        <h2>ロボット状態</h2>
        <div className="telemetryLine"><span>TB3 X / Z</span><strong>{snapshot.tb3.x.toFixed(2)} / {snapshot.tb3.z.toFixed(2)} m</strong></div>
        <div className="telemetryLine"><span>TB3 Yaw</span><strong>{snapshot.tb3.yaw.toFixed(2)} rad</strong></div>
        <div className="telemetryLine"><span>SO-101 Shoulder</span><strong>{snapshot.arm.shoulder.toFixed(2)} rad</strong></div>
        <div className="telemetryLine"><span>SO-101 Elbow</span><strong>{snapshot.arm.elbow.toFixed(2)} rad</strong></div>
        <div className="telemetryLine"><span>Source</span><strong>{snapshot.source}</strong></div>
      </section>
      <section className="panel eventPanel">
        <div className="sectionTitle"><div><span className="overline">EVENT LOG / SSE</span><h2>イベントログ</h2></div><span className={`miniDot ${sseStatus==='online'?'live':''}`}>{sseStatus}</span></div>
        <div className="logScroll">{events.length===0?<p className="empty">Startでイベントが届きます。</p>:events.map(e=><div className="logItem" key={e.id}>
          <span className="logTime">{new Date(e.at).toLocaleTimeString('ja-JP',{timeZone:'Asia/Tokyo',hour12:false})}</span><div><span className="logKind">{e.kind}</span><p>{e.message}</p></div>
        </div>)}</div>
      </section>
    </aside>
  </div>;
}
