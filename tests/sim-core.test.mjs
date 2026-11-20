import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEngine,stageFor,poseFor,MISSION_SECONDS} from '../scripts/sim-core.mjs';

test('idle has no movement',()=>{
  const e=makeEngine();e.tick(10);
  assert.equal(e.snapshot().progress,0);
  assert.equal(e.snapshot().status,'idle');
});
test('mission traverses phases and completes',()=>{
  const e=makeEngine();assert.equal(e.start().ok,true);
  for(let i=0;i<MISSION_SECONDS;i++) e.tick(1);
  assert.equal(e.snapshot().status,'completed');
  assert.equal(e.snapshot().progress,100);
  assert.equal(stageFor(50),'SO-101: 荷物を積載（概念動作）');
  assert.ok(poseFor(100).tb3.x>poseFor(0).tb3.x);
});
test('stop freezes progress and restart resets',()=>{
  const e=makeEngine();e.start();e.tick(1);
  const progress=e.snapshot().progress;
  e.stop();e.tick(1);assert.equal(e.snapshot().progress,progress);
  e.start();assert.equal(e.snapshot().progress,0);
});
test('ROS overlay is read-only, expires conceptually after five seconds',()=>{
  const e=makeEngine();e.setRos({tb3:{x:1,z:2,yaw:0}});
  assert.equal(e.snapshot().source,'ros2');
  assert.equal(e.snapshot().tb3.x,1);
  assert.equal(e.start().ok,false);
});
