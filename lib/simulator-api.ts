import 'server-only';
import { FALLBACK, type MissionSnapshot } from './types';
const API = process.env.SIM_HTTP_URL ?? 'http://127.0.0.1:8787';

export async function fetchSnapshot(): Promise<MissionSnapshot> {
  try {
    const response = await fetch(`${API}/snapshot`, {
      cache: 'no-store', signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) throw new Error('Simulator unavailable');
    return (await response.json()) as MissionSnapshot;
  } catch {
    return FALLBACK;
  }
}

export async function postMission(command: 'start' | 'stop'): Promise<{ok:boolean; message:string}> {
  const token = process.env.SIM_CONTROL_TOKEN;
  if (!token) return {ok:false,message:'SIM_CONTROL_TOKEN が未設定です。npm run setup を実行してください。'};
  try {
    const response = await fetch(`${API}/missions/${command}`, {
      method:'POST', headers:{'x-sim-token':token},
      cache:'no-store', signal: AbortSignal.timeout(3000),
    });
    const data = (await response.json()) as {message?:string};
    return {ok:response.ok,message:data.message ?? (response.ok?'OK':'操作に失敗')};
  } catch {
    return {ok:false,message:'シミュレータに接続できません。npm run sim を確認してください。'};
  }
}
