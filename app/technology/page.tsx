import Link from 'next/link';
export const dynamic='force-static';
const tech=[
  ['App Router','app/ 配下のファイルベースルーティング','app/layout.tsx / page.tsx','/'],
  ['RSC','Server Componentで初期スナップショット取得','app/page.tsx','/'],
  ['SSR','毎リクエストの時刻・状態をサーバーで描画','app/ssr/page.tsx','/ssr'],
  ['SSG','ビルド時にドキュメント生成','app/ssg/page.tsx','/ssg'],
  ['ISR','30秒ごとのオンデマンド再検証','app/isr/page.tsx','/isr'],
  ['Server Actions','開始/停止をNext.jsサーバー経由でPOST','app/actions.ts','/'],
  ['RSC Streaming','Suspenseフォールバックから段階表示','app/streaming/page.tsx','/streaming'],
  ['HTTP Response Streaming','ReadableStreamのチャンク読み込み','app/api/stream/route.ts','/streaming'],
  ['WebSocket','200ms間隔でシミュレータ状態配信','scripts/simulator.mjs','/'],
  ['SSE','EventSourceでミッションイベント受信','app/api/events/route.ts','/'],
  ['Three.js','React Three Fiberで3D監視','components/RobotScene.tsx','/'],
];
export default function TechnologyPage(){return <div className="contentPage">
  <span className="eyebrow">IMPLEMENTATION ATLAS</span><h1>技術マップ</h1><p className="lead">似た言葉でも、レンダリング・更新・通信は別レイヤーです。このリポジトリは各機能を独立して検証できます。</p>
  <div className="techGrid">{tech.map(([name,desc,file,url])=><Link href={url} key={name} className="techCard"><span className="techArrow">↗</span><h2>{name}</h2><p>{desc}</p><code>{file}</code></Link>)}</div>
  <div className="infoPanel"><h2>責務の分離</h2><p>Next.jsは画面/SSR/Server Actions、ローカルNodeゲートウェイはWebSocket/SSE/ミッション状態を担当。ロボット実機はROS 2の読取専用データのみゲートウェイに入力します。</p></div>
</div>;}
