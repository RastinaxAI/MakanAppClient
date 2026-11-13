import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  seal,
  unseal,
  writeSession,
  readSession,
  withSessionLock,
  validSessionId,
  recordSessionActivity,
  cookieOptions,
  sessionIdleSeconds,
  type Session,
} from '@/lib/server/session';
let directory: string;
const id = '00000000-0000-4000-8000-000000000001';
const sample: Session = {
  accessToken: 'fixture-secret-a',
  refreshToken: 'fixture-secret-r',
  expiresAtUtc: '2099-01-01T00:00:00Z',
  refreshExpiresAtUtc: '2099-02-01T00:00:00Z',
  revision: 'revision',
};
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'makan-unit-'));
  process.env.SESSION_DIRECTORY = directory;
  process.env.SESSION_SECRET = randomBytes(32).toString('hex');
});
afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});
afterEach(() => vi.useRealTimers());
describe('Server-only session storage', () => {
  it('authenticates ciphertext and does not persist cleartext tokens', () => {
    const data = seal(sample);
    expect(data.includes(Buffer.from(sample.accessToken))).toBe(false);
    expect(unseal(data)).toEqual(sample);
    data[30] ^= 1;
    expect(() => unseal(data)).toThrow();
  });
  it('rejects cookie traversal', async () => {
    expect(validSessionId('../other')).toBe(false);
    expect(await readSession('../other')).toBeNull();
  });
  it('persists encrypted sessions and reads them', async () => {
    await writeSession(id, sample);
    expect(await readSession(id)).toEqual(sample);
  });
  it('serializes a session and releases locks after errors', async () => {
    let concurrent = 0,
      max = 0;
    await Promise.all(
      Array.from({ length: 5 }, () =>
        withSessionLock(id, async () => {
          concurrent++;
          max = Math.max(max, concurrent);
          await new Promise((resolve) => setTimeout(resolve, 2));
          concurrent--;
        }),
      ),
    );
    expect(max).toBe(1);
    await expect(
      withSessionLock(id, async () => {
        throw new Error('expected');
      }),
    ).rejects.toThrow('expected');
    expect(await withSessionLock(id, async () => true)).toBe(true);
  });
  it('expires stale refresh sessions', async () => {
    await writeSession(id, { ...sample, refreshExpiresAtUtc: '2000-01-01T00:00:00Z' });
    expect(await readSession(id)).toBeNull();
  });
  it('rejects obsolete staged-login records', async () => {
    await writeSession(id, Object.assign({}, sample, { phase: 'obsolete-stage' }));
    expect(await readSession(id)).toBeNull();
  });
  it('renews the inactivity deadline after a return on day 20 without changing rotated backend credentials', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = new Date('2026-11-14T10:00:00Z');
    vi.setSystemTime(start);
    await writeSession(id, { ...sample, lastActivityAtUtc: start.toISOString() });
    vi.setSystemTime(start.getTime() + 20 * 86400000);
    // The caller has just validated the account and committed upstream token rotation.
    await withSessionLock(id, async () => {
      const rotated = {
        ...(await readSession(id))!,
        refreshToken: 'rotated-test-token',
        revision: 'new-revision',
      };
      await writeSession(id, rotated);
      await recordSessionActivity(id);
    });
    vi.setSystemTime(start.getTime() + 49 * 86400000);
    expect((await readSession(id))?.refreshToken).toBe('rotated-test-token');
    expect((await readSession(id))?.revision).toBe('new-revision');
    vi.setSystemTime(start.getTime() + 50 * 86400000);
    expect(await readSession(id)).toBeNull();
  });
  it('passive reads never keep a session alive past 30 days of inactivity', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = new Date('2026-11-14T10:00:00Z');
    vi.setSystemTime(start);
    await writeSession(id, { ...sample, lastActivityAtUtc: start.toISOString() });
    vi.setSystemTime(start.getTime() + 29 * 86400000);
    expect((await readSession(id))?.lastActivityAtUtc).toBe(start.toISOString());
    vi.setSystemTime(start.getTime() + 30 * 86400000);
    expect(await readSession(id)).toBeNull();
    expect(await recordSessionActivity(id)).toBeNull();
  });
  it('caps the persistent HttpOnly cookie at real upstream refresh expiry and 30 days', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T10:00:00Z'));
    expect(cookieOptions().maxAge).toBe(30 * 86400);
    expect(cookieOptions('2099-01-01T00:00:00Z').maxAge).toBe(sessionIdleSeconds);
    expect(cookieOptions('2026-11-15T10:00:00Z')).toMatchObject({
      maxAge: 86400,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });
    expect(cookieOptions('2026-11-13T10:00:00Z').maxAge).toBe(0);
  });
  it('migrates a valid legacy session on verified use, but never revives an expired backend credential', async () => {
    await writeSession(id, sample);
    expect(
      (await withSessionLock(id, () => recordSessionActivity(id)))?.lastActivityAtUtc,
    ).toBeTruthy();
    await writeSession(id, { ...sample, refreshExpiresAtUtc: '2000-01-01T00:00:00Z' });
    expect(await recordSessionActivity(id)).toBeNull();
  });
});
