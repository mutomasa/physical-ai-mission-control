import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Next App Router has distinct rendering modes',()=>{
  assert.match(read('app/page.tsx'),/fetchSnapshot/);
  assert.match(read('app/ssr/page.tsx'),/force-dynamic/);
  assert.match(read('app/ssg/page.tsx'),/force-static/);
  assert.match(read('app/isr/page.tsx'),/revalidate\s*=\s*30/);
  assert.match(read('app/streaming/page.tsx'),/Suspense/);
});
test('actions and streaming APIs are implemented',()=>{
  assert.match(read('app/actions.ts'),/use server/);
  assert.match(read('app/api/stream/route.ts'),/ReadableStream/);
  assert.match(read('app/api/events/route.ts'),/text\/event-stream/);
});
test('browser streams and conceptual Three.js scene exist',()=>{
  assert.match(read('components/ClientDashboard.tsx'),/new WebSocket/);
  assert.match(read('components/ClientDashboard.tsx'),/new EventSource/);
  assert.match(read('components/RobotScene.tsx'),/Canvas/);
});
test('ROS adapter has no publishers or action clients',()=>{
  const bridge=read('ros_bridge/bridge.py');
  assert.match(bridge,/create_subscription/);
  assert.doesNotMatch(bridge,/self\.create_publisher\s*\(/);
  assert.doesNotMatch(bridge,/self\.create_client\s*\(/);
  assert.doesNotMatch(bridge,/ActionClient\s*\(/);
});
