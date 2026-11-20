export const dynamic='force-static';
export const revalidate=30;
export default function ISRPage(){const generatedAt=new Date().toISOString();return <div className="contentPage">
  <span className="eyebrow">INCREMENTAL STATIC REGENERATION</span><h1>ISR: 30秒キャッシュ</h1>
  <p className="lead">「レポートのような、頻繁なリアルタイム更新が不要な画面」に使います。このページは30秒を目安に再検証されます。</p>
  <div className="bigTimestamp"><span>GENERATED AT (UTC)</span><strong>{generatedAt}</strong></div>
  <div className="infoPanel"><h2>確認方法</h2><p><code>npm run build && npm run start</code> で本番モード起動後、このページを繰り返し読み込んでください。30秒経過後のアクセスで再生成され、後続リクエストで時刻の変化を確認できます。開発モードはキャッシュ挙動が異なります。</p></div>
</div>;}
