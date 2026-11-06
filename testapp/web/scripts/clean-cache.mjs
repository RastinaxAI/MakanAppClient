// Removes disposable tooling output; never application builds, secrets or sessions.
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
if (['.next/dev/lock', '.next/lock'].some((name) => existsSync(resolve(root, name))))
  throw Error('Stop the development server or build before clearing its cache.');
for (const name of [
  '.next/cache',
  '.next/dev',
  'test-results',
  'playwright-report',
  'tsconfig.tsbuildinfo',
]) {
  await rm(resolve(root, name), { recursive: true, force: true });
  console.log('Cleared ' + name);
}
