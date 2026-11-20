import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
if (!existsSync(path.join(root,'.env.local'))) {
  console.error('Run `npm run setup` first.');
  process.exit(1);
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
for (const name of ['sim','dev']) {
  const p = spawn(npm, ['run', name], { cwd:root, stdio:'inherit', shell: process.platform === 'win32' });
  children.push(p);
  p.on('error', err => { console.error(`${name} failed:`, err.message); shutdown(1); });
  p.on('exit', code => { if (!stopping) shutdown(code || 0); });
}
let stopping = false;
function shutdown(code=0) {
  if (stopping) return;
  stopping = true;
  for (const p of children) if (p.exitCode === null) p.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250).unref();
}
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
