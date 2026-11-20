export const dynamic='force-static';
const robots=[
  {name:'SO-101',role:'Stationary arm',data:'関節角・グリッパ状態の視覚化',note:'概念モデルのみ。実機URDFやキャリブレーションは含みません。'},
  {name:'TurtleBot3 Burger',role:'Mobile base',data:'平面位置・姿勢・移動経路の視覚化',note:'ROS /odom 読み取りとの接続例あり。'},
];
export default function SSGPage(){const builtAt=new Date().toISOString();return <div className="contentPage">
  <span className="eyebrow">STATIC SITE GENERATION</span><h1>SSG: ロボットカタログ</h1>
  <p className="lead">変更頻度が低い静的情報をビルド時にHTML化します。動的なテレメトリはここに含めません。</p>
  <div className="techGrid">{robots.map(r=><article key={r.name} className="techCard"><span className="overline">{r.role}</span><h2>{r.name}</h2><p>{r.data}</p><small>{r.note}</small></article>)}</div>
  <div className="infoPanel"><h2>Build timestamp</h2><code>{builtAt}</code><p>SSG用ページの生成時刻です。新しいビルドまで基本的に変わりません。`dynamic='force-static'` を使用。</p></div>
</div>;}
