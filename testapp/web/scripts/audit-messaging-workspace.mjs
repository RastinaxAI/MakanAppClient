// Bounded Test-only reproduction; no messages, invitations, privacy or membership writes.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
if (process.env.MAKAN_TEST_READ_SMOKE !== '1' || process.env.CI)
  throw Error('Explicit local operator opt-in required');
const backend = JSON.parse(await fs.readFile('config/network.json', 'utf8')).backendOrigin;
if (backend !== 'http://94.184.32.84:8090') throw Error('Only the designated Test is allowed');
const report = {
  checkedAtUtc: new Date().toISOString(),
  backend,
  role: 'Teacher',
  domainWrites: false,
  requests: [],
};
const writes = [
  '/api/v1/auth/otp/challenges',
  '/api/v1/auth/otp/verify',
  '/api/v1/workspaces/select',
  '/api/v1/auth/logout',
];
let token, original;
const safe = (v) => (typeof v === 'string' && /^[a-zA-Z0-9_:.\-]{1,160}$/.test(v) ? v : undefined);
async function call(path, body) {
  if (body !== undefined && !writes.includes(path)) throw Error('Domain write rejected');
  const r = await fetch(backend + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  const raw = await r.text();
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    value = null;
  }
  const row = {
    path: path.split('?')[0].replace(/\/[0-9a-f-]{36}(?=\/|$)/gi, '/{id}'),
    method: body === undefined ? 'GET' : 'POST',
    status: r.status,
  };
  if (!r.ok)
    Object.assign(row, {
      contentType: r.headers.get('content-type'),
      bodyBytes: Buffer.byteLength(raw),
      problemKeys: value && typeof value === 'object' ? Object.keys(value) : [],
      code: safe(value?.code ?? value?.extensions?.code) ?? null,
      traceId:
        safe(value?.traceId ?? value?.extensions?.traceId ?? r.headers.get('x-trace-id')) ?? null,
      correlationId:
        safe(
          value?.correlationId ??
            value?.extensions?.correlationId ??
            r.headers.get('x-correlation-id'),
        ) ?? null,
    });
  report.requests.push(row);
  return { row, value };
}
try {
  const c = await call('/api/v1/auth/otp/challenges', { phoneNumber: '09120000102' });
  const v = await call('/api/v1/auth/otp/verify', {
    phoneNumber: '09120000102',
    challengeId: c.value?.challengeId,
    code: '123456',
    deviceName: 'Messaging workspace read diagnosis',
  });
  token = v.value?.accessToken;
  if (!token) throw Error('Test authentication failed');
  original = (await call('/api/v1/workspaces/current')).value;
  const snapshot = (await call('/api/v1/workspaces/snapshot')).value;
  const inbox = (await call('/api/v1/conversations/account?Filter=All&Limit=30')).value;
  const target = inbox?.items?.find(
    (r) => r.scope === 'Organization' && ['Group', 'Channel'].includes(r.type),
  );
  if (!target) throw Error('No organization conversation sample');
  report.sample = {
    conversationHash: createHash('sha256').update(target.conversationId).digest('hex').slice(0, 12),
    scope: target.scope,
    type: target.type,
    includedInOwnAccountInbox: true,
  };
  const space = snapshot.workspaces.find(
    (w) =>
      w.workspaceType === 'Organization' &&
      w.organizationId === target.organizationId &&
      w.role === 'Teacher' &&
      w.canEnter,
  );
  if (!space) throw Error('No authorized matching workspace');
  await call('/api/v1/workspaces/select', {
    workspaceType: 'Personal',
    membershipId: null,
    role: null,
  });
  const beforeDetail = await call('/api/v1/conversations/' + target.conversationId);
  const beforeSummary = await call('/api/v1/conversations/' + target.conversationId + '/summary');
  await call('/api/v1/workspaces/select', {
    workspaceType: 'Organization',
    membershipId: space.membershipId,
    role: space.role,
  });
  const afterDetail = await call('/api/v1/conversations/' + target.conversationId);
  const afterSummary = await call('/api/v1/conversations/' + target.conversationId + '/summary');
  report.comparison = {
    personalDetail: beforeDetail.row,
    personalSummary: beforeSummary.row,
    organizationDetail: afterDetail.row,
    organizationSummary: afterSummary.row,
    returnedSameConversation:
      afterDetail.value?.conversationId === target.conversationId &&
      afterSummary.value?.conversationId === target.conversationId,
    activeParticipantAfterSelection:
      afterDetail.value?.participants?.some(
        (p) => p.user.userId === v.value.user.id && p.status === 'Active',
      ) ?? false,
  };
  report.reproduced =
    beforeDetail.row.status === 404 &&
    beforeSummary.row.status === 404 &&
    afterDetail.row.status === 200 &&
    afterSummary.row.status === 200;
  report.passed =
    report.reproduced &&
    report.comparison.returnedSameConversation &&
    report.comparison.activeParticipantAfterSelection;
} catch {
  report.error = 'Live sample or response validation could not complete';
} finally {
  if (token && original) {
    try {
      await call('/api/v1/workspaces/select', {
        workspaceType: original.workspaceType,
        membershipId: original.membershipId,
        role: original.activeRole,
      });
      report.contextRestored =
        JSON.stringify((await call('/api/v1/workspaces/current')).value) ===
        JSON.stringify(original);
    } catch {
      report.contextRestored = false;
    }
  }
  if (token) {
    try {
      report.logoutConfirmed = (await call('/api/v1/auth/logout', {})).row.status === 204;
    } catch {
      report.logoutConfirmed = false;
    }
  }
  await fs.writeFile(
    'docs/quality/MESSAGING_404_20261105_LIVE.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify({
    passed: report.passed,
    reproduced: report.reproduced,
    sample: report.sample,
    comparison: report.comparison,
    contextRestored: report.contextRestored,
    logoutConfirmed: report.logoutConfirmed,
  }),
);
if (!report.passed || !report.contextRestored || !report.logoutConfirmed) process.exitCode = 1;
