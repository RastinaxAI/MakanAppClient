import { test, expect, fixture, login } from './test';
import { v5NotificationDevices as t } from '../../src/content/fa';

test('a real browser can read the notification page after worker activation without a permission or registration action', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/notification-devices', { data: {} });
  await login(context, 'Student', false);
  await page.goto('/personal/settings/notifications/device');
  await expect(page.getByRole('heading', { name: t.title, exact: true }).first()).toBeVisible();
  const permission = await page.evaluate(() => Notification.permission);
  await expect
    .poll(() =>
      page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration('/'))?.active),
    )
    .toBe(true);
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate(() => Notification.permission)).toBe(permission);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { method: string; path: string }) =>
        row.method === 'POST' && row.path.startsWith('/api/v1/notifications/devices'),
    ),
  ).toHaveLength(0);
});
