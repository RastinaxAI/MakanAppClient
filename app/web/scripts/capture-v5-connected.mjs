// Responsive, isolated product capture. Sample data is explicitly labelled in every image.
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
const origin = 'http://127.0.0.1:3158',
  fixture = 'http://127.0.0.1:3458',
  out = 'output/review/v5/connected';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const group = '00000000-0000-4000-8000-000000000950';
const cases = [
  ['school-student', 'Student', true, '/personal/education', 'design'],
  ['school-teacher', 'Teacher', true, '/personal/education', 'design'],
  ['school-parent', 'Parent', true, '/personal/education', 'design'],
  ['school-manager', 'Manager', true, '/personal/education', 'manager-case'],
  ['contacts', 'Student', false, '/personal/contacts', 'design'],
  ['appearance', 'Student', false, '/personal/settings/appearance', 'design'],
  ['workspaces', 'Student', false, '/personal/workspaces', 'design'],
  ['profile-details', 'Student', false, '/personal/profile/details', 'design'],
  ['classes', 'Manager', true, '/personal/education/classes', 'manager-case'],
  ['members', 'Manager', true, '/personal/education/members', 'manager-case'],
  ['invitations', 'Manager', true, '/personal/education/invitations', 'vnext'],
  ['reports', 'Manager', true, '/personal/education/reports', 'manager-case'],
  ['student-classes', 'Student', true, '/personal/education/classes', 'design'],
  [
    'lesson',
    'Student',
    true,
    '/personal/education/lessons/00000000-0000-4000-8000-000000000005',
    'design',
  ],
  ['teacher-schedule', 'Teacher', true, '/personal/education/schedule', 'design'],
  ['profile', 'Student', false, '/personal/profile', 'design'],
  ['profile-edit', 'Student', false, '/personal/profile/edit', 'design'],
  ['settings', 'Student', false, '/personal/settings', 'design'],
  ['privacy', 'Student', false, '/personal/settings/privacy', 'design'],
  ['messages', 'Student', false, '/personal/messages', 'rich-messaging'],
  ['poll', 'Student', false, `/personal/messages/${group}/poll-new`, 'rich-messaging'],
  ['group-info', 'Student', false, `/personal/messages/${group}/info`, 'rich-messaging'],
  ['group-settings', 'Student', false, `/personal/messages/${group}/settings`, 'rich-messaging'],
  ['folders', 'Student', false, '/personal/messages/folders', 'rich-messaging'],
  ['resources', 'Student', false, '/personal/resources', 'design'],
  ['assistant', 'Student', false, '/personal/assistant', 'design'],
  ['subscription', 'Student', false, '/personal/subscription', 'design'],
  ['extracurricular', 'Personal', false, '/personal/extracurricular', 'personal-class'],
];
const wanted = process.env.V5_PRODUCT_CASES?.split(',');
const rows = [];
try {
  for (const [key, role, school, route, seed] of cases.filter(
    ([key]) => !wanted || wanted.includes(key),
  )) {
    for (const [width, height, theme] of [
      [390, 844, 'light'],
      [834, 1112, 'light'],
      [1440, 1000, 'light'],
      [390, 844, 'dark'],
      [1440, 1000, 'dark'],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        locale: 'fa-IR',
        timezoneId: 'Asia/Tehran',
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await context.addInitScript(
        ({ theme }) => {
          localStorage.setItem('makan-theme', theme);
          localStorage.setItem('makan:pwa-install-dismissed:v1', '1');
        },
        { theme },
      );
      await context.request.post(fixture + '/__test__/reset');
      await context.request.post(fixture + '/__test__/' + seed, { data: {} });
      const phone = {
          Student: '09120000101',
          Teacher: '09120000102',
          Parent: '09120000103',
          Manager: '09120000104',
          Personal: '09120000199',
        }[role],
        headers = { Origin: origin };
      const challenge = await context.request.post(origin + '/api/client/auth/challenge', {
        headers,
        data: { phoneNumber: phone },
      });
      if (challenge.status() !== 202) throw Error('Fixture challenge failed');
      const verified = await context.request.post(origin + '/api/client/auth/verify', {
        headers,
        data: {
          phoneNumber: phone,
          challengeId: (await challenge.json()).challengeId,
          code: '123456',
          deviceName: 'V4 isolated visual review',
        },
      });
      if (!verified.ok()) throw Error('Fixture verification failed');
      let session = await (await context.request.get(origin + '/api/client/session')).json();
      if (school) {
        const spaces = await (
          await context.request.get(origin + '/api/client/backend/api/v1/workspaces/me', {
            headers: { 'X-Makan-Context': session.revision },
          })
        ).json();
        const chosen = spaces.find((x) => x.role === role);
        if (!chosen) throw Error('Missing role fixture');
        const selected = await context.request.post(
          origin + '/api/client/backend/api/v1/workspaces/select',
          {
            headers: { ...headers, 'X-Makan-Context': session.revision },
            data: {
              workspaceType: 'Organization',
              membershipId: chosen.membershipId,
              role: chosen.role,
            },
          },
        );
        if (!selected.ok()) throw Error('Fixture workspace selection failed');
      }
      const page = await context.newPage(),
        errors = [],
        failed = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('response', (r) => {
        if (r.url().includes('/api/client/') && r.status() >= 400)
          failed.push({ path: new URL(r.url()).pathname, status: r.status() });
      });
      const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
      await page.locator('h1:visible,h2:visible,[data-mk-view]:visible').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => !document.querySelector('.skeleton-wrap')).catch(() => {});
      await page.waitForTimeout(350);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        theme: document.documentElement.dataset.theme,
        headings: [...document.querySelectorAll('h1')]
          .filter((x) => x.getBoundingClientRect().height)
          .map((x) => x.textContent),
        alerts: [...document.querySelectorAll('.error-state')].map((x) => x.textContent),
        fontReady: document.fonts.check('16px "Makan Reference"'),
      }));
      const image = `${out}/${key}-${width}-${theme}.png`;
      await page.screenshot({ path: image, animations: 'disabled' });
      rows.push({
        key,
        role,
        school,
        route,
        width,
        height,
        theme,
        status: response.status(),
        ...layout,
        errors,
        failed,
        image,
      });
      await context.close();
    }
    console.log(
      JSON.stringify({
        captured: rows.length,
        case: key,
        errors: rows.filter((x) => x.errors.length || x.overflow).length,
      }),
    );
    await fs.writeFile(
      out + '/capture.partial.json',
      JSON.stringify({ synthetic: true, screens: rows }, null, 2),
    );
  }
  const prior = wanted ? JSON.parse(await fs.readFile(out + '/capture.json', 'utf8')).screens : [];
  const allRows = wanted ? [...prior.filter((row) => !wanted.includes(row.key)), ...rows] : rows;
  await fs.writeFile(
    out + '/capture.json',
    JSON.stringify({ synthetic: true, origin, reference: 'V5', screens: allRows }, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      screens: rows.length,
      errors: rows.filter((x) => x.errors.length || x.overflow),
      backendFailures: rows.filter((x) => x.failed.length),
    }),
  );
} finally {
  await browser.close();
}
