// Test-only UI/context validation; message history and all domain mutations are blocked.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, request } from '@playwright/test';
if (process.env.MAKAN_TEST_READ_SMOKE !== '1' || process.env.CI)
  throw Error('Explicit local operator opt-in required');
const backend = JSON.parse(await fs.readFile('config/network.json', 'utf8')).backendOrigin;
if (backend !== 'http://94.184.32.84:8090') throw Error('Only the designated Test is allowed');
const origin = 'http://127.0.0.1:3145',
  shots = 'output/review/messaging-context-20261105/live';
const report = {
  checkedAtUtc: new Date().toISOString(),
  backend,
  role: 'Teacher',
  domainWrites: false,
  messageHistoryRead: false,
  requests: [],
  screenshots: [],
  blockedMessageReads: 0,
  blockedDomainWrites: 0,
  metadataBeforeSelection: 0,
  pageErrors: 0,
};
const api = await request.newContext({ baseURL: origin });
const browser = await chromium.launch({ channel: 'chrome' });
let context, revision, original;
const safePath = (p) => p.split('?')[0].replace(/\/[0-9a-f-]{36}(?=\/|$)/gi, '/{id}');
async function call(path, data) {
  if (
    data !== undefined &&
    ![
      '/api/client/auth/challenge',
      '/api/client/auth/verify',
      '/api/client/auth/logout',
      '/api/client/backend/api/v1/workspaces/select',
    ].includes(path)
  )
    throw Error('Domain write rejected');
  const r = await api.fetch(path, {
    method: data === undefined ? 'GET' : 'POST',
    headers: { Origin: origin, ...(revision ? { 'X-Makan-Context': revision } : {}) },
    ...(data === undefined ? {} : { data }),
    timeout: 25000,
  });
  const value = await r.json().catch(() => null);
  report.requests.push({ path: safePath(path), status: r.status() });
  if (r.status() >= 400) throw Error('Connected read failed');
  return value;
}
try {
  const c = await call('/api/client/auth/challenge', { phoneNumber: '09120000102' });
  await call('/api/client/auth/verify', {
    phoneNumber: '09120000102',
    challengeId: c.challengeId,
    code: '123456',
    deviceName: 'Messaging workspace UI read',
  });
  let session = await call('/api/client/session');
  revision = session.revision;
  original = session.context;
  await call('/api/client/backend/api/v1/workspaces/select', {
    workspaceType: 'Personal',
    membershipId: null,
    role: null,
  });
  session = await call('/api/client/session');
  revision = session.revision;
  const rows = (await call('/api/client/backend/api/v1/conversations/account?Filter=All&Limit=30'))
    .items;
  const target = rows.find(
    (r) => r.scope === 'Organization' && ['Group', 'Channel'].includes(r.type),
  );
  if (!target) throw Error('Organization sample unavailable');
  report.conversationHash = createHash('sha256')
    .update(target.conversationId)
    .digest('hex')
    .slice(0, 12);
  context = await browser.newContext({ baseURL: origin, storageState: await api.storageState() });
  await context.addInitScript(() => localStorage.setItem('makan:pwa-install-dismissed:v1', '1'));
  let selecting = false;
  await context.route('**/api/client/**', (route) => {
    const req = route.request(),
      p = new URL(req.url()).pathname;
    if (p === `/api/client/backend/api/v1/conversations/${target.conversationId}` && !selecting)
      report.metadataBeforeSelection++;
    if (req.method() === 'GET' && /\/conversations\/[^/]+\/messages/.test(p)) {
      report.blockedMessageReads++;
      return route.abort();
    }
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method()) &&
      !p.startsWith('/api/client/hub') &&
      p !== '/api/client/backend/api/v1/workspaces/select'
    ) {
      report.blockedDomainWrites++;
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', () => report.pageErrors++);
  await fs.mkdir(shots, { recursive: true });
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((v) => localStorage.setItem('makan-theme', v), theme);
      await page.goto('/personal/messages');
      const row = page.locator(`a[href^="/personal/messages/${target.conversationId}?"]`);
      await row.click();
      const notice = page.locator('[data-conversation-workspace]');
      await notice.getByRole('button', { name: /انتخاب فضا و باز کردن گفتگو/ }).waitFor();
      if ((await row.count()) !== 1) throw Error('Inbox row disappeared');
      const actualTheme = await page.locator('html').getAttribute('data-theme'),
        overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        alerts = await page.locator('main [role=alert]').count();
      if (actualTheme !== theme || overflow || alerts)
        throw Error('Workspace notice layout failed');
      const file = `${theme}-${width}.png`;
      await page.screenshot({ path: shots + '/' + file });
      report.screenshots.push({ theme, actualTheme, width, overflow, alerts, file });
    }
  selecting = true;
  const changed = page.waitForResponse(
    async (r) =>
      new URL(r.url()).pathname === '/api/client/session' &&
      r.status() === 200 &&
      (await r.json()).context.organizationId === target.organizationId,
  );
  await page
    .locator('[data-conversation-workspace]')
    .getByRole('button', { name: /انتخاب فضا و باز کردن گفتگو/ })
    .click();
  await changed;
  session = await call('/api/client/session');
  revision = session.revision;
  report.selectedMatchingOrganization =
    session.context.workspaceType === 'Organization' &&
    session.context.organizationId === target.organizationId;
  report.sameConversationUrl =
    new URL(page.url()).pathname === '/personal/messages/' + target.conversationId;
  const metadata = await call('/api/client/backend/api/v1/conversations/' + target.conversationId);
  report.metadataAfterSelection =
    metadata.conversationId === target.conversationId &&
    metadata.organizationId === target.organizationId;
  report.activeParticipant = metadata.participants.some(
    (p) => p.user.userId === session.user.id && p.status === 'Active',
  );
  report.passed =
    report.screenshots.length === 8 &&
    report.metadataBeforeSelection === 0 &&
    report.selectedMatchingOrganization &&
    report.sameConversationUrl &&
    report.metadataAfterSelection &&
    report.activeParticipant &&
    report.blockedDomainWrites === 0 &&
    report.pageErrors === 0;
} catch {
  report.error = 'Connected workspace UI or metadata validation failed';
} finally {
  await context?.close();
  await browser.close();
  if (original) {
    try {
      revision = (await call('/api/client/session')).revision;
      await call('/api/client/backend/api/v1/workspaces/select', {
        workspaceType: original.workspaceType,
        membershipId: original.membershipId,
        role: original.activeRole,
      });
      const s = await call('/api/client/session');
      revision = s.revision;
      report.contextRestored = JSON.stringify(s.context) === JSON.stringify(original);
    } catch {
      report.contextRestored = false;
    }
  }
  try {
    await call('/api/client/auth/logout', {});
    report.logoutConfirmed = true;
  } catch {
    report.logoutConfirmed = false;
  }
  await api.dispose();
  await fs.writeFile(
    'docs/quality/MESSAGING_404_20261105_BFF.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(JSON.stringify(report));
if (!report.passed || !report.contextRestored || !report.logoutConfirmed) process.exitCode = 1;
