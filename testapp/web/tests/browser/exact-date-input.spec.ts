import { test, expect, fixture, login, ids } from './test';
import * as copy from '../../src/content/fa';
const t = copy.v5ScheduleRules;
const old = copy.v4Text;

test('the resting Persian date, numeric editor and calendar retain one canonical date; incomplete input cannot create a weekly rule', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager');
  await page.goto('/personal/education/classes/' + ids.class + '/schedule-rules/new');
  await page.getByLabel(t.time, { exact: true }).fill('16:00');
  await page.getByLabel(t.duration, { exact: true }).fill('60');
  await page.getByLabel(t.title, { exact: true }).fill('تمرین تقویم');
  await page.getByRole('button', { name: t.next, exact: true }).click();
  const from = page.getByLabel(old.startDate, { exact: true });
  const until = page.getByLabel(old.endDate, { exact: true });
  await from.fill('۱۴۰۶/۰۱/۱۵');
  await from.blur();
  await expect(from).toHaveValue('۱۵ فروردین ۱۴۰۶');
  await expect(from).toHaveAttribute('dir', 'rtl');
  await from.focus();
  await expect(from).toHaveValue('1406/01/15');
  await from.press('ArrowDown');
  const calendar = page.getByRole('group', { name: copy.text_401b4bf7fd95, exact: true });
  await expect(calendar.locator('.jdp-day.selected')).toHaveText('۱۵');
  await calendar.locator('.jdp-day.selected').focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(calendar).toBeHidden();
  await expect(from).toBeFocused();
  await expect(from).toHaveValue('1406/01/16');
  await from.blur();
  await expect(from).toHaveValue('۱۶ فروردین ۱۴۰۶');
  await from.fill('١٤٠٦/٠١/١٦');
  await from.blur();
  await expect(from).toHaveValue('۱۶ فروردین ۱۴۰۶');
  await until.fill('١٤٠٦/٠');
  await until.blur();
  await expect(until).toHaveValue('1406/0');
  await expect(until).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('checkbox', { name: t.reviewed, exact: true })).not.toBeChecked();
  await until.evaluate((input: HTMLInputElement) => input.form?.requestSubmit());
  const path = '/api/v1/academic/classes/' + ids.class + '/schedule-rules';
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await until.fill('١٤٠٦/٠١/٣٠');
  await until.blur();
  await expect(until).toHaveValue('۳۰ فروردین ۱۴۰۶');
  await page.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
  await page.getByRole('button', { name: t.create, exact: true }).click();
  await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toMatchObject({
    effectiveFrom: '2027-04-05',
    effectiveUntil: '2027-04-19',
    localStartTime: '16:00:00',
  });
});

test('a localized date-time label preserves the edited wall time through calendar Escape and the existing session timestamp adapter', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/education/classes/' + ids.class + '/sessions/new');
  await page.getByLabel(copy.text_70786012eed4, { exact: true }).fill('جلسه تقویم');
  const start = page.getByLabel(copy.v5SchoolForms.start, { exact: true });
  const end = page.getByLabel(copy.v5SchoolForms.end, { exact: true });
  await start.fill('١٤٠٥/٠٨/٠٩ ١٠:٠٠');
  await start.blur();
  await expect(start).toHaveValue('۹ آبان، ۱۰:۰۰');
  await start.focus();
  await start.press('ArrowDown');
  const calendar = page.getByRole('group', { name: copy.text_e3211dce980c, exact: true });
  await expect(calendar.locator('.jdp-day.selected')).toHaveText('۹');
  await page.keyboard.press('Escape');
  await expect(calendar).toBeHidden();
  await expect(start).toBeFocused();
  await expect(start).toHaveValue('1405/08/09 10:00');
  await start.blur();
  await end.fill('۱۴۰۵/۰۸/۰۹ ۱۱:۰۰');
  await end.blur();
  await page.getByRole('button', { name: 'بازبینی جلسه', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/[0-9a-f-]+$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/academic/classes/' + ids.class + '/sessions' && r.method === 'POST',
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toMatchObject({
    startUtc: '2026-10-31T06:30:00.000Z',
    endUtc: '2026-10-31T07:30:00.000Z',
    timeZoneId: 'Asia/Tehran',
  });
});
