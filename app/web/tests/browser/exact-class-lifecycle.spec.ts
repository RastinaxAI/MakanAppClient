import { test, expect, fixture, login, origin } from './test';
import { captureExactState } from './exact-state-capture';
import { integration80c as t, v5Product, v4_more } from '../../src/content/fa';

const id = '00000000-0000-4000-8000-000000001800';
const route = '/personal/extracurricular/classes/' + id;
const api = '/api/v1/personal-classes/' + id;

test('class lifecycle opens from More, keeps both drafts after Escape and only changes server state after a valid retry', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: { exactV5Members: true } });
  const session = await login(context, 'Personal', false);
  await page.goto(route + '/edit');
  await page.getByLabel(t.capacity, { exact: true }).fill('18');
  const form = page.locator('form').filter({ has: page.getByLabel(t.capacity, { exact: true }) });
  await form.getByLabel(t.reason, { exact: true }).fill('تنظیمات ناتمام کلاس');
  const more = page.getByRole('banner').getByRole('button', { name: v4_more, exact: true });
  const openLifecycle = async (name: string) => {
    await more.click();
    await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    return dialog;
  };
  let dialog = await openLifecycle(t.suspend);
  const reason = 'توقف موقت کارگاه';
  await dialog.getByLabel(t.reason, { exact: true }).fill(reason);
  await captureExactState(page, ['MK-320']);
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  await expect(form.getByLabel(t.reason, { exact: true })).toHaveValue('تنظیمات ناتمام کلاس');
  await expect(page.getByLabel(t.capacity, { exact: true })).toHaveValue('18');
  dialog = await openLifecycle(t.suspend);
  await expect(dialog.getByLabel(t.reason, { exact: true })).toHaveValue(reason);
  await request.post(fixture + '/__test__/fault', {
    data: { path: api + '/suspend', method: 'POST', status: 503 },
  });
  await dialog.getByRole('button', { name: t.suspend, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel(t.reason, { exact: true })).toHaveValue(reason);
  const getClass = async () =>
    (
      await context.request.get(origin + '/api/client/backend' + api, {
        headers: { 'X-Makan-Context': session.revision },
      })
    ).json();
  expect((await getClass()).state).toBe('Active');
  await dialog.getByRole('button', { name: t.suspend, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await getClass()).state).toBe('Suspended');
  await expect(form.getByLabel(t.reason, { exact: true })).toHaveValue('تنظیمات ناتمام کلاس');
  await expect(page.getByLabel(t.capacity, { exact: true })).toHaveValue('18');
  dialog = await openLifecycle(t.archive);
  await dialog.getByLabel(v5Product.archiveReason, { exact: true }).fill('پایان دوره کارگاه');
  await captureExactState(page, ['MK-322']);
  for (const width of [320, 390, 430, 834, 1440]) {
    await page.setViewportSize({ width, height: 500 });
    await expect(dialog.getByRole('button', { name: t.archive, exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (row: { method: string; path: string }) =>
        row.method === 'POST' && row.path === api + '/archive',
    ),
  ).toHaveLength(0);
  const suspended = calls.filter(
    (row: { method: string; path: string }) =>
      row.method === 'POST' && row.path === api + '/suspend',
  );
  expect(suspended).toHaveLength(2);
  expect(
    suspended.every(
      (row: { body: { expectedVersion: string; reason: string } }) =>
        row.body.expectedVersion === 'MDAwMDAwMDE=' && row.body.reason === reason,
    ),
  ).toBe(true);
});
