import { test, expect, fixture, login, ids } from './test';
import type { Page } from '@playwright/test';
import * as copy from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
const t = copy.v5Exams;
const root = '/personal/education/classes/' + ids.class + '/exams/new';
const path = '/api/v1/academic/classes/' + ids.class + '/exams';
async function statement(page: Page) {
  await page.goto(root);
  await page.getByLabel(t.title, { exact: true }).fill('مرور معادله');
  await page.getByLabel(t.description, { exact: true }).fill('چهار پرسش تستی و یک پرسش تشریحی');
  await page.getByLabel(t.start, { exact: true }).fill('۱۴۰۵/۰۸/۱۸ ۱۸:۰۰');
  await page.getByLabel(t.start, { exact: true }).blur();
  await page.getByLabel(t.end, { exact: true }).fill('۱۴۰۵/۰۸/۱۸ ۲۰:۰۰');
  await page.getByLabel(t.end, { exact: true }).blur();
}
async function rules(page: Page) {
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await page.getByLabel(t.duration, { exact: true }).fill('۱۵');
  await page.getByLabel(t.attempts, { exact: true }).fill('۱');
  await page.getByLabel(t.score, { exact: true }).fill('۲۰');
}
test('native exam steps retain the scoped draft through back, resize, theme, reload and rejected create; numeric validation never silently changes the command', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await statement(page);
  await page.getByLabel(t.end, { exact: true }).fill('۱۴۰۵/۰۸/۱۸ ۱۷:۰۰');
  await page.getByLabel(t.end, { exact: true }).blur();
  await expect(page.getByRole('button', { name: t.next, exact: true })).toBeDisabled();
  await page
    .locator('form[data-v5-scene="MK-150"]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.getByLabel(t.end, { exact: true }).fill('۱۴۰۵/۰۸/۱۸ ۲۰:۰۰');
  await page.getByLabel(t.end, { exact: true }).blur();
  await captureExactState(
    page,
    ['MK-150'],
    'Actual Teacher statement with canonical dates, optional description and native responsive fields.',
  );
  await rules(page);
  const submit = page.locator('form[data-v5-scene="MK-151"] button[type="submit"]:visible');
  for (const value of ['۱٫۵', '1e2', '۰', '۲۱۴۷۴۸۳۶۴۸']) {
    await page.getByLabel(t.duration, { exact: true }).fill(value);
    await expect(page.getByLabel(t.duration, { exact: true })).toHaveValue(
      value.replace('1e2', '۱e۲').replace('٫', '.'),
    );
    await expect(submit).toBeDisabled();
    await page
      .locator('form[data-v5-scene="MK-151"]')
      .evaluate((form: HTMLFormElement) => form.requestSubmit());
  }
  await page.getByLabel(t.duration, { exact: true }).fill('۱۵');
  await page.getByLabel(t.score, { exact: true }).fill('۲۰٫۱۲۳');
  await expect(submit).toBeDisabled();
  const empty = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    empty.requests.filter(
      (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await page.getByLabel(t.score, { exact: true }).fill('٢٠٫٥');
  await page.getByLabel(t.order, { exact: true }).selectOption('QuestionOrder');
  await page
    .getByRole('banner')
    .getByRole('button', { name: copy.v4Text.back, exact: true })
    .click();
  await expect(page.getByLabel(t.title, { exact: true })).toBeFocused();
  await expect(page.getByLabel(t.start, { exact: true })).toHaveValue('۱۸ آبان، ۱۸:۰۰');
  await page.getByRole('button', { name: t.next, exact: true }).click();
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1112 });
    await expect(page.getByLabel(t.duration, { exact: true })).toHaveValue('۱۵');
    await expect(page.getByLabel(t.score, { exact: true })).toHaveValue('۲۰.۵');
  }
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('button', { name: 'ذخیره ظاهر', exact: true }).click();
  await page.goto(root + '?step=rules');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel(t.order, { exact: true })).toHaveValue('QuestionOrder');
  await expect(page.getByLabel(t.score, { exact: true })).toHaveValue('۲۰.۵');
  await captureExactState(
    page,
    ['MK-151'],
    'Real rule draft with localized duration and score, actual enum choices and preserved statement in the same authorized workspace.',
  );
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let pending = 0;
  await page.route('**/api/client/backend' + path, async (route) => {
    pending++;
    await held;
    await route.continue();
  });
  try {
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await page.locator('form[data-v5-scene="MK-151"]').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(pending).toBe(1);
  } finally {
    release();
  }
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByLabel(t.duration, { exact: true })).toHaveValue('۱۵');
  await page.unroute('**/api/client/backend' + path);
  await submit.click();
  await expect(page).toHaveURL(/\/exams\/[0-9a-f-]+\/edit$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toEqual({
    title: 'مرور معادله',
    description: 'چهار پرسش تستی و یک پرسش تشریحی',
    availableFromUtc: '2026-11-09T14:30:00.000Z',
    availableUntilUtc: '2026-11-09T16:30:00.000Z',
    durationMinutes: 15,
    maxAttempts: 1,
    maxScore: 20.5,
    randomizationPolicy: 'QuestionOrder',
  });
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/publish'))).toHaveLength(
    0,
  );
});
for (const [name, mismatch] of [
  ['organization', { organizationId: ids.exam }],
  ['class', { classId: ids.exam }],
  ['status', { status: 'Published' }],
  ['version status', { versionStatus: 'Published' }],
  ['version', { versionRowVersion: '' }],
  ['class reference', { classRef: { kind: 'PersonalClass', classId: ids.class } }],
] as const)
  test(
    'a mismatched exam ' + name + ' acknowledgment cannot become a successful draft',
    async ({ page, context }) => {
      await login(context, 'Teacher');
      await statement(page);
      await rules(page);
      await page.route('**/api/client/backend' + path, async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response, json: { ...(await response.json()), ...mismatch } });
      });
      await page.getByRole('button', { name: t.create, exact: true }).click();
      await expect(
        page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/exams\/new\?step=rules$/);
      await expect(page.getByLabel(t.duration, { exact: true })).toHaveValue('۱۵');
    },
  );
for (const role of ['Student', 'Parent'] as const)
  test(
    role + ' cannot author an exam through either native step',
    async ({ page, context, request }) => {
      await login(context, role);
      for (const route of [root, root + '?step=rules']) {
        await page.goto(route);
        await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
        await expect(page.getByRole('button', { name: t.create, exact: true })).toHaveCount(0);
        await expect(page.getByRole('button', { name: t.next, exact: true })).toHaveCount(0);
      }
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
        ),
      ).toHaveLength(0);
    },
  );
