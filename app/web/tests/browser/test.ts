import { reviewPath } from './review-output';
import { test as base, expect, type BrowserContext } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { recordExactStates } from './exact-evidence';
import { v4_more } from '../../src/content/fa';
export { expect };
export const origin = 'http://127.0.0.1:3132';
export const fixture = 'http://127.0.0.1:3457';
/** V4 keeps school destinations in the header sheet, leaving the page for its content. */
export async function schoolSections(page: import('@playwright/test').Page) {
  await page
    .locator('.bootstrap:visible,.skeleton-wrap:visible')
    .first()
    .waitFor({ state: 'hidden' });
  const nav = page.getByRole('navigation', { name: 'بخش‌های آموزشگاه', exact: true });
  if (!(await nav.isVisible())) {
    const sections = page.locator('button[aria-label="بخش‌های آموزشگاه"]:visible');
    if (await sections.isVisible()) await sections.click();
    else await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  }
  await expect(nav).toBeVisible();
  return nav;
}
export const ids = {
  org: '00000000-0000-4000-8000-000000000001',
  class: '00000000-0000-4000-8000-000000000002',
  assignment: '00000000-0000-4000-8000-000000000003',
  attempt: '00000000-0000-4000-8000-000000000004',
  lesson: '00000000-0000-4000-8000-000000000005',
  exam: '00000000-0000-4000-8000-000000000006',
  chat: '00000000-0000-4000-8000-000000000009',
};
export async function chooseSchoolCatalog(
  page: import('@playwright/test').Page,
  field: string,
  title: string,
) {
  const label = field === 'درس' ? 'درس کاتالوگ' : field === 'دوره' ? 'دوره آموزشی' : field;
  await page.getByLabel(label, { exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'انتخاب ' + title, exact: true }).click();
  await expect(dialog).toHaveCount(0);
}
export const test = base.extend<{ resetBackend: void }>({
  resetBackend: [
    async ({ request }, use) => {
      expect((await request.post(fixture + '/__test__/reset')).ok()).toBeTruthy();
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(state.attempt).toBeNull();
      await use();
    },
    { auto: true },
  ],
  context: async ({ context }, use, info) => {
    const finishEvidence = await recordExactStates(context, info);
    await context.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (
        ['data:', 'blob:', 'about:'].includes(u.protocol) ||
        ['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname)
      )
        return route.continue();
      throw Error('External network forbidden in browser tests: ' + u.origin);
    });
    await use(context);
    await finishEvidence();
  },
});

// Opt-in evidence uses the same real components and isolated fixtures as the tests.
// A test screenshot records its final state, not all states of its component family.
test.afterEach(async ({ page }, info) => {
  if (process.env.MAKAN_EXACT_UI_EVIDENCE !== 'true' || page.isClosed()) return;
  const out = reviewPath('output/review/exact-v1/browser');
  await mkdir(out, { recursive: true });
  const key = createHash('sha256').update(info.testId).digest('hex').slice(0, 16);
  try {
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      route: location.pathname + location.search,
      width: innerWidth,
      height: innerHeight,
      theme: document.documentElement.dataset.theme,
      reading: document.documentElement.dataset.reading,
      documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      scenarioIds: [...document.querySelectorAll<HTMLElement>('[data-v5-scene],[data-v4-view]')]
        .filter((e) => e.getBoundingClientRect().height)
        .map((e) => e.dataset.v5Scene || e.dataset.v4View),
      headings: [...document.querySelectorAll('h1,h2')]
        .filter((e) => e.getBoundingClientRect().height)
        .map((e) => e.textContent),
    }));
    await page.screenshot({ path: `${out}/${key}.png`, animations: 'disabled' });
    await writeFile(
      `${out}/${key}.json`,
      JSON.stringify(
        {
          test: info.title,
          file: info.file.split('/tests/')[1],
          status: info.status,
          expectedStatus: info.expectedStatus,
          synthetic: true,
          image: `${out}/${key}.png`,
          ...layout,
        },
        null,
        2,
      ) + '\n',
    );
  } catch (e) {
    await writeFile(
      `${out}/${key}.json`,
      JSON.stringify({
        test: info.title,
        status: info.status,
        evidenceError: String(e).split('\n')[0],
      }) + '\n',
    );
  }
});
export async function login(context: BrowserContext, role = 'Student', school = true) {
  const phone = (
    {
      Student: '09120000101',
      Teacher: '09120000102',
      Parent: '09120000103',
      Manager: '09120000104',
      Personal: '09120000199',
    } as Record<string, string>
  )[role];
  const headers = { Origin: origin };
  const c = await context.request.post(origin + '/api/client/auth/challenge', {
    headers,
    data: { phoneNumber: phone },
  });
  expect(c.status()).toBe(202);
  const v = await context.request.post(origin + '/api/client/auth/verify', {
    headers,
    data: {
      phoneNumber: phone,
      challengeId: (await c.json()).challengeId,
      code: '123456',
      deviceName: 'Isolated client test',
    },
  });
  expect(v.status(), await v.text()).toBe(200);
  let state = await (await context.request.get(origin + '/api/client/session')).json();
  if (school && role !== 'Personal') {
    const spaces = await (
      await context.request.get(origin + '/api/client/backend/api/v1/workspaces/me', {
        headers: { 'X-Makan-Context': state.revision },
      })
    ).json();
    const w = spaces.find((x: { role: string }) => x.role === role);
    expect(w).toBeTruthy();
    expect(
      (
        await context.request.post(origin + '/api/client/backend/api/v1/workspaces/select', {
          headers: { ...headers, 'X-Makan-Context': state.revision },
          data: { workspaceType: 'Organization', membershipId: w.membershipId, role: w.role },
        })
      ).ok(),
    ).toBeTruthy();
    state = await (await context.request.get(origin + '/api/client/session')).json();
  }
  return state;
}
