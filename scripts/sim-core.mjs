export const MISSION_SECONDS = 24;
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const mix = (a,b,t) => a + (b-a) * clamp(t, 0, 1);
const smooth = t => { const x=clamp(t,0,1); return x*x*(3-2*x); };

export function stageFor(progress) {
  if (progress < 35) return 'TB3: ドッキング地点に接近';
  if (progress < 68) return 'SO-101: 荷物を積載（概念動作）';
  if (progress < 100) return 'TB3: 搬送先へ走行';
  return 'ミッション完了';
}

export function poseFor(progress) {
  const p = clamp(progress,0,100);
  const x = p < 35 ? mix(-3,-1.1,smooth(p/35))
    : p < 68 ? -1.1
    : mix(-1.1,2.5,smooth((p-68)/32));
  const t = smooth((p-35)/33);
  const arc = Math.sin(Math.PI*t);
  return {
    tb3:{x,z:0,yaw:0},
    arm:{shoulder: 0.10 + 0.34*arc, elbow:-0.32-0.68*arc,
      wrist:0.15+0.3*arc, grip: p>48&&p<63 ? 0.07 : 0.30},
  };
}

export function makeEngine() {
  let status = 'idle';
  let elapsedSeconds = 0;
  let ros = null;
  let rosSeen = 0;
  let updatedAt = new Date().toISOString();
  return {
    start() {
      if (ros && Date.now()-rosSeen < 5000) return {ok:false, message:'ROS 2 表示中は模擬ミッション操作を無効にしています。'};
      elapsedSeconds=0; status='running';
      return {ok:true,message:'模擬ミッションを開始しました（実機への指令なし）。'};
    },
    stop() {
      if (ros && Date.now()-rosSeen < 5000) return {ok:false, message:'ROS 2 表示中は模擬ミッション操作を無効にしています。'};
      status='stopped';
      return {ok:true,message:'模擬ミッションを停止しました。'};
    },
    tick(dtSeconds) {
      if (status === 'running') {
        elapsedSeconds = Math.min(MISSION_SECONDS, elapsedSeconds + clamp(dtSeconds,0,1));
        if (elapsedSeconds >= MISSION_SECONDS) status='completed';
      }
      updatedAt = new Date().toISOString();
    },
    setRos(payload) { ros=payload; rosSeen=Date.now(); },
    snapshot() {
      const p = Math.round(elapsedSeconds / MISSION_SECONDS * 100);
      const generated = poseFor(p);
      const active = Boolean(ros && Date.now()-rosSeen < 5000);
      return {
        source: active?'ros2':'simulator', status,
        phase: status==='stopped'?'ミッション停止':status==='idle'?'開始待機':stageFor(p),
        progress:p, elapsedSeconds:Math.round(elapsedSeconds*10)/10,
        updatedAt,
        tb3:active && ros.tb3 ? ros.tb3 : generated.tb3,
        arm:active && ros.arm ? {...generated.arm,...ros.arm} : generated.arm,
        rosLastSeenAt: active ? new Date(rosSeen).toISOString():null,
      };
    }
  };
}
