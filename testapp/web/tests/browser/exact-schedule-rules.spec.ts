import { test, expect, fixture, login, ids } from './test';
import type { Page } from '@playwright/test';
import { captureExactState } from './exact-state-capture';
import {
  v4Text as old,
  v5ScheduleRules as t,
  text_6afc863be80c as saved,
} from '../../src/content/fa';
const root = '/personal/education/classes/' + ids.class + '/schedule-rules/new';
const createPath = '/api/v1/academic/classes/' + ids.class + '/schedule-rules';
async function details(page: Page) {
  await page.getByLabel(t.day, { exact: true }).selectOption('Monday');
  await page.getByLabel(t.time, { exact: true }).fill('16:00');
  await page.getByLabel(t.duration, { exact: true }).fill('60');
  await page.getByLabel(t.title, { exact: true }).fill('حل تمرین ریاضی');
}
async function range(page: Page) {
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await page.getByLabel(old.startDate, { exact: true }).fill('۱۴۰۶/۰۱/۰۱');
  await page.getByLabel(old.startDate, { exact: true }).blur();
  await page.getByLabel(old.endDate, { exact: true }).fill('۱۴۰۶/۰۱/۳۰');
  await page.getByLabel(old.endDate, { exact: true }).blur();
  await page.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
}
async function create(page: Page) {
  await details(page);
  await range(page);
  await page.getByRole('button', { name: t.create, exact: true }).click();
  await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toBeVisible();
}
async function editRange(page: Page) {
  await page.getByRole('button', { name: old.editRule, exact: true }).click();
  await page.getByLabel(t.time, { exact: true }).fill('17:00');
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await page.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
}

