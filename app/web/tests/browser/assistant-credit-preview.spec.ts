import { test, expect, login, fixture } from './test';
import { assistantOptions, returnToAssistantQuestion } from './assistant-controls';
import { aiIntegration as t } from '../../src/content/fa';

test('exhausted real credit code is visible before sending and never triggers AI or a fallback payer', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', {
    data: { quotaAllowed: false, quotaCode: 'QUOTA_EXCEEDED' },
  });
  await login(context, 'Student');
  await page.goto('/personal/assistant');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش حفظ‌شده برای بررسی سهمیه');
  const options = await assistantOptions(page);
  await options.getByLabel(t.payer, { exact: true }).selectOption('FreeTrial');
  await expect(options.locator('[data-assistant-quota-preview]')).toContainText(t.quotaExceeded);
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue(
    'پرسش حفظ‌شده برای بررسی سهمیه',
  );
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.locator('[data-v5-scene="MK-375"]')).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.quotaExceeded);
  await expect(page.getByRole('heading', { name: t.unavailableTitle, exact: true })).toHaveCount(0);
  await returnToAssistantQuestion(page);
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue(
    'پرسش حفظ‌شده برای بررسی سهمیه',
  );
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { path: string }) => r.path === '/api/v1/ai/chat')).toHaveLength(
    0,
  );
  const preflights = state.requests.filter(
    (r: { path: string }) => r.path === '/api/v1/commerce/ai/simple-text/preflight',
  );
  expect(preflights.length).toBeGreaterThan(0);
  expect(preflights.every((r: { body: { payer: string } }) => r.body.payer === 'FreeTrial')).toBe(
    true,
  );
});

test('refreshing availability after server activation does not send the saved question automatically', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', {
    data: { quotaAllowed: false, quotaCode: 'SUBSCRIPTION_INACTIVE' },
  });
  await login(context, 'Student');
  await page.goto('/personal/assistant');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش پیش از فعال‌شدن اشتراک');
  const options = await assistantOptions(page);
  await options.getByLabel(t.payer, { exact: true }).selectOption('Organization');
  await expect(options.locator('[data-assistant-quota-preview]')).toContainText(
    t.subscriptionInactive,
  );
  await request.post(fixture + '/__test__/ai-integration', { data: { quotaAllowed: true } });
  await options.getByRole('button', { name: t.refreshCredit, exact: true }).click();
  await expect(options.locator('[data-assistant-quota-preview]')).toContainText(
    t.creditRemaining + ' ۳۰',
  );
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { path: string }) => r.path === '/api/v1/ai/chat')).toHaveLength(
    0,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue(
    'پرسش پیش از فعال‌شدن اشتراک',
  );
});

test('a preflight for another owner is rejected and cannot show available credit', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await login(context, 'Student');
  await page.route(
    '**/api/client/backend/api/v1/commerce/ai/simple-text/preflight',
    async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        json: { ...(await response.json()), ownerId: '00000000-0000-4000-8000-000000009999' },
      });
    },
  );
  await page.goto('/personal/assistant');
  const options = await assistantOptions(page);
  await options.getByLabel(t.payer, { exact: true }).selectOption('Organization');
  await expect(options.locator('[data-assistant-quota-preview]')).toContainText(
    t.creditCheckFailed,
  );
  await expect(options.locator('[data-assistant-quota-preview]')).not.toContainText(
    t.creditRemaining,
  );
  await page.unrouteAll({ behavior: 'wait' });
});
