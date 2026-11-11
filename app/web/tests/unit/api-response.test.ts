import { afterEach, it, expect, vi } from 'vitest';
import { request } from '@/lib/api/client';
afterEach(() => vi.unstubAllGlobals());
it('rejects a successful HTML/invalid JSON response as a contract problem', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response('<html>error</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    ),
  );
  await expect(request('/api/client/session')).rejects.toMatchObject({
    status: 502,
    problem: { code: 'CONTRACT_MISMATCH' },
  });
});
it('discards a response body belonging to an older account', async () => {
  let current = true;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => {
        current = false;
        return { private: 'previous account' };
      },
    }),
  );
  await expect(
    request('/api/client/session', {}, { revision: 'old', isCurrent: () => current }),
  ).rejects.toMatchObject({ name: 'AbortError' });
});
it.each([200, 201, 202])(
  'does not treat HTTP %i as the required completed 204 acknowledgment',
  async (status) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          status === 202
            ? new Response(null, { status })
            : Response.json({ accepted: true }, { status }),
        ),
    );
    await expect(
      request('/api/client/backend/resource', { method: 'DELETE', expectedStatus: 204 }),
    ).rejects.toMatchObject({ status: 502, problem: { code: 'CONTRACT_MISMATCH' } });
  },
);
it('accepts the required empty 204 acknowledgment', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  await expect(
    request('/api/client/backend/resource', { method: 'DELETE', expectedStatus: 204 }),
  ).resolves.toBeUndefined();
});
it('keeps an existing asynchronous 202 caller unchanged when no completed status is required', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
  await expect(
    request('/api/client/backend/resource', { method: 'POST' }),
  ).resolves.toBeUndefined();
});
