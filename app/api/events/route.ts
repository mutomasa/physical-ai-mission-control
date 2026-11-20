export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const base=process.env.SIM_HTTP_URL??'http://127.0.0.1:8787';
  try {
    const lastId=request.headers.get('last-event-id');
    const upstream=await fetch(`${base}/events`,{
      cache:'no-store', signal:request.signal,
      headers:lastId?{'last-event-id':lastId}:{},
    });
    if(!upstream.ok || !upstream.body)throw new Error('Simulator SSE unavailable');
    return new Response(upstream.body,{headers:{
      'Content-Type':'text/event-stream; charset=utf-8',
      'Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive','X-Accel-Buffering':'no',
    }});
  }catch{
    return new Response('event: unavailable\ndata: {"message":"Simulator offline"}\n\n',{
      status:503,headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store'},
    });
  }
}
