// Read-only connected review. Browser domain writes are blocked; invitations stay Pending.
import fs from 'node:fs/promises';
import { chromium, request } from '@playwright/test';
if (process.env.MAKAN_TEST_READ_SMOKE !== '1' || process.env.CI)
  throw Error('Explicit local operator opt-in required');
const backend = JSON.parse(await fs.readFile('config/network.json', 'utf8')).backendOrigin;
if (backend !== 'http://94.184.32.84:8090') throw Error('Only the designated Test is allowed');
const origin = 'http://127.0.0.1:3145',
  shots = 'output/review/messaging-20261105/live';
const report = {
  checkedAtUtc: new Date().toISOString(),
  origin,
  backend,
  domainWrites: false,
  roles: [],
  screenshots: [],
};
await fs.mkdir(shots, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [role, phone] of [
    ['Teacher', '09120000102'],
    ['Manager', '09120000104'],
  ]) {
    const api = await request.newContext({ baseURL: origin });
    const row = { role, requests: [], pageErrors: 0, blockedDomainWrites: 0 };
    let revision, context;
    async function call(path, data) {
      if (
        data !== undefined &&
        ![
          '/api/client/auth/challenge',
          '/api/client/auth/verify',
          '/api/client/auth/logout',
        ].includes(path)
      )
        throw Error('Domain write rejected');
      const r = await api.fetch(path, {
        method: data === undefined ? 'GET' : 'POST',
        headers: { Origin: origin, ...(revision ? { 'X-Makan-Context': revision } : {}) },
        ...(data === undefined ? {} : { data }),
        timeout: 25000,
      });
      row.requests.push({ path, status: r.status() });
      if (r.status() >= 400) throw Error('Connected read failed');
      return r.status() === 204 ? null : r.json();
    }
    try {
      const c = await call('/api/client/auth/challenge', { phoneNumber: phone });
      await call('/api/client/auth/verify', {
        phoneNumber: phone,
        challengeId: c.challengeId,
        code: '123456',
        deviceName: 'Messaging connected UI read',
      });
      const session = await call('/api/client/session');
      revision = session.revision;
      const before = JSON.stringify(session.context);
      const privacy = await call('/api/client/backend/api/v1/messaging/privacy');
      const invites = await call('/api/client/backend/api/v1/messaging/invitations');
      row.incomingPending = invites.filter(
        (i) => i.targetUserId === session.user.id && i.status === 'Pending',
      ).length;
      context = await browser.newContext({
        baseURL: origin,
        storageState: await api.storageState(),
      });
      await context.addInitScript(() =>
        localStorage.setItem('makan:pwa-install-dismissed:v1', '1'),
      );
      await context.route('**/api/client/**', (route) => {
        const r = route.request(),
          u = new URL(r.url());
        if (
          !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) &&
          !u.pathname.startsWith('/api/client/hub')
        ) {
          row.blockedDomainWrites++;
          return route.abort();
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', () => row.pageErrors++);
      page.on('dialog', (d) => d.accept());
      for (const theme of ['light', 'dark'])
        for (const width of [320, 390, 834, 1440]) {
          row.phase = `${role}/${theme}/${width}/navigate`;
          await page.setViewportSize({ width, height: 900 });
          await page.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
          await page.goto(role === 'Teacher' ? '/personal/messages' : '/personal/settings/privacy');
          if (role === 'Teacher') {
            row.phase = `${role}/${theme}/${width}/invitations`;
            const panel = page.locator('[data-messaging-invitations]');
            await panel.locator('summary').click();
            await panel
              .getByRole('button', { name: 'پذیرش و ورود به گفتگو', exact: true })
              .first()
              .waitFor();
            if (
              (await panel
                .getByRole('button', { name: 'پذیرش و ورود به گفتگو', exact: true })
                .count()) !== row.incomingPending
            )
              throw Error('Invitation count mismatch');
          } else {
            row.phase = `${role}/${theme}/${width}/privacy`;
            await page.locator('[data-privacy-form]').waitFor();
            const values = await page
              .locator('[data-privacy-form] select')
              .evaluateAll((nodes) => nodes.map((n) => n.value));
            if (values.length !== 6 || values.some((v) => v !== 'Everyone'))
              throw Error('Default draft mismatch');
            await page.getByText('پیش‌فرض پیشنهادی «همه» است.', { exact: false }).waitFor();
          }
          const actualTheme = await page.locator('html').getAttribute('data-theme');
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          );
          // Next's off-screen route announcer also uses role=alert. Inspect product errors.
          row.globalAlertHosts = await page.getByRole('alert').evaluateAll((nodes) =>
            nodes.map((n) => {
              const root = n.getRootNode();
              return root instanceof ShadowRoot
                ? root.host.tagName
                : n.closest('main')
                  ? 'MAIN'
                  : 'BODY';
            }),
          );
          const alerts = await page.locator('main [role=alert]').count();
          row.visual = { theme, actualTheme, overflow, alerts };
          if (actualTheme !== theme || overflow || alerts)
            throw Error('Visual or connected read error');
          const file = `${role.toLowerCase()}-${width}-${theme}.png`;
          await page.screenshot({ path: shots + '/' + file, fullPage: role === 'Manager' });
          report.screenshots.push({ role, theme, actualTheme, width, overflow, alerts, file });
        }
      await context.close();
      context = undefined;
      row.privacyUnchanged =
        JSON.stringify(await call('/api/client/backend/api/v1/messaging/privacy')) ===
        JSON.stringify(privacy);
      row.invitationsUnchanged =
        JSON.stringify(await call('/api/client/backend/api/v1/messaging/invitations')) ===
        JSON.stringify(invites);
      row.contextPreserved = JSON.stringify((await call('/api/client/session')).context) === before;
      row.passed =
        row.privacyUnchanged &&
        row.invitationsUnchanged &&
        row.contextPreserved &&
        row.pageErrors === 0 &&
        row.blockedDomainWrites === 0;
    } catch (problem) {
      row.error = 'Connected read or UI validation failed';
      if (
        [
          'Invitation count mismatch',
          'Default draft mismatch',
          'Visual or connected read error',
        ].includes(problem.message)
      )
        row.reason = problem.message;
      if (context)
        await context
          .pages()[0]
          ?.screenshot({ path: `tmp/messaging-20261105/failure-${role}.png` })
          .catch(() => {});
    } finally {
      await context?.close();
      try {
        await call('/api/client/auth/logout', {});
        row.logoutConfirmed = true;
      } catch {
        row.logoutConfirmed = false;
      }
      report.roles.push(row);
      await api.dispose();
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'docs/quality/MESSAGING_20261105_BFF_AFTER.json',
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(JSON.stringify({ roles: report.roles, screenshots: report.screenshots.length }));
if (report.roles.some((r) => !r.passed || !r.logoutConfirmed)) process.exitCode = 1;
