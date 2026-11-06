// Operator-only, bounded Test read audit. Never sends messages/invitations or changes privacy.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
if (process.env.MAKAN_TEST_READ_SMOKE !== '1' || process.env.CI)
  throw Error('Explicit local operator opt-in required');
const base = JSON.parse(await fs.readFile('config/network.json', 'utf8')).backendOrigin;
if (base !== 'http://94.184.32.84:8090') throw Error('Only the designated Test is allowed');
const output = process.env.MAKAN_TEST_REPORT || 'docs/quality/MESSAGING_20261105_LIVE.json';
const report = {
  checkedAtUtc: new Date().toISOString(),
  backend: base,
  domainWrites: false,
  roles: [],
  comparisons: [],
};
const sessions = [];
const label = (id) => createHash('sha256').update(String(id)).digest('hex').slice(0, 12);
const safePath = (p) => p.split('?')[0].replace(/\/[0-9a-f-]{36}(?=\/|$)/gi, '/{id}');
const writePaths = [
  '/api/v1/auth/otp/challenges',
  '/api/v1/auth/otp/verify',
  '/api/v1/auth/logout',
];
try {
  for (const [role, phone] of [
    ['Student', '09120000101'],
    ['Teacher', '09120000102'],
    ['Parent', '09120000103'],
    ['Manager', '09120000104'],
    ['Personal', '09120000199'],
  ]) {
    const row = { role, requests: [], managed: [] };
    const session = { row, token: null, ids: new Set(), invitations: [], details: [] };
    sessions.push(session);
    async function call(path, body) {
      if (body !== undefined && !writePaths.includes(path)) throw Error('Domain write rejected');
      const r = await fetch(base + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          ...(session.token ? { Authorization: 'Bearer ' + session.token } : {}),
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
      });
      const value = await r.json().catch(() => null);
      const code = value?.code ?? value?.extensions?.code;
      row.requests.push({
        path: safePath(path),
        method: body === undefined ? 'GET' : 'POST',
        status: r.status,
        ...(typeof code === 'string' && /^[A-Z0-9_]{1,100}$/.test(code) ? { code } : {}),
      });
      return { status: r.status, value };
    }
    session.call = call;
    const c = await call('/api/v1/auth/otp/challenges', { phoneNumber: phone });
    if (c.status !== 202) throw Error('Test challenge unavailable');
    const v = await call('/api/v1/auth/otp/verify', {
      phoneNumber: phone,
      challengeId: c.value.challengeId,
      code: '123456',
      deviceName: 'Messaging read audit',
    });
    if (v.status !== 200 || !v.value?.accessToken) throw Error('Test authentication unavailable');
    session.token = v.value.accessToken;
    session.userId = v.value.user.id;
    session.before = (await call('/api/v1/workspaces/current')).value;
    const privacy = await call('/api/v1/messaging/privacy');
    if (privacy.status === 200)
      row.privacy = Object.fromEntries(
        [
          'directMessagesAudience',
          'phoneNumberVisibilityAudience',
          'phoneNumberDiscoveryAudience',
          'groupInvitesAudience',
          'onlineAudience',
          'lastSeenAudience',
          'isExplicit',
        ]
          .filter((k) => privacy.value[k] !== undefined)
          .map((k) => [k, privacy.value[k]]),
      );
    const status = await call('/api/v1/me/messaging-status');
    row.allowedActions = status.value?.allowedActions;
    const invitations = await call('/api/v1/messaging/invitations');
    if (Array.isArray(invitations.value)) session.invitations = invitations.value;
    row.invitations = {
      status: invitations.status,
      count: session.invitations.length,
      pending: session.invitations.filter((i) => i.status === 'Pending').length,
      incomingPending: session.invitations.filter(
        (i) => i.status === 'Pending' && i.targetUserId === session.userId,
      ).length,
    };
    let cursor = null,
      rows = [];
    for (let page = 0; page < 4; page++) {
      const q = new URLSearchParams({
        Filter: 'All',
        Limit: '30',
        ...(cursor ? { Cursor: cursor } : {}),
      });
      const r = await call('/api/v1/conversations/account?' + q);
      if (r.status !== 200 || !Array.isArray(r.value?.items))
        throw Error('Account inbox unavailable');
      rows.push(...r.value.items);
      row.inboxComplete = !r.value.hasMore;
      if (!r.value.hasMore || !r.value.nextCursor || r.value.nextCursor === cursor) break;
      cursor = r.value.nextCursor;
    }
    session.ids = new Set(rows.map((r) => r.conversationId));
    row.inbox = {
      loaded: session.ids.size,
      types: Object.fromEntries(
        ['Direct', 'Group', 'Channel', 'Saved'].map((t) => [
          t,
          rows.filter((r) => r.type === t).length,
        ]),
      ),
    };
    for (const item of rows.filter((r) => ['Group', 'Channel'].includes(r.type)).slice(0, 12)) {
      const d = await call('/api/v1/conversations/' + item.conversationId);
      if (d.status !== 200) {
        row.managed.push({
          conversation: label(item.conversationId),
          type: item.type,
          detailStatus: d.status,
        });
        continue;
      }
      session.details.push(d.value);
      row.managed.push({
        conversation: label(item.conversationId),
        type: item.type,
        scope: item.scope,
        titleMatchesUserScreenshot: ['یک', 'یکا'].includes(item.title),
        activeMembers: d.value.participants?.filter((p) => p.status === 'Active').length ?? 0,
        ownerOnly:
          d.value.participants
            ?.filter((p) => p.status === 'Active')
            .every((p) => p.role === 'Owner') ?? false,
        initialTargets: (d.value.initialTargets ?? []).map((t) => ({
          target: label(t.targetUserId),
          outcome: t.outcome,
          hasInvitation: !!t.invitationId,
          expired: !!t.invitationExpiresAtUtc && Date.parse(t.invitationExpiresAtUtc) <= Date.now(),
        })),
      });
    }
    report.roles.push(row);
  }
  for (const source of sessions)
    for (const detail of source.details) {
      for (const target of sessions.filter((s) => s !== source)) {
        const participant = detail.participants?.find((p) => p.user.userId === target.userId);
        const receipt = detail.initialTargets?.find((t) => t.targetUserId === target.userId);
        const invitation = target.invitations.find(
          (i) => i.conversationId === detail.conversationId && i.targetUserId === target.userId,
        );
        if (!participant && !receipt && !invitation) continue;
        const check = {
          source: source.row.role,
          target: target.row.role,
          conversation: label(detail.conversationId),
          type: detail.type,
          participantStatus: participant?.status ?? null,
          receipt: receipt?.outcome ?? null,
          recipientInvitation: invitation?.status ?? null,
          recipientInboxContains: target.ids.has(detail.conversationId),
          recipientInboxComplete: target.row.inboxComplete,
        };
        if (participant?.status === 'Active' && !check.recipientInboxContains)
          check.recipientSummaryStatus = (
            await target.call('/api/v1/conversations/' + detail.conversationId + '/summary')
          ).status;
        report.comparisons.push(check);
      }
    }
} catch {
  report.error = 'Audit could not complete; no domain write was attempted';
} finally {
  for (const s of sessions)
    if (s.token) {
      try {
        s.row.contextPreserved =
          JSON.stringify((await s.call('/api/v1/workspaces/current')).value) ===
          JSON.stringify(s.before);
        s.row.logoutConfirmed = (await s.call('/api/v1/auth/logout', {})).status === 204;
      } catch {
        s.row.logoutConfirmed = false;
      }
    }
  await fs.mkdir('docs/quality', { recursive: true });
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
}
console.log(
  JSON.stringify({
    output,
    roles: report.roles.map((r) => ({
      role: r.role,
      privacy: r.privacy,
      invitations: r.invitations,
      inbox: r.inbox,
    })),
    comparisons: report.comparisons,
    error: report.error,
  }),
);
if (report.error) process.exitCode = 1;
