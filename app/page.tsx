import ClientDashboard from '@/components/ClientDashboard';
import { fetchSnapshot } from '@/lib/simulator-api';
export const dynamic='force-dynamic';
export default async function HomePage() {
  const initial=await fetchSnapshot();
  return <>
    <div className="pageHeading"><div><span className="eyebrow">ROBOTICS / REAL-TIME / NEXT.JS</span><h1>Physical AI <em>Mission Control</em></h1><p>SO-101 × TurtleBot3 Burger — エージェント協調・搬送タスクの安全な模擬監視とWeb技術検証</p></div><div className="headingStamp"><span>RSC + SSR</span><span>THREE.JS</span><span>WS + SSE</span></div></div>
    <ClientDashboard initial={initial}/>
    <div className="bottomNote">このデモはROS 2経由でロボットを操作しません。3Dモデル・関節角・協調動作は実寸や衝突判定を再現していない概念モデルです。初期スナップショットはServer Componentでサーバー取得し、以降はWebSocketで更新します。</div>
  </>;
}
