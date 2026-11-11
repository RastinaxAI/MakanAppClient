import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ state: vi.fn(), read: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/server/client-session', () => ({
  clientSessionId: async () => 'ai-bff-test',
  getClientState: mocks.state,
}));
vi.mock('@/lib/server/session', async (original) => ({
  ...(await original<typeof import('@/lib/server/session')>()),
  readSession: mocks.read,
}));
vi.mock('@/lib/server/backend', async (original) => ({
  ...(await original<typeof import('@/lib/server/backend')>()),
  checkOrigin: () => true,
  authenticatedFetch: mocks.fetch,
}));
import { GET, POST } from '@/app/api/client/backend/[...path]/route';
const classId = '00000000-0000-4000-8000-000000000002',
  id = '00000000-0000-4000-8000-000000009900';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.state.mockResolvedValue({
    revision: 'current',
    context: { workspaceType: 'Organization', organizationId: classId },
  });
  mocks.read.mockResolvedValue({ revision: 'current' });
  mocks.fetch.mockResolvedValue({
    response: Response.json(
      { code: 'AI_UNAVAILABLE', requestId: 'r', correlationId: 'c' },
      { status: 503 },
    ),
  });
});
async function call(
  path: string,
  headers: Record<string, string> = {},
  body?: unknown,
  method = 'POST',
) {
  return (method === 'GET' ? GET : POST)(
    new Request('http://localhost/api/client/backend' + path, {
      method,
      headers: { 'X-Makan-Context': 'current', 'Content-Type': 'application/json', ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    { params: Promise.resolve({ path: path.split('?')[0].slice(1).split('/') }) },
  );
}
it('preserves operation and payer headers on bodyless AI calls, excluding client credentials and internal overrides', async () => {
  const path = `/api/v1/ai/teachers/classes/${classId}/summary`;
  const response = await call(path, {
    'X-AI-Operation-Id': id,
    'X-AI-Payer': 'Individual',
    Authorization: 'untrusted',
    'X-AI-Contract-Version': 'unsafe',
    'X-Internal-Tenant': 'untrusted',
  });
  expect(response.status).toBe(503);
  const options = mocks.fetch.mock.calls[0][3];
  const headers = new Headers(options.headers);
  expect(headers.get('X-AI-Operation-Id')).toBe(id);
  expect(headers.get('X-AI-Payer')).toBe('Individual');
  expect(headers.has('Authorization')).toBe(false);
  expect(headers.has('X-AI-Contract-Version')).toBe(false);
  expect(headers.has('X-Internal-Tenant')).toBe(false);
  expect(await response.json()).toMatchObject({ requestId: 'r', correlationId: 'c' });
});
it('rejects invalid or conflicting operation IDs and invalid payer choices before upstream traffic', async () => {
  const path = '/api/v1/ai/chat',
    body = { message: 'پرسش', conversationId: null, operationId: id };
  expect((await call(path, { 'X-AI-Operation-Id': 'bad' }, body)).status).toBe(400);
  expect((await call(path, { 'X-AI-Payer': 'Platform' }, body)).status).toBe(400);
  expect((await call(path, { 'X-AI-Operation-Id': classId }, body)).status).toBe(400);
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it('accepts a numeric knowledge version path and validates malformed versions before forwarding', async () => {
  const path = `/api/v1/sources/${classId}/versions/3/knowledge/status`;
  expect((await call(path, {}, undefined, 'GET')).status).toBe(503);
  expect(mocks.fetch.mock.calls[0][2]).toBe(path);
  mocks.fetch.mockClear();
  for (const version of ['3.5', 'NaN', '1e2'])
    expect(
      (await call(path.replace('/3/', '/' + version + '/'), {}, undefined, 'GET')).status,
    ).toBe(400);
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it('does not forward business-AI headers to knowledge requests and rejects empty source allowlists', async () => {
  const body = {
    clientOperationId: id,
    query: 'پرسش',
    sources: [{ sourceId: classId, version: 3 }],
    payer: 'Individual',
  };
  const path = '/api/v1/ai/knowledge/retrieve';
  expect(
    (await call(path, { 'X-AI-Operation-Id': id, 'X-AI-Payer': 'Organization' }, body)).status,
  ).toBe(503);
  expect(new Headers(mocks.fetch.mock.calls[0][3].headers).has('X-AI-Payer')).toBe(false);
  mocks.fetch.mockClear();
  expect((await call(path, {}, { ...body, sources: [] })).status).toBe(400);
  expect(mocks.fetch).not.toHaveBeenCalled();
});
