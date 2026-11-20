export const runtime='nodejs';
export const dynamic='force-dynamic';
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function GET(request:Request){
  const encoder=new TextEncoder();
  const chunks=['[01] Planning route to dock…\n','[02] TurtleBot3 arrived at dock.\n','[03] SO-101 loading cargo…\n','[04] Checking simulated safety conditions…\n','[05] Demo stream complete.\n'];
  const stream=new ReadableStream<Uint8Array>({
    async start(controller){
      for(const text of chunks){
        if(request.signal.aborted) break;
        try{controller.enqueue(encoder.encode(text));}catch{break;}
        await sleep(500);
      }
      try{controller.close();}catch{/* Browser cancelled. */}
    }
  });
  return new Response(stream,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store, no-transform','X-Content-Type-Options':'nosniff'}});
}
