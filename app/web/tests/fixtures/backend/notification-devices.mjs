import { id, make } from './state.mjs';
// Declared loopback-only web-push fixture. Its upsert/version behavior is a
// test model, not evidence of production delivery or undocumented idempotency.
export function seedNotificationDevices(state, options = {}) {
  state.webPushConfigured = options.configured !== false;
  state.pushDevices = new Map();
  const userId = options.userId ?? id(101);
  const rows = options.rows ?? [
    {
      id: id(39000),
      platform: 'Android',
      createdAtUtc: '2026-11-05T10:00:00Z',
      lastSeenAtUtc: '2026-11-05T10:00:00Z',
      revokedAtUtc: null,
      isActive: true,
      version: '1',
    },
  ];
  for (const row of rows)
    state.pushDevices.set(row.id, {
      userId,
      row: make('PushDeviceListItem', row),
      endpoint: null,
    });
}
export function notificationDevicesRoute({ state, auth, url, req, body, send }) {
  const root = '/api/v1/notifications/devices',
    p = url.pathname;
  if (p !== root && p !== root + '/web-push' && !new RegExp('^' + root + '/[^/]+$').test(p))
    return false;
  if (p.endsWith('/configuration')) return false;
  state.pushDevices ??= new Map();
  const userId = auth.user.id;
  if (p === root && req.method === 'GET') {
    const page = Number(url.searchParams.get('page') ?? 1),
      pageSize = Number(url.searchParams.get('pageSize') ?? 30);
    const rows = [...state.pushDevices.values()]
      .filter((value) => value.userId === userId)
      .map((value) => value.row)
      .filter(
        (row) => url.searchParams.get('includeRevoked') === 'true' || row.revokedAtUtc === null,
      );
    return send(
      make('PushDevicePageResult', {
        items: rows.slice((page - 1) * pageSize, page * pageSize),
        page,
        pageSize,
        totalCount: rows.length,
      }),
    );
  }
  if (p === root + '/web-push' && req.method === 'POST') {
    if (!state.webPushConfigured) return send({ code: 'WEB_PUSH_UNAVAILABLE' }, 503);
    if (!body.endpoint?.startsWith('https://') || !body.p256dh || !body.auth)
      return send({ code: 'INVALID_SUBSCRIPTION' }, 400);
    let value = [...state.pushDevices.values()].find((value) => value.endpoint === body.endpoint);
    if (value && value.userId !== userId) return send({ code: 'SUBSCRIPTION_CONFLICT' }, 409);
    if (value && body.expectedVersion !== value.row.version)
      return send({ code: 'VERSION_CONFLICT' }, 409);
    if (!value) {
      if (body.expectedVersion != null) return send({ code: 'VERSION_CONFLICT' }, 409);
      const registrationId = id(39100 + state.pushDevices.size);
      value = {
        userId,
        endpoint: body.endpoint,
        row: make('PushDeviceListItem', {
          id: registrationId,
          platform: 'Web',
          createdAtUtc: '2026-11-05T11:00:00Z',
          lastSeenAtUtc: '2026-11-05T11:00:00Z',
          isActive: true,
          revokedAtUtc: null,
          version: '1',
        }),
      };
      state.pushDevices = new Map([[registrationId, value], ...state.pushDevices]);
    } else
      Object.assign(value.row, {
        isActive: true,
        revokedAtUtc: null,
        version: String(Number(value.row.version) + 1),
      });
    const { id: registrationId, platform, createdAtUtc, lastSeenAtUtc, version } = value.row;
    return send(
      make('PushDeviceRegistrationResult', {
        id: registrationId,
        platform,
        createdAtUtc,
        lastSeenAtUtc,
        version,
      }),
    );
  }
  if (req.method === 'DELETE' && p.startsWith(root + '/')) {
    const value = state.pushDevices.get(p.split('/').at(-1));
    if (!value || value.userId !== userId) return send({ code: 'NOT_FOUND' }, 404);
    Object.assign(value.row, {
      revokedAtUtc: '2026-11-05T12:00:00Z',
      isActive: false,
      version: String(Number(value.row.version) + 1),
    });
    return send(undefined, 204);
  }
  return false;
}
