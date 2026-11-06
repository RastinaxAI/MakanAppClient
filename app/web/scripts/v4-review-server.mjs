// Disposable reference/fixture viewer. It never connects to the configured live backend.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fixtureBackend } from '../tests/fixtures/backend/server.mjs';
const appPort = 3158,
  backendPort = 3458,
  root = process.cwd();
const sessions = mkdtempSync(join(tmpdir(), 'makan-v4-review-'));
const backend = await fixtureBackend(backendPort);
const child = spawn(
  process.execPath,
  [
    join(root, 'node_modules/next/dist/bin/next'),
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    String(appPort),
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      MAKAN_TEST_MODE: 'fixture',
      MAKAN_REFERENCE_PREVIEW: 'true',
      APP_ORIGIN: `http://127.0.0.1:${appPort}`,
      BACKEND_BASE_URL: `http://127.0.0.1:${backendPort}`,
      SESSION_DIRECTORY: sessions,
      SESSION_SECRET: randomBytes(32).toString('hex'),
      COOKIE_SECURE: 'false',
    },
    stdio: 'inherit',
  },
);
let stopped = false;
function stop() {
  if (stopped) return;
  stopped = true;
  child.kill();
  backend.close();
  const target = resolve(sessions);
  if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('makan-v4-review-'))
    throw Error('Unexpected review directory');
  rmSync(target, { recursive: true, force: true });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop);
child.on('exit', (code) => {
  stop();
  process.exitCode = code ?? 1;
});
console.log('V4 reference review :3158; isolated fixture :3458. Live backend disabled.');
