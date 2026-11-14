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
let runner;
function stop() {
  if (stopped) return;
  stopped = true;
  runner?.kill();
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
  const unexpected = !stopped;
  stop();
  if (unexpected) process.exitCode = code ?? 1;
});
console.log(
  `ISOLATED BACKEND :${backendPort}; APP :${appPort}; ${ordinaryRuntime ? 'ordinary' : 'fixture'} runtime. No external service calls.`,
);
if (process.argv.includes('--cypress')) {
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60 && !stopped; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${appPort}/enter`, {
          signal: AbortSignal.timeout(1000),
        });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw Error('Isolated Next app did not become ready. Run npm run build first.');
    runner = spawn(
      process.execPath,
      [
        join(root, 'node_modules/cypress/bin/cypress'),
        'run',
        '--e2e',
        '--browser',
        'chrome',
        ...process.argv.slice(process.argv.indexOf('--cypress') + 1),
      ],
      { cwd: root, env: { ...process.env, TZ: 'Asia/Tehran' }, stdio: 'inherit' },
    );
    runner.on('error', (error) => {
      console.error(error.message);
      process.exitCode = 1;
      stop();
    });
    runner.on('exit', (code) => {
      process.exitCode = code ?? 1;
      stop();
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    stop();
  }
}
