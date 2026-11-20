export type MissionStatus = 'idle' | 'running' | 'completed' | 'stopped';
export type TelemetrySource = 'simulator' | 'ros2' | 'offline';
export interface RobotSnapshot {
  x: number;
  z: number;
  yaw: number;
}
export interface MissionSnapshot {
  source: TelemetrySource;
  status: MissionStatus;
  phase: string;
  progress: number;
  elapsedSeconds: number;
  updatedAt: string;
  tb3: RobotSnapshot;
  arm: { shoulder: number; elbow: number; wrist: number; grip: number };
  rosLastSeenAt: string | null;
}
export interface MissionEvent {
  id: number;
  kind: string;
  message: string;
  at: string;
  progress: number;
}
export const FALLBACK: MissionSnapshot = {
  source: 'offline', status: 'idle', phase: 'シミュレータ未接続',
  progress: 0, elapsedSeconds: 0, updatedAt: '—',
  tb3: { x: -3, z: 0, yaw: 0 },
  arm: { shoulder: 0, elbow: 0, wrist: 0, grip: 0.35 },
  rosLastSeenAt: null,
};
