import {fetchSnapshot} from '@/lib/simulator-api';
export const dynamic='force-dynamic';
export default async function SSRPage(){const data=await fetchSnapshot();const now=new Date().toISOString();return <div className="contentPage">
  <span className="eyebrow">SERVER-SIDE RENDERING</span><h1>SSR: 毎回のサーバー描画</h1>
  <p className="lead">時刻とロボットの最新スナップショットをリクエスト時に取得します。WebSocketを使わずSSR単体の動作を確認します。</p>
  <div className="bigTimestamp"><span>SERVER RENDER TIME (UTC)</span><strong>{now}</strong></div>
  <div className="infoPanel"><h2>取得したスナップショット</h2><pre>{JSON.stringify({source:data.source,status:data.status,phase:data.phase,progress:data.progress,tb3:data.tb3},null,2)}</pre><p>ブラウザを再読込するとサーバー時刻が変わります。動作の継続更新にはWebSocketが適しています。</p></div>
</div>;}
