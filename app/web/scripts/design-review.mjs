import { readFileSync, mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const next = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const mode = process.argv.includes('--production') ? 'start' : 'dev';
const port = Number(process.env.MAKAN_DEV_PORT || 3130);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error('Invalid local Next.js port');
const sessions = join(root, '.makan-qa-sessions');
mkdirSync(sessions, { recursive: true, mode: 0o700 });
let secret = process.env.SESSION_SECRET;
if (!secret) {
  const keyFile = join(sessions, '.development-key');
  try {
    const descriptor = openSync(keyFile, 'wx', 0o600);
    try {
      writeFileSync(descriptor, randomBytes(32).toString('hex'));
    } finally {
      closeSync(descriptor);
    }
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  secret = readFileSync(keyFile, 'utf8').trim();
}
if (!/^[a-f0-9]{64}$/i.test(secret))
  throw Error('Invalid local session key; existing file was preserved');
const child = spawn(
  process.execPath,
  [next, mode, '--hostname', '127.0.0.1', '--port', String(port)],
  {
    cwd: root,
    env: {
      ...process.env,
      // Use the same backend as the deployed client.
      BACKEND_BASE_URL:
        process.env.BACKEND_BASE_URL ||
        JSON.parse(readFileSync('config/network.json', 'utf8')).backendOrigin,
      APP_ORIGIN: `http://127.0.0.1:${port}`,
      SESSION_DIRECTORY: sessions,
      SESSION_SECRET: secret,
      COOKIE_SECURE: 'false',
      MAKAN_TEST_MODE: '',
      MAKAN_REFERENCE_PREVIEW: 'false',
    },
    stdio: 'inherit',
    windowsHide: true,
  },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
