import { test, expect, login, fixture, origin } from './test';
import { v4Text as t } from '@/content/fa';
const id = '00000000-0000-4000-8000-000000000950',
  base = '/personal/messages/' + id;
async function seed(request: import('@playwright/test').APIRequestContext, readOnly = false) {
  expect(
    (await request.post(fixture + '/__test__/rich-messaging', { data: { readOnly } })).ok(),
  ).toBeTruthy();
}
test('V4 poll draft survives an upstream failure and reload; the same identity is retried', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/poll-new');
  await page.getByLabel(t.question, { exact: true }).fill('زمان جلسه بعد');
  await page.getByLabel(t.option + ' ۱', { exact: true }).fill('شنبه');
  await page.getByLabel(t.option + ' ۲', { exact: true }).fill('دوشنبه');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/polls', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: t.publishPoll, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  const first = (await (await request.get(fixture + '/__test__/state')).json()).requests.find(
    (x: { method: string; path: string }) => x.method === 'POST' && x.path.endsWith('/polls'),
  ).body.clientMessageId;
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel(t.question, { exact: true })).toHaveValue('زمان جلسه بعد');
  await page.getByRole('button', { name: t.publishPoll, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(id + '$'));
  await expect(page.getByRole('button', { name: t.vote, exact: true })).toBeVisible();
  const requests = (await (await request.get(fixture + '/__test__/state')).json()).requests.filter(
    (x: { method: string; path: string }) => x.method === 'POST' && x.path.endsWith('/polls'),
  );
  expect(requests).toHaveLength(2);
  expect(requests[1].body.clientMessageId).toBe(first);
  await page.getByRole('radio', { name: /^شنبه/ }).check();
  await page.getByRole('button', { name: t.vote, exact: true }).click();
  await expect(page.getByRole('radio', { name: /^شنبه/ })).toBeChecked();
  await expect(page.getByRole('button', { name: t.voters, exact: true })).toHaveCount(0);
});
test('V4 checklist publishes real items and a failed item update retains its checked state until confirmed', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Student', false);
  await page.goto(base + '/checklist-new');
  await page.getByLabel(t.title, { exact: true }).fill('آماده‌سازی جلسه');
  await page.getByLabel(t.item + ' ۱', { exact: true }).fill('خواندن جزوه');
  await page.getByLabel(t.item + ' ۲', { exact: true }).fill('نوشتن پرسش');
  await page.getByRole('button', { name: t.publishChecklist, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(id + '$'));
  const item = page.getByRole('checkbox', { name: 'خواندن جزوه', exact: true });
  await expect(item).not.toBeChecked();
  await request.post(fixture + '/__test__/fault', {
    data: {
      path:
        '/checklist/items/' +
        (await (await request.get(fixture + '/__test__/state')).json()).requests.find(
          (x: { method: string; path: string }) =>
            x.method === 'POST' && x.path.endsWith('/checklists'),
        ).body.items[0].itemId,
      method: 'PUT',
      status: 409,
    },
  });
  await item.click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(item).not.toBeChecked();
  await item.click();
  await expect(item).toBeChecked();
});
test('V4 scheduled message uses a real timestamp and cancellation is confirmed by the server', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Student', false);
  await page.goto(base + '/scheduled');
  await page.getByRole('button', { name: t.schedule, exact: true }).click();
  await page.getByLabel(t.text, { exact: true }).fill('یادآوری جلسه');
  const input = page.getByLabel(t.scheduleAt, { exact: true });
  await input.fill('۱۴۰۶/۰۱/۱۰ ۱۰:۳۰');
  await input.blur();
  await page.getByRole('button', { name: t.scheduleSubmit, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.scheduled, exact: true })).toBeVisible();
  await expect(page.getByText('یادآوری جلسه', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: t.cancel, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: t.cancel, exact: true }).last().click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(/لغوشده|لغو شده|باطل/)).toBeVisible();
});
test('V4 folder editor preserves rule strings and a version conflict keeps the user name', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Student', false);
  await page.goto('/personal/messages/folders');
  await page.getByRole('button', { name: t.editFolder + ' آموزشگاه', exact: true }).click();
  await page.getByLabel(t.folderName, { exact: true }).fill('درس‌های من');
  await request.post(fixture + '/__test__/fault', {
    data: {
      path: '/messaging/folders/00000000-0000-4000-8000-000000001900',
      method: 'PUT',
      status: 409,
    },
  });
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByLabel(t.folderName, { exact: true })).toHaveValue('درس‌های من');
  await page.getByRole('button', { name: t.refresh, exact: true }).click();
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page.getByRole('button', { name: 'درس‌های من', exact: true })).toBeVisible();
  const saved = (await (await request.get(fixture + '/__test__/state')).json()).requests
    .filter(
      (x: { method: string; path: string }) =>
        x.method === 'PUT' && x.path.includes('/messaging/folders/'),
    )
    .at(-1).body;
  expect(saved.includedTypes).toBe('Group, Channel');
  expect(saved.excludedTypes).toBe('None');
  await page.getByRole('button', { name: t.newFolder, exact: true }).click();
  await expect(page.getByText(t.folderTypePending, { exact: true }).last()).toBeVisible();
  await page.getByRole('banner').locator(':is(a,button)[aria-label="بازگشت"]:visible').click();
  await expect(
    page.getByRole('button', { name: t.editFolder + ' درس‌های من', exact: true }),
  ).toBeVisible();
});
test('V4 proposal screens perform no account mutation and owner reference screens stay closed', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  for (const section of ['phone', 'delete-account', 'support']) {
    await page.goto('/personal/settings/' + section);
    await expect(page.getByText(t.proposalHint, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: t.save, exact: true })).toHaveCount(0);
  }
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (x: { method: string; path: string }) =>
        ['PATCH', 'DELETE', 'POST'].includes(x.method) &&
        /phone|delete-account|support/.test(x.path),
    ),
  ).toHaveLength(0);
  for (const id of ['MK-173', 'MK-242', 'MK-455', 'MK-463'])
    expect((await request.get(origin + '/preview/reference/' + id)).status()).toBe(404);
});
test('V4 publication tools respect server capabilities and provide a usable gap below the mobile action', async ({
  page,
  context,
  request,
}) => {
  await seed(request, true);
  await login(context, 'Student', false);
  await page.goto(base + '/poll-new');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: t.publishPoll, exact: true })).toHaveCount(0);
  await seed(request);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const button = page.getByRole('button', { name: t.publishPoll, exact: true });
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(826);
  expect(844 - box!.y - box!.height).toBeLessThanOrEqual(24);
  await expect(page.locator('[data-app-navigation]:visible')).toHaveCount(0);
  const question = await page.getByLabel(t.question, { exact: true }).boundingBox();
  const option = await page.getByLabel(t.option + ' ۱', { exact: true }).boundingBox();
  expect(option!.width).toBeCloseTo(question!.width, 0);
  const multiple = page.getByLabel(t.multiple, { exact: true });
  await multiple.check();
  await expect(multiple).toBeChecked();
  const anonymous = page.getByLabel(t.anonymous, { exact: true });
  await anonymous.uncheck();
  await expect(anonymous).not.toBeChecked();
  await anonymous.press('Space');
  await expect(anonymous).toBeChecked();
  expect(await anonymous.evaluate((el) => getComputedStyle(el).appearance)).toBe('none');
});
test('V4 weekly rule creates from a reviewed request and edits using the returned version', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager');
  await page.goto(
    '/personal/education/classes/00000000-0000-4000-8000-000000000002/schedule-rules/new',
  );
  await page.getByLabel(t.sessionTitle, { exact: true }).fill('تمرین هفتگی ریاضی');
  await page.getByLabel(t.startDate, { exact: true }).fill('۱۴۰۶/۰۱/۰۱');
  await page.getByLabel(t.startDate, { exact: true }).blur();
  await page.getByLabel(t.endDate, { exact: true }).fill('۱۴۰۶/۰۱/۳۰');
  await page.getByLabel(t.endDate, { exact: true }).blur();
  await page.getByRole('button', { name: t.reviewRule, exact: true }).click();
  await page.getByRole('button', { name: t.saveRule, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.lastRule, exact: true })).toBeVisible();
  await page.getByRole('button', { name: t.editRule, exact: true }).click();
  await page.getByLabel(t.duration, { exact: true }).fill('90');
  await page.getByRole('button', { name: t.reviewRule, exact: true }).click();
  await page.getByRole('button', { name: t.saveRule, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.lastRule, exact: true })).toBeVisible();
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const saved = calls.find(
    (x: { method: string; path: string }) =>
      x.method === 'PATCH' && x.path.includes('/schedule-rules/'),
  );
  expect(saved.body.expectedRowVersion).toBe('1');
  expect(saved.body.durationMinutes).toBe(90);
  expect(saved.body.applyFromDate).toBe('2027-03-21');
});
