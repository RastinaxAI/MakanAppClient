import { test, expect, login, fixture, ids } from './test';
import { aiIntegration as ai, v6Ui as t } from '../../src/content/fa';
import { chooseAssistantPayer } from './assistant-controls';
import type { Page } from '@playwright/test';
async function parentContext(page: Page) {
  await page.goto('/personal/profile');
  await page.getByRole('button', { name: t.chooseSchool, exact: true }).click();
  const d = page.getByRole('dialog', { name: t.schoolPicker, exact: true });
  await d
    .getByRole('region', { name: 'آموزشگاه آفتاب', exact: true })
    .getByRole('radio', { name: /والد/ })
    .check();
  await d.getByRole('button', { name: t.enterRole, exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/education$/);
}
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/design');
  await request.post(fixture + '/__test__/ai-integration', { data: { lostAck: true } });
  await request.post(fixture + '/__test__/v6-contexts', { data: {} });
});
test('V6 assistant home leads into the real chat, preserves its draft and keeps the composer reachable at 200 percent', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/assistant');
  await expect(page.locator('[data-ui="composer"]')).toHaveCount(0);
  const choose = page.getByRole('button', { name: t.assistantSelectContext, exact: true });
  await choose.click();
  await page.keyboard.press('Escape');
  await expect(choose).toBeFocused();
  await page.getByRole('button', { name: new RegExp('^' + t.assistantReview) }).click();
  await expect(page).toHaveURL(/view=chat/);
  const field = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await field.fill('پیش‌نویس فارسی و Latin بدون ارسال');
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 768, 834, 1024, 1440]) {
      await page.setViewportSize({ width, height: 540 });
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
        document.documentElement.dataset.reading = 'large';
        document.documentElement.style.setProperty('--text-scale', '2');
      }, theme);
      await expect(field).toHaveValue('پیش‌نویس فارسی و Latin بدون ارسال');
      await expect(field).toBeInViewport();
      const bounds = (await page.locator('[data-ui="composer"]').boundingBox())!;
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(541);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2),
      ).toBe(true);
      if (width < 768)
        await expect(
          page.locator('[data-app-navigation][data-navigation-presentation="dock"]'),
        ).toBeVisible();
    }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/ai/') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});
for (const payer of ['Individual', 'Organization'])
  test(`${payer} pending intent survives a school-role transition and never silently retries with a different owner`, async ({
    page,
    context,
    request,
  }) => {
    await login(context, 'Teacher');
    await page.goto('/personal/assistant');
    await chooseAssistantPayer(page, payer);
    const field = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
    await field.fill('قصد اولیه پیش از تغییر نقش');
    await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
    await expect(page.getByRole('button', { name: ai.retry, exact: true })).toBeVisible();
    const other = await context.newPage();
    await parentContext(other);
    await expect
      .poll(
        async () =>
          (await (await context.request.get('/api/client/session')).json()).context.activeRole,
      )
      .toBe('Parent');
    await page.getByRole('button', { name: ai.retry, exact: true }).click();
    if (payer === 'Individual') await expect(page.locator('[data-assistant-result]')).toBeVisible();
    else
      await expect(page.getByRole('main').getByRole('alert')).toContainText(
        t.assistantContextChanged,
      );
    const state = await (await request.get(fixture + '/__test__/state')).json();
    const calls = state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/ai/chat' && r.method === 'POST',
    );
    expect(calls).toHaveLength(payer === 'Individual' ? 2 : 1);
    if (payer === 'Individual') {
      expect(calls[0].body).toEqual(calls[1].body);
      expect(calls[0].aiHeaders).toEqual(calls[1].aiHeaders);
    }
    await other.close();
  });

test('school authoring starts with an explicit authorized class and retains the existing form route', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/education');
  await page.getByRole('button', { name: t.schoolNewAssignment, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.schoolNewAssignment, exact: true });
  await expect(dialog.getByRole('button', { name: 'ادامه', exact: true })).toBeDisabled();
  await dialog.getByRole('combobox', { name: ai.class, exact: true }).selectOption(ids.class);
  await dialog.getByRole('button', { name: 'ادامه', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/classes/' + ids.class + '/assignments/new$'));
  await expect(page.getByRole('textbox', { name: 'عنوان', exact: true })).toBeEditable();
});

test('plan overview uses the existing catalog and history without initiating a purchase or offering fake store restoration', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Personal', false);
  await page.goto('/personal/subscription');
  await expect(page.getByRole('heading', { name: t.planServices, exact: true })).toBeVisible();
  await expect(page.getByText(t.restoreUnavailable, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: t.restorePurchase, exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: new RegExp('^' + t.availablePlans) }).click();
  await expect(page).toHaveURL(/view=plans/);
  await expect(page.getByRole('heading', { name: t.plansTitle, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: new RegExp('^' + t.reviewPlan) })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) =>
        /\/orders$/.test(row.path) && row.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('V7 assistant uses a source sidebar, preserves the draft on resize and never reads or marks personal messages', async ({
  page,
  context,
  request,
}) => {
  const before = await login(context, 'Student');
  await page.goto('/personal/assistant?view=chat');
  const field = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await field.fill('پیش‌نویس با ستون منابع مجاز');
  for (const width of [834, 1440, 390, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    const inbox = page.locator('[data-assistant-workspace] [data-chat-list]');
    const sources = page.locator('[data-assistant-source-panel]');
    await expect(inbox).toHaveCount(0);
    await expect(sources).toHaveCount(0);
    await page.getByRole('tab', { name: 'منابع', exact: true }).click();
    await expect(page.locator('[data-assistant-source-selection]')).toBeVisible();
    await page.getByRole('tab', { name: 'گفتگو', exact: true }).click();
    await expect(field).toHaveValue('پیش‌نویس با ستون منابع مجاز');
    await expect(field).toBeInViewport();
  }
  const after = await (await context.request.get('/api/client/session')).json();
  expect(after.context).toEqual(before.context);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some((r: { path: string }) => r.path === '/api/v1/conversations/account'),
  ).toBe(false);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.method === 'POST' && (r.path.endsWith('/read') || r.path.startsWith('/api/v1/ai/')),
    ),
  ).toHaveLength(0);
});
