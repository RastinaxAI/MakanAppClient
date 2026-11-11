import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v4_more, v5Notifications as t } from '../../src/content/fa';
const root = '/personal/settings/notifications';
const path = '/api/v1/notification-preferences/Assignments';

test('native notification switches keep quiet-hour values and the acknowledged version across a failed save and reload', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design', { data: { webPushConfigured: true } });
  await login(context, 'Student', false);
  await page.goto(root + '/Assignments');
  await expect(page.getByRole('heading', { name: 'اعلان تکلیف‌ها', exact: true })).toBeVisible();
  const form = page.locator('[data-notification-preference-form]');
  await expect(form.getByRole('switch')).toHaveCount(3);
  await page.getByRole('switch', { name: t.quietHours, exact: true }).check();
  const start = page.getByLabel('شروع سکوت', { exact: true });
  const end = page.getByLabel('پایان سکوت', { exact: true });
  const zone = page.getByLabel('منطقهٔ زمانی', { exact: true });
  const save = page.getByRole('button', { name: t.saveAssignments, exact: true });
  await start.fill('25:00');
  await end.fill('08:00');
  await save.click();
  expect(await start.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
  await start.fill('22:00');
  await end.fill('08:00');
  await zone.fill('Asia/Tehran');
  await captureExactState(
    page,
    ['MK-346'],
    'Actual Personal context and configured fixture service, current account preferences; no device permission requested.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path, method: 'PUT', status: 503 },
  });
  await save.click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(start).toHaveValue('۲۲:۰۰');
  await expect(end).toHaveValue('۰۸:۰۰');
  await expect(zone).toHaveValue(t.tehran);
  await save.click();
  await expect(page.getByText('تنظیمات اعلان ثبت شد.', { exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (row: { path: string; method: string }) => row.path === path && row.method === 'PUT',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[0].body).toMatchObject({
    quietHoursStartLocal: '22:00:00',
    quietHoursEndLocal: '08:00:00',
    timeZoneId: 'Asia/Tehran',
    expectedRowVersion: '1',
  });
  await page.reload();
  await expect(start).toHaveValue('۲۲:۰۰');
  await expect(end).toHaveValue('۰۸:۰۰');
  await expect(save).toBeDisabled();
  await page.route(
    '**/api/client/backend/api/v1/notifications/devices/web-push/configuration',
    (route) => route.fulfill({ json: { isConfigured: false, vapidPublicKey: null } }),
  );
  await page.reload();
  await expect(
    page.getByText(
      'دریافت اعلان در این مرورگر اکنون در دسترس نیست. ترجیح اعلان حساب شما جداگانه ذخیره می‌شود.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.goto(root + '/AccountSecurity');
  await expect(page.getByRole('switch', { name: 'اعلان دستگاه', exact: true })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'پیامک', exact: true })).toBeDisabled();
});

for (const mismatch of ['category', 'scope', 'organization'])
  test(
    'a notification acknowledgment from another ' +
      mismatch +
      ' cannot replace the edited preference or its version',
    async ({ page, context, request }) => {
      await login(context, 'Student', false);
      await page.goto(root + '/Assignments');
      const push = page.getByRole('switch', { name: 'اعلان دستگاه', exact: true });
      await push.uncheck();
      const pattern = '**/api/client/backend' + path;
      await page.route(pattern, async (route) => {
        if (route.request().method() !== 'PUT') return route.continue();
        const response = await route.fetch();
        const data = await response.json();
        await route.fulfill({
          response,
          json: {
            ...data,
            ...(mismatch === 'category'
              ? { category: 'Messages' }
              : mismatch === 'scope'
                ? { scope: 'Organization' }
                : { organizationId: '00000000-0000-4000-8000-000000009999' }),
          },
        });
      });
      const save = page.getByRole('button', { name: t.saveAssignments, exact: true });
      await save.click();
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(push).not.toBeChecked();
      await expect(page.getByText('تنظیمات اعلان ثبت شد.', { exact: true })).toHaveCount(0);
      await page.unroute(pattern);
      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
      await page.getByRole('button', { name: 'دریافت نسخهٔ تازه', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
      await expect(save).toBeDisabled();
      await page.getByRole('switch', { name: 'پیامک', exact: true }).check();
      await save.click();
      await expect(page.getByText('تنظیمات اعلان ثبت شد.', { exact: true })).toBeVisible();
      const state = await (await request.get(fixture + '/__test__/state')).json();
      const writes = state.requests.filter(
        (row: { path: string; method: string }) =>
          row.path.startsWith('/api/v1/notification-preferences/') && row.method === 'PUT',
      );
      expect(writes.map((row: { path: string }) => row.path)).toEqual([path, path]);
      expect(writes[1].body.expectedRowVersion).toBe('2');
    },
  );
