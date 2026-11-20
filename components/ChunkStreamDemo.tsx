'use client';
import {useRef,useState} from 'react';
export default function ChunkStreamDemo(){
  const [output,setOutput]=useState(''); const [running,setRunning]=useState(false);const controller=useRef<AbortController|null>(null);
  async function run(){
    const abort=new AbortController();controller.current=abort;setOutput('');setRunning(true);
    try {
      const res=await fetch('/api/stream',{signal:abort.signal,cache:'no-store'});
      if(!res.ok || !res.body) throw new Error('Streaming unavailable');
      const reader=res.body.getReader(); const decoder=new TextDecoder();
      for(;;){const {value,done}=await reader.read();if(done)break;setOutput(prev=>prev+decoder.decode(value,{stream:true}));}
      setOutput(prev=>prev+decoder.decode());
    } catch(e){if(!abort.signal.aborted)setOutput(prev=>prev+'\nError: '+String(e));}
    finally {controller.current=null;setRunning(false);}
  }
  return <><div className="actions"><button disabled={running} onClick={run}>▶ Stream text</button><button className="secondaryButton" disabled={!running} onClick={()=>controller.current?.abort()}>Cancel</button></div><pre className="streamOutput" aria-live="polite">{output||'Start で分割された応答を受信します。'}</pre></>;
}
