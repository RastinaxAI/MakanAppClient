import { test, expect, login, fixture, ids } from './test';
import { captureExactState } from './exact-state-capture';
import { vnext as t, scheduleFilters as filters } from '../../src/content/fa';

test('capacity review sends no mutation before confirmation and Escape preserves the local form and its focus', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext');
  await login(context, 'Manager');
  await page.goto(`/personal/education/classes/${ids.class}?tab=settings`);
  await page.getByLabel(t.capacity, { exact: true }).fill('30');
  await page.getByLabel(t.reason, { exact: true }).fill('افزایش ظرفیت با تأمین فضای کلاس');
  const save = page.getByRole('button', { name: t.saveClassSettings, exact: true });
  await save.click();
  await expect(
    page.getByRole('dialog', { name: t.confirmCapacityTitle, exact: true }),
  ).toBeVisible();
  const before = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    before.requests.filter(
      (r: { method: string; path: string }) =>
        r.method === 'PATCH' && r.path.endsWith('/classes/' + ids.class),
    ),
  ).toHaveLength(0);
  await captureExactState(page, ['MK-96']);
  await page.keyboard.press('Escape');
  await expect(save).toBeFocused();
  await expect(page.getByLabel(t.capacity, { exact: true })).toHaveValue('30');
  await save.click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: t.confirmSettings, exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toBeVisible();
});

test('unsaved workflow has distinct keep, leave and discard actions and only discards the current draft', async ({
  page,
  context,
}) => {
  await login(context, 'Manager');
  await page.goto('/personal/education/classes/new');
  const name = page.getByLabel('عنوان کلاس', { exact: true });
  await name.fill('پیش‌نویس خصوصی همین کلاس');
  const back = page.getByRole('banner').locator(':is(a,button)[aria-label="بازگشت"]:visible');
  await back.click();
  const dialog = page.getByRole('dialog', { name: 'تغییرات ذخیره نشده', exact: true });
  await expect(dialog).toBeVisible();
  await captureExactState(page, ['MK-430', 'RX-057']);
  await page.keyboard.press('Escape');
  await expect(back).toBeFocused();
  await expect(name).toHaveValue('پیش‌نویس خصوصی همین کلاس');
  await back.click();
  await dialog.getByRole('button', { name: 'دورریختن و خروج', exact: true }).click();
  await expect(page).toHaveURL(/\/education\/classes$/);
  await page.goto('/personal/education/classes/new');
  await expect(name).toHaveValue('');
});

test('schedule filtering is confined to authorized classes and survives width, theme, back and reload', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Teacher');
  await page.goto('/personal/education/schedule');
  const first = await page
    .getByRole('navigation', { name: 'جابه‌جایی هفته', exact: true })
    .getAttribute('data-week-start');
  const at = (h: number) => new Date(Date.parse(first + 'T12:00:00Z') + h * 3600000).toISOString();
  await request.post(fixture + '/__test__/education-case', {
    data: {
      sessions: [
        {
          id: ids.assignment,
          classId: ids.class,
          classTitle: 'ریاضی نهم',
          title: 'جلسه لغوشده مجاز',
          status: 'Cancelled',
          startUtc: at(1),
          endUtc: at(2),
        },
        {
          id: ids.lesson,
          classId: ids.class,
          classTitle: 'ریاضی نهم',
          title: 'جلسه برگزارشونده مجاز',
          status: 'Scheduled',
          startUtc: at(3),
          endUtc: at(4),
        },
      ],
    },
  });
  await page.reload();
  await expect(page.getByRole('link', { name: 'جلسه لغوشده مجاز', exact: true })).toHaveCount(0);
  const trigger = page.getByRole('button', { name: filters.title, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: filters.title, exact: true });
  await dialog.getByRole('radio', { name: 'ریاضی نهم', exact: true }).check();
  await dialog.getByLabel(filters.cancelled, { exact: true }).check();
  await captureExactState(page, ['MK-120', 'RX-053']);
  await dialog.getByRole('button', { name: 'باز کردن تقویم شمسی', exact: true }).click();
  await expect(dialog.getByRole('group', { name: 'انتخاب تاریخ شمسی', exact: true })).toBeVisible();
  await captureExactState(page, ['MK-121', 'RX-056']);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: filters.apply, exact: true }).click();
  await expect(page.getByRole('link', { name: 'جلسه لغوشده مجاز', exact: true })).toBeVisible();
  await captureExactState(page, ['RX-011']);
  await page.reload();
  await trigger.click();
  await expect(dialog.getByRole('radio', { name: 'ریاضی نهم', exact: true })).toBeChecked();
  await expect(dialog.getByLabel(filters.cancelled, { exact: true })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('profile calendar keeps its field label and Escape returns to the date input', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.goto('/personal/profile/edit');
  await page.getByRole('button', { name: 'باز کردن تقویم شمسی', exact: true }).click();
  await expect(page.getByRole('group', { name: 'انتخاب تاریخ شمسی', exact: true })).toBeVisible();
  await captureExactState(page, ['MK-336', 'RX-056']);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'انتخاب تاریخ شمسی', exact: true })).toBeHidden();
});
