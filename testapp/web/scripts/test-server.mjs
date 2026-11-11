import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { join, resolve, dirname, basename } from 'node:path';
import { fixtureBackend } from '../tests/fixtures/backend/server.mjs';
const ordinaryRuntime = process.argv.includes('--ordinary-runtime'),
  appPort = ordinaryRuntime ? 3159 : 3132,
  backendPort = ordinaryRuntime ? 3459 : 3457,
  root = process.cwd(),
  sessions = mkdtempSync(join(tmpdir(), 'makan-isolated-'));
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
      MAKAN_TEST_MODE: ordinaryRuntime ? '' : 'fixture',
      MAKAN_REFERENCE_PREVIEW: 'false',
      APP_ORIGIN: `http://127.0.0.1:${appPort}`,
      BACKEND_BASE_URL: `http://127.0.0.1:${backendPort}`,
      SESSION_DIRECTORY: sessions,
      SESSION_SECRET: randomBytes(32).toString('hex'),
      COOKIE_SECURE: 'false',
    },
    stdio: 'inherit',
    windowsHide: true,
  },
);
let stopped = false;
function stop() {
  if (stopped) return;
  stopped = true;
  child.kill();
  backend.close();
  const target = resolve(sessions);
  if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('makan-isolated-'))
    throw Error('Unexpected test directory');
  rmSync(target, { recursive: true, force: true });
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
child.on('exit', (code) => {
  stop();
  process.exitCode = code ?? 1;
});
console.log(
  `ISOLATED BACKEND :${backendPort}; APP :${appPort}; ${ordinaryRuntime ? 'ordinary' : 'fixture'} runtime. No external service calls.`,
);
