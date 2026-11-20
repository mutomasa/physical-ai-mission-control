import {Suspense} from 'react';
import ChunkStreamDemo from '@/components/ChunkStreamDemo';
export const dynamic='force-dynamic';
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function SlowPanel({name,ms}:{name:string;ms:number}){
  await delay(ms);
  return <div className="resultBox"><span className="overline">RESOLVED AFTER {ms} ms</span><h3>{name}</h3><p>このHTML領域はSuspenseによるRSCストリーミングで後から届きます。</p><code>{new Date().toISOString()}</code></div>;
}
export default function StreamingPage(){return <div className="contentPage">
  <span className="eyebrow">TWO STREAMING MODES</span><h1>Streaming Lab</h1><p className="lead">画面の段階描画（React Suspense）と、HTTP本文の逐次配信（ReadableStream）を分けて実験します。</p>
  <div className="techGrid">
    <section className="infoPanel"><h2>RSC Streaming / Suspense</h2><Suspense fallback={<p className="loadingText">センサーレポートを生成中…</p>}><SlowPanel name="センサーレポート" ms={900}/></Suspense><Suspense fallback={<p className="loadingText">行動計画を生成中…</p>}><SlowPanel name="行動計画" ms={2200}/></Suspense></section>
    <section className="infoPanel"><h2>HTTP Response Streaming</h2><p>サーバーAPIが返すテキストを、ブラウザのfetch + ReadableStreamで受信します。</p><ChunkStreamDemo/></section>
  </div>
</div>;}
