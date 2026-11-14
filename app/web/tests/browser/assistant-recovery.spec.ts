import { test, expect, login, fixture } from './test';
import { aiIntegration as t } from '../../src/content/fa';
import { chooseAssistantPayer } from './assistant-controls';
import { captureExactState } from './exact-state-capture';

async function enable(request: import('@playwright/test').APIRequestContext, options = {}) {
  expect((await request.post(fixture + '/__test__/ai-integration', { data: options })).ok()).toBe(
    true,
  );
}
async function aiWrites(request: import('@playwright/test').APIRequestContext) {
  const state = await (await request.get(fixture + '/__test__/state')).json();
  return state.requests.filter(
    (r: { path: string; method: string }) =>
      r.method === 'POST' && r.path.startsWith('/api/v1/ai/'),
  );
}

test('an unacknowledged request can be edited from the error page only after an explicit choice, without resending', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { status: 503 });
  await login(context, 'Personal', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/assistant?view=chat');
  await chooseAssistantPayer(page, 'Individual');
  await page
    .getByRole('textbox', { name: 'سؤال از دستیار', exact: true })
    .fill('پرسش محفوظ برای ویرایش');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.serviceUnavailable);
  await captureExactState(
    page,
    ['MK-376'],
    'Fixture service refusal inside the persistent tab shell with explicit edit recovery; no live AI.',
  );
  await page.getByRole('button', { name: t.editQuestion, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'انصراف', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'دستیار', exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.serviceUnavailable);
  expect(await aiWrites(request)).toHaveLength(1);
  await page.getByRole('button', { name: t.editQuestion, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  const question = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await expect(question).toBeEnabled();
  await expect(question).toHaveValue('پرسش محفوظ برای ویرایش');
  expect(await aiWrites(request)).toHaveLength(1);
  await question.fill('پرسش ویرایش‌شده');
  await enable(request, { status: null });
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.locator('.bubble.mine')).toContainText('پرسش ویرایش‌شده');
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  const calls = await aiWrites(request);
  expect(calls).toHaveLength(2);
  expect(calls[0].body.operationId).not.toBe(calls[1].body.operationId);
  expect(calls[1].aiHeaders.payer).toBe('Individual');
});

for (const [role, payer, school, href] of [
  ['Personal', 'Individual', false, '/personal/subscription'],
  ['Manager', 'Organization', true, '/personal/subscription?scope=organization'],
] as const)
  test(`${payer} preflight refusal exposes the correct existing credit route and an editable saved question`, async ({
    page,
    context,
    request,
  }) => {
    await enable(request, { quotaAllowed: false });
    await login(context, role, school);
    await page.goto('/personal/assistant?view=chat');
    await chooseAssistantPayer(page, payer);
    await page
      .getByRole('textbox', { name: 'سؤال از دستیار', exact: true })
      .fill('پرسش بدون اعتبار');
    await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText(t.quota);
    await expect(page.getByRole('link', { name: t.credit, exact: true })).toHaveAttribute(
      'href',
      href,
    );
    await expect(page.getByRole('main')).toContainText(t.payers[payer]);
    await captureExactState(
      page,
      ['MK-375'],
      'Quota preflight denied before any AI write; payer and saved question shown without fabricated credit.',
    );
    await page.getByRole('button', { name: t.editQuestion, exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true })).toHaveValue(
      'پرسش بدون اعتبار',
    );
    await expect(page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true })).toBeEnabled();
    expect(await aiWrites(request)).toHaveLength(0);
  });

test('review and explicit source selection never send a request or consume quota on opening', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Personal', false);
  await page.goto('/personal/assistant');
  await page.getByRole('button', { name: /^مرور درس/ }).click();
  await page
    .getByRole('textbox', { name: 'سؤال از دستیار', exact: true })
    .fill('پرسش پیش از انتخاب منبع');
  await page.getByRole('button', { name: 'افزودن منبع', exact: true }).click();
  await expect(page.locator('[data-assistant-source-selection]')).toBeVisible();
  expect(await aiWrites(request)).toHaveLength(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('tab', { name: 'گفتگو', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true })).toHaveValue(
    'پرسش پیش از انتخاب منبع',
  );
});

test('slow preflight is visibly in progress and repeated submit cannot create a second request', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Personal', false);
  await page.goto('/personal/assistant?view=chat');
  await chooseAssistantPayer(page, 'Individual');
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    '**/api/client/backend/api/v1/commerce/ai/simple-text/preflight',
    async (route) => {
      const response = await route.fetch();
      await held;
      await route.fulfill({ response });
    },
  );
  try {
    await page
      .getByRole('textbox', { name: 'سؤال از دستیار', exact: true })
      .fill('پرسش در حال پردازش');
    await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: t.sending })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ارسال سؤال', exact: true })).toBeDisabled();
    expect(await aiWrites(request)).toHaveLength(0);
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  expect(await aiWrites(request)).toHaveLength(1);
});