test('weekly details and range are separate native steps; validation, back, resize and reload retain the scoped draft without an early write', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager');
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('button', { name: 'ذخیره ظاهر', exact: true }).click();
  await page.goto(root);
  await details(page);
  await expect(page.getByLabel(old.startDate, { exact: true })).toHaveCount(0);
  await captureExactState(page, ['MK-131']);
  await range(page);
  await expect(page.getByLabel(t.title, { exact: true })).toHaveCount(0);
  const reviewed = page.getByRole('checkbox', { name: t.reviewed, exact: true });
  await page.getByLabel(old.endDate, { exact: true }).fill('۱۴۰۶/۰۱/۲۹');
  await page.getByLabel(old.endDate, { exact: true }).blur();
  await expect(reviewed).not.toBeChecked();
  await page.getByRole('button', { name: t.create, exact: true }).click();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) => row.path === createPath && row.method === 'POST',
    ),
  ).toHaveLength(0);
  await page.getByRole('banner').getByRole('button', { name: old.back, exact: true }).click();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('حل تمرین ریاضی');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await expect(page.getByLabel(old.endDate, { exact: true })).toHaveValue('۲۹ فروردین ۱۴۰۶');
  await page.getByRole('banner').getByRole('button', { name: old.back, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('حل تمرین ریاضی');
  await page.getByRole('button', { name: t.next, exact: true }).click();
  page.on('dialog', (dialog) => dialog.accept());
  await expect(page).toHaveURL(/\?step=range$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel(old.endDate, { exact: true })).toHaveValue('۲۹ فروردین ۱۴۰۶');
  await reviewed.check();
  await captureExactState(page, ['MK-132']);
  await request.post(fixture + '/__test__/fault', {
    data: { path: createPath, method: 'POST', status: 422 },
  });
  await page.getByRole('button', { name: t.create, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toHaveCount(0);
  await expect(page.getByLabel(old.endDate, { exact: true })).toHaveValue('۲۹ فروردین ۱۴۰۶');
  await page.getByRole('button', { name: t.create, exact: true }).click();
  await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (row: { path: string; method: string }) => row.path === createPath && row.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[1].body).toMatchObject({
    localDayOfWeek: 'Monday',
    localStartTime: '16:00:00',
    durationMinutes: 60,
    timeZoneId: 'Asia/Tehran',
    effectiveFrom: '2027-03-21',
    effectiveUntil: '2027-04-18',
    meetingUrl: null,
  });
});

test('editing survives reload as a versioned PATCH, confines focus in the date dialog and keeps the date and version after a definitive rejection', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager');
  await page.goto(root);
  await create(page);
  await editRange(page);
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByRole('button', { name: t.create, exact: true })).toHaveCount(0);
  await expect(page.getByLabel(old.startDate, { exact: true })).toHaveValue('۱ فروردین ۱۴۰۶');
  await page.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
  const trigger = page.getByRole('button', { name: t.reviewChange, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: t.change, exact: true });
  await expect(dialog).toContainText('۱۶:۰۰');
  await expect(dialog).toContainText('۱۷:۰۰');
  await dialog.getByLabel(t.apply, { exact: true }).fill('۱۴۰۵/۱۲/۲۹');
  await dialog.getByLabel(t.apply, { exact: true }).blur();
  await dialog.getByRole('button', { name: t.saveChange, exact: true }).click();
  await expect(dialog.getByLabel(t.apply, { exact: true })).toHaveAttribute('aria-invalid', 'true');
  const rejected = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    rejected.requests.filter((row: { method: string }) => row.method === 'PATCH'),
  ).toHaveLength(0);
  await dialog.getByLabel(t.apply, { exact: true }).fill('۱۴۰۶/۰۱/۱۵');
  await dialog.getByLabel(t.apply, { exact: true }).blur();
  await captureExactState(page, ['MK-133']);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByLabel(t.apply, { exact: true })).toHaveValue('۱۵ فروردین ۱۴۰۶');
  await request.post(fixture + '/__test__/fault', {
    data: {
      path: '/api/v1/academic/schedule-rules/00000000-0000-4000-8000-000000019000',
      method: 'PATCH',
      status: 422,
    },
  });
  await dialog.getByRole('button', { name: t.saveChange, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel(t.apply, { exact: true })).toHaveValue('۱۵ فروردین ۱۴۰۶');
  await dialog.getByRole('button', { name: t.saveChange, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const creates = state.requests.filter(
    (row: { path: string; method: string }) => row.path === createPath && row.method === 'POST',
  );
  const edits = state.requests.filter(
    (row: { path: string; method: string }) =>
      row.path.startsWith('/api/v1/academic/schedule-rules/') && row.method === 'PATCH',
  );
  expect(creates).toHaveLength(1);
  expect(edits).toHaveLength(2);
  expect(edits[0].body).toEqual(edits[1].body);
  expect(edits[1].body).toMatchObject({
    localStartTime: '17:00:00',
    expectedRowVersion: '1',
    applyFromDate: '2027-04-04',
  });
});

for (const mismatch of ['classId', 'organizationId', 'id', 'rowVersion'])
  test(
    'a schedule update acknowledgment with a different ' +
      mismatch +
      ' cannot announce success or replace its draft',
    async ({ page, context, request }) => {
      await request.post(fixture + '/__test__/manager-case');
      await login(context, 'Manager');
      await page.goto(root);
      await create(page);
      await editRange(page);
      await page.route('**/api/client/backend/api/v1/academic/schedule-rules/*', async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          json: {
            ...(await response.json()),
            [mismatch]: mismatch === 'rowVersion' ? '' : '00000000-0000-4000-8000-000000009999',
          },
        });
      });
      await page.getByRole('button', { name: t.reviewChange, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: t.change, exact: true });
      await dialog.getByRole('button', { name: t.saveChange, exact: true }).click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('heading', { name: old.lastRule, exact: true })).toHaveCount(0);
      await expect(page.getByText(saved, { exact: true })).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: t.reviewChange, exact: true })).toBeVisible();
      await expect(page.getByLabel(old.startDate, { exact: true })).toHaveValue('۱ فروردین ۱۴۰۶');
    },
  );
