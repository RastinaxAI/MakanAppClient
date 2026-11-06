// Manual Test-backend read/preview verification; no role/class/file/message/order mutations.
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { request, chromium } from '@playwright/test';
if (process.env.MAKAN_TEST_READ_SMOKE !== '1' || process.env.CI)
  throw Error('Explicit local operator opt-in required');
const backend = JSON.parse(await fs.readFile('config/network.json', 'utf8')).backendOrigin;
if (backend !== 'http://94.184.32.84:8090')
  throw Error('Only the designated Test environment is allowed');
const origin = 'http://127.0.0.1:3145',
  output = 'docs/quality/VNEXT_20261105_LIVE.json';
const shots = 'output/review/vnext-20261105';
await fs.mkdir(shots, { recursive: true });
const report = {
  checkedAtUtc: new Date().toISOString(),
  backend,
  origin,
  domainMutations: false,
  roles: [],
  screenshots: [],
};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const cleanPath = (path) => path.split('?')[0].replace(/\/[0-9a-f-]{36}(?=\/|$)/gi, '/{id}');
try {
  for (const [role, phone] of [
    ['Student', '09120000101'],
    ['Teacher', '09120000102'],
    ['Parent', '09120000103'],
    ['Manager', '09120000104'],
    ['Personal', '09120000199'],
  ]) {
    const api = await request.newContext({ baseURL: origin }),
      row = { role, checks: [], passed: false };
    let revision, context;
    async function call(path, expected = [200], body) {
      if (
        body !== undefined &&
        ![
          '/api/client/auth/challenge',
          '/api/client/auth/verify',
          '/api/client/auth/logout',
          '/api/client/backend/api/v1/workspaces/select',
          '/api/client/backend/api/v1/commerce/personal/quote',
        ].includes(path)
      )
        throw Error('Domain mutation rejected');
      const r = await api.fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { Origin: origin, ...(revision ? { 'X-Makan-Context': revision } : {}) },
        ...(body === undefined ? {} : { data: body }),
        timeout: 25000,
      });
      const value = await r.json().catch(() => null),
        code = value?.code;
      row.checks.push({
        path: cleanPath(path),
        method: body === undefined ? 'GET' : 'POST',
        status: r.status(),
        expected,
        ...(typeof code === 'string' && /^[A-Z0-9_]{1,100}$/.test(code) ? { code } : {}),
      });
      if (!expected.includes(r.status())) throw Error('Unexpected status');
      return value;
    }
    try {
      const c = await call('/api/client/auth/challenge', [202], { phoneNumber: phone });
      await call('/api/client/auth/verify', [200], {
        phoneNumber: phone,
        challengeId: c.challengeId,
        code: '123456',
        deviceName: 'Makan vNext Test read verification',
      });
      let state = await call('/api/client/session');
      revision = state.revision;
      const snapshot = await call('/api/client/backend/api/v1/workspaces/snapshot');
      const space = snapshot.workspaces.find(
        (w) =>
          w.canEnter && (role === 'Personal' ? w.workspaceType === 'Personal' : w.role === role),
      );
      if (!space) throw Error('Test workspace unavailable');
      await call('/api/client/backend/api/v1/workspaces/select', [200], {
        workspaceType: space.workspaceType,
        membershipId: space.membershipId,
        role: space.role,
      });
      state = await call('/api/client/session');
      revision = state.revision;
      const before = JSON.stringify(state.context);
      await call(
        '/api/client/backend/api/v1/organization/invitations?page=1&pageSize=5',
        role === 'Manager' ? [200] : [403],
      );
      await call(
        '/api/client/backend/api/v1/organization/teacher-content-activities?page=1&pageSize=5',
        role === 'Manager' ? [200] : [403],
      );
      await call(
        '/api/client/backend/api/v1/academic/exams/discovery?page=1&pageSize=5',
        ['Teacher', 'Manager'].includes(role) ? [200] : [403],
      );
      const push = await call(
        '/api/client/backend/api/v1/notifications/devices/web-push/configuration',
      );
      row.webPushConfigured = push.isConfigured;
      const invitations = await call(
        '/api/client/backend/api/v1/personal-classes/invitations/page?page=1&pageSize=5',
      );
      row.invitationIdentity = {
        sampleCount: invitations.items.length,
        withTitle: invitations.items.filter((i) => !!i.classTitle).length,
        withInviter: invitations.items.filter((i) => !!i.inviter?.displayName).length,
      };
      let classes = [];
      if (['Manager', 'Teacher', 'Student'].includes(role))
        classes = await call('/api/client/backend/api/v1/academic/classes');
      if (role === 'Manager') {
        const official = await call('/api/client/backend/api/v1/organization/official-spaces');
        row.officialSpaces = { group: official.group.state, channel: official.channel.state };
        row.activityDelivery = { sampleCount: 0 };
        for (const klass of classes.slice(0, 5)) {
          const assignments = await call(
            '/api/client/backend/api/v1/academic/classes/' + klass.id + '/assignments',
          );
          const published = assignments.find((a) => a.status === 'Published' && a.versionId);
          if (!published) continue;
          const result = await call(
            '/api/client/backend/api/v1/organization/classes/' +
              klass.id +
              '/official-spaces/activities?kind=Assignment&sourceVersionId=' +
              published.versionId,
            [200, 404],
          );
          row.activityDelivery = {
            sampleCount: 1,
            status: row.checks.at(-1).status,
            code: row.checks.at(-1).code,
            states: Array.isArray(result) ? result.map((r) => r.state) : [],
          };
          break;
        }
        row.classVersions = {
          sampleCount: classes.length,
          withVersion: classes.filter((c) => !!c.version).length,
        };
        await call('/api/client/backend/api/v1/organization/invitations?page=1&pageSize=101', [
          400,
        ]);
        const members = await call(
          '/api/client/backend/api/v1/organization/members?Page=1&PageSize=5',
        );
        row.memberVersions = {
          sampleCount: members.items.length,
          withVersion: members.items.filter((m) => !!m.version).length,
        };
        const relations = await call(
          '/api/client/backend/api/v1/organization/guardian-relations?page=1&pageSize=5',
        );
        row.guardianNames = {
          sampleCount: relations.items.length,
          withName: relations.items.filter((r) => !!r.guardianDisplayName).length,
        };
      }
      if (role === 'Personal') {
        const plans = await call('/api/client/backend/api/v1/commerce/catalog?audience=Individual');
        if (plans.length) {
          const quote = await call('/api/client/backend/api/v1/commerce/personal/quote', [200], {
            planVersionId: plans[0].planVersionId,
            clientOperationId: randomUUID(),
            purpose: 'Purchase',
            subscriptionId: null,
          });
          row.quote = {
            paymentAvailable: quote.paymentAvailable,
            previewOnly: quote.previewOnly,
            startsUponVerifiedPayment: quote.startsUponVerifiedPayment,
            hasExpiry: !!quote.expiresAtUtc,
          };
        } else row.quote = { sampleCount: 0 };
      }
      if (['Manager', 'Teacher'].includes(role)) {
        context = await browser.newContext({
          storageState: await api.storageState(),
          viewport: { width: 390, height: 900 },
        });
        await context.addInitScript(() =>
          localStorage.setItem('makan:pwa-install-dismissed:v1', '1'),
        );
        let blocked = 0;
        await context.route('**/*', (route) => {
          const req = route.request(),
            u = new URL(req.url());
          if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method()) && !u.pathname.includes('/hub')) {
            blocked++;
            return route.abort();
          }
          return route.continue();
        });
        const page = await context.newPage();
        await page.goto(origin + '/enter', { waitUntil: 'domcontentloaded' });
        let errors = 0;
        page.on('pageerror', () => errors++);
        const pages =
          role === 'Manager'
            ? [
                ['invitations', '/personal/education/invitations'],
                ['members', '/personal/education/members'],
                ['content', '/personal/education/reports?kind=content-activities'],
                ['exams', '/personal/education/exams'],
                ['guardians', '/personal/education/guardians'],
                ...(classes[0] ? [['class', '/personal/education/classes/' + classes[0].id]] : []),
              ]
            : [['exams', '/personal/education/exams']];
        for (const [name, path] of pages) {
          for (const theme of ['light', 'dark'])
            for (const width of [320, 390, 834, 1440]) {
              await page.setViewportSize({ width, height: 900 });
              await page.emulateMedia({ colorScheme: theme });
              await page.evaluate((v) => localStorage.setItem('makan-theme', v), theme);
              const r = await page.goto(origin + path, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
              });
              await page.getByRole('main').waitFor({ state: 'visible' });
              await page.waitForFunction(
                () => !document.querySelector('main .skeleton-wrap'),
                null,
                { timeout: 25000 },
              );
              await page.evaluate(async () => {
                await document.fonts.ready;
              });
              const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth,
              );
              const alerts = await page.locator('main [role=alert]').count();
              const actualTheme = await page.evaluate(() => document.documentElement.dataset.theme);
              const file = `${role.toLowerCase()}-${name}-${width}-${theme}.png`;
              await page.screenshot({ path: shots + '/' + file, fullPage: true });
              report.screenshots.push({
                role,
                page: name,
                width,
                theme,
                actualTheme,
                status: r.status(),
                overflow,
                alerts,
                file,
              });
              if (r.status() !== 200 || overflow || alerts || actualTheme !== theme)
                throw Error('Live page check failed');
            }
        }
        row.pageErrors = errors;
        row.blockedDomainWrites = blocked;
        if (errors || blocked) throw Error('Page runtime or write boundary failed');
        await context.close();
        context = undefined;
      }
      row.contextPreserved = before === JSON.stringify((await call('/api/client/session')).context);
      if (!row.contextPreserved) throw Error('Context changed');
      row.passed = true;
    } catch {
      row.failure =
        'A live status, schema, page, context or write boundary check failed; see sanitized checks.';
    } finally {
      await context?.close();
      try {
        await call('/api/client/auth/logout', [204], {});
      } catch {
        row.logoutUnconfirmed = true;
      }
      await api.dispose();
    }
    report.roles.push(row);
    await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
    console.log(role + ': ' + (row.passed ? 'passed' : 'failed'));
  }
} finally {
  await browser.close();
}
if (report.roles.some((r) => !r.passed)) process.exitCode = 1;
