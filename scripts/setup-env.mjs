import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
const path = new URL('../.env.local', import.meta.url);
if (existsSync(path)) {
  console.log('.env.local exists; keeping it unchanged.');
} else {
  const token = randomBytes(32).toString('hex');
  writeFileSync(path,
`SIM_HTTP_URL=http://127.0.0.1:8787
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8787/ws
SIM_CONTROL_TOKEN=${token}
`);
  console.log('Created .env.local with a randomly generated local control token.');
}
