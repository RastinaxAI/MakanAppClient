import { reviewPath } from './review-output';
import { captureExactState } from './exact-state-capture';
import { test, expect, login, ids, fixture, origin, chooseSchoolCatalog } from './test';
import { mkdir } from 'node:fs/promises';
const base = '/personal/education',
  shots = reviewPath('output/review/project-expansion');

test('Manager creates a class only after review; catalog search, failed submit and reload keep the draft', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Manager');
  await page.goto(base + '/classes');
  await page.getByRole('link', { name: 'کلاس تازه', exact: true }).click();
  await expect(page).toHaveURL(/classes\/new$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('عنوان کلاس', { exact: true }).fill('کلاس مستقل جدید');
  await page.getByLabel('ظرفیت', { exact: true }).fill('24');
  await chooseSchoolCatalog(page, 'درس', 'ریاضی');
  await chooseSchoolCatalog(page, 'دوره', 'دورهٔ نمونه');
  await page.getByLabel('درس کاتالوگ', { exact: true }).click();
  const catalog = page.getByRole('dialog', { name: 'انتخاب درس', exact: true });
  await catalog.getByLabel('جستجوی کاتالوگ درس‌ها', { exact: true }).fill('ریاضی');
  await catalog.getByLabel('جستجوی کاتالوگ درس‌ها', { exact: true }).press('Enter');
  await expect(catalog.getByRole('button', { name: 'انتخاب ریاضی', exact: true })).toBeVisible();
  await captureExactState(page, ['MK-93']);
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('درس کاتالوگ', { exact: true })).toBeFocused();
  await expect(page).not.toHaveURL(/step=review/);
  expect(await page.locator('form form').count()).toBe(0);
  page.once('dialog', (d) => d.accept());
  await page.reload();
  await expect(page.getByLabel('عنوان کلاس', { exact: true })).toHaveValue('کلاس مستقل جدید');
  await page.getByRole('button', { name: 'بازبینی کلاس', exact: true }).click();
  await captureExactState(page, ['MK-94']);

  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) =>
        r.method === 'POST' && r.path === '/api/v1/academic/classes',
    ),
  ).toHaveLength(0);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/academic/classes', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'بازگشت و ویرایش', exact: true }).click();
  await expect(page.getByLabel('عنوان کلاس', { exact: true })).toHaveValue('کلاس مستقل جدید');
  await mkdir(shots, { recursive: true });
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `${shots}/class-create-${width}.png` });
  }
  await page.getByRole('button', { name: 'بازبینی کلاس', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'کلاس ایجاد شد', exact: true })).toBeVisible();
});

test('Teacher creates and edits a session on independent pages and cancellation stays pending after a failed service', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto(`${base}/classes/${ids.class}`);
  await page.getByRole('link', { name: 'ایجاد جلسه', exact: true }).click();
  await page.getByLabel('عنوان جلسه', { exact: true }).fill('جلسهٔ آزمایشی مستقل');
  await page.getByLabel('شروع', { exact: true }).fill('1405/08/09 10:00');
  await page.getByLabel('پایان', { exact: true }).fill('1405/08/09 11:00');
  await captureExactState(page, ['MK-122']);

  await page.getByRole('button', { name: 'بازبینی جلسه', exact: true }).click();
  await captureExactState(page, ['MK-123']);
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page).toHaveURL(/\/sessions\/[0-9a-f-]+$/);
  await captureExactState(
    page,
    ['MK-456'],
    'Teacher session detail after a valid fixture creation; this capture alone does not exercise attendance.',
  );
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  await page.getByRole('dialog').getByRole('link', { name: 'ویرایش جلسه', exact: true }).click();
  await page.getByLabel('عنوان', { exact: true }).fill('جلسهٔ ویرایش‌شده');
  await captureExactState(page, ['MK-125']);

  await page.getByRole('button', { name: 'ذخیره ویرایش', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'جلسهٔ ویرایش‌شده', exact: true })).toBeVisible();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'لغو جلسه', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'لغو این جلسه؟', exact: true });
  await expect(dialog).toBeVisible();
  await captureExactState(page, ['MK-126']);

  await request.post(fixture + '/__test__/fault', {
    data: { path: '/cancel', method: 'POST', status: 503 },
  });
  await dialog.getByRole('button', { name: 'لغو جلسه', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'لغو جلسه', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  const remaining = page.getByRole('dialog', { name: 'گزینه‌های بیشتر', exact: true });
  await expect(remaining.getByRole('button', { name: 'لغو جلسه', exact: true })).toHaveCount(0);
  await expect(remaining.getByRole('link', { name: 'ویرایش جلسه', exact: true })).toHaveCount(0);
});

test('Teacher and Student cannot enter Manager creation pages and deep-link review cannot bypass validation', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto(base + '/classes/new');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('عنوان کلاس')).toHaveCount(0);
  await page.goto(`${base}/classes/${ids.class}/exams/new?step=rules`);
  await expect(page.getByRole('button', { name: 'ساخت پیش‌نویس', exact: true })).toBeDisabled();
  await login(context, 'Student');
  await page.goto(`${base}/classes/${ids.class}/sessions/new`);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) =>
        r.method === 'POST' && /\/classes$|\/sessions$|\/exams$/.test(r.path),
    ),
  ).toHaveLength(0);
});

test('Manager person create/edit uses stable operations, server versions and authoritative details', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Manager');
  await page.goto(base + '/people/new');
  await page.getByLabel('نام', { exact: true }).fill('نام');
  await page.getByLabel('نام خانوادگی', { exact: true }).fill('آزمایشی');
  await page.getByLabel('دلیل ثبت یا تغییر پرونده', { exact: true }).fill('بررسی محیط آزمایش');
  await page.getByRole('button', { name: 'بازبینی اطلاعات', exact: true }).click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/organization/people', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page).toHaveURL(/\/people\/[0-9a-f-]+$/);
  await captureExactState(page, ['MK-106']);
  await page.getByRole('link', { name: 'ویرایش پرونده', exact: true }).click();
  await page.getByLabel('نام', { exact: true }).fill('نام تازه');
  await page.getByLabel('دلیل ثبت یا تغییر پرونده', { exact: true }).fill('اصلاح نام');
  await page.getByRole('button', { name: 'بازبینی اطلاعات', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'نام تازه آزمایشی', exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json(),
    posts = state.requests.filter(
      (r: { method: string; path: string }) =>
        r.method === 'POST' && r.path === '/api/v1/organization/people',
    );
  expect(posts).toHaveLength(2);
  expect(posts[0].body.clientOperationId).toBe(posts[1].body.clientOperationId);
});

test('exam author uses independent creation/question/review and a confirmation before publication', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto(`${base}/classes/${ids.class}/exams/new`);
  await page.getByLabel('عنوان', { exact: true }).fill('آزمون مستقل');
  await page.getByLabel('شروع دسترسی', { exact: true }).fill('1405/08/09 09:00');
  await page.getByLabel('شروع دسترسی', { exact: true }).blur();
  await page.getByLabel('پایان دسترسی', { exact: true }).fill('1405/08/10 09:00');
  await page.getByLabel('پایان دسترسی', { exact: true }).blur();
  await page.getByRole('button', { name: 'ادامه تنظیمات آزمون', exact: true }).click();
  await page.getByLabel('مدت پاسخ', { exact: true }).fill('۳۰');
  await page.getByLabel('حداکثر تلاش', { exact: true }).fill('۲');
  await page.getByLabel('نمره کل', { exact: true }).fill('۳۰');
  await captureExactState(
    page,
    ['MK-151'],
    'Native rules use the same existing exam creation command.',
  );
  await page.getByRole('button', { name: 'ساخت پیش‌نویس', exact: true }).click();
  await expect(page).toHaveURL(/\/exams\/.+\/edit$/);
  await page.getByRole('link', { name: 'افزودن پرسش', exact: true }).click();
  await expect(page).toHaveURL(/\/questions\/new$/);
  await page.getByLabel('صورت سؤال', { exact: true }).fill('پرسش آزمایشی');
  await page.getByLabel('بارم', { exact: true }).fill('۳۰');
  await page.getByRole('switch', { name: 'پیوست پاسخ', exact: true }).check();
  await page.getByLabel('سیاست فایل', { exact: true }).click();
  const filePolicy = page.getByRole('dialog', { name: 'سیاست فایل', exact: true });
  await filePolicy
    .getByRole('checkbox', { name: 'پاسخ متنی همراه فایل الزامی باشد', exact: true })
    .uncheck();
  await filePolicy.getByLabel('حداکثر تعداد فایل (اختیاری)', { exact: true }).fill('۲');
  await filePolicy
    .getByLabel('حداکثر حجم مجموع فایل‌ها به مگابایت (اختیاری)', { exact: true })
    .fill('۵');
  await filePolicy.getByRole('button', { name: 'انجام شد', exact: true }).click();
  await captureExactState(page, ['MK-152']);
  const questionRequest = page.waitForRequest(
    (r) => r.method() === 'POST' && r.url().endsWith('/questions'),
  );
  await page.getByRole('button', { name: 'ذخیره پرسش', exact: true }).click();
  expect((await questionRequest).postDataJSON().attachmentPolicy).toEqual({
    attachmentsAllowed: true,
    textRequired: false,
    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maximumCount: 2,
    maximumTotalBytes: 5 * 1024 * 1024,
  });
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByRole('link', { name: 'بازبینی و انتشار آزمون', exact: true }).click();
  await captureExactState(page, ['MK-154']);
  await page.getByRole('button', { name: 'انتشار آزمون برای کلاس', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'تأیید انتشار آزمون', exact: true })
    .click();
  await expect(page.getByText('این نسخهٔ آزمون منتشر شده است.', { exact: true })).toBeVisible();
});

test('notification preferences preserve failed edits, mandatory flags and scope while center reads server notifications', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  await page.goto('/personal/settings/notifications');
  await page.getByRole('link', { name: /امنیت حساب/ }).click();
  await expect(page.getByLabel('اعلان دستگاه', { exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: /پیام‌ها/ })
    .click();
  const push = page.getByLabel('اعلان دستگاه', { exact: true });
  await push.uncheck();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/notification-preferences/Messages', method: 'PUT', status: 503 },
  });
  await page.getByRole('button', { name: 'ثبت تنظیمات', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(push).not.toBeChecked();
  await page.getByRole('button', { name: 'ثبت تنظیمات', exact: true }).click();
  await expect(page.getByText('تنظیمات اعلان ثبت شد.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await page.getByRole('link', { name: 'آموزشگاه فعال', exact: true }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: /پیام‌ها/ })
    .click();
  await expect(page.getByLabel('اعلان دستگاه', { exact: true })).toBeChecked();
  await page.goto('/personal/notifications');
  await expect(page.getByRole('heading', { name: 'تکلیف جدید کلاس', exact: true })).toBeVisible();
  await page.getByLabel('فقط خوانده‌نشده‌ها', { exact: true }).check();
  await page.getByRole('button', { name: 'علامت‌گذاری به‌عنوان خوانده‌شده', exact: true }).click();
  await expect(page.getByText('اعلانی برای نمایش نیست', { exact: true })).toBeVisible();
});

test('device revocation requires confirmation, preserves failure and is bound to account, origin and context', async ({
  page,
  context,
  request,
  browser,
}) => {
  const session = await login(context);
  await page.goto('/personal/settings/devices');
  await expect(page.getByText('دستگاه آزمایشی دوم', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'پایان این نشست', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'پایان نشست دستگاه؟', exact: true });
  await expect(dialog).toBeVisible();
  await captureExactState(page, ['MK-351']);
  // Fault by exact endpoint suffix, without relying on a session ID encoding.
  const sessions = await (
    await context.request.get(origin + '/api/client/security/sessions', {
      headers: { 'X-Makan-Context': session.revision },
    })
  ).json();
  const other = sessions.find((x: { isCurrent: boolean }) => !x.isCurrent);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/sessions/' + other.id, method: 'DELETE', status: 503 },
  });
  await dialog.getByRole('button', { name: 'پایان نشست', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(page.getByText('دستگاه آزمایشی دوم', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'انصراف', exact: true }).click();
  await expect(page.getByRole('button', { name: 'پایان این نشست', exact: true })).toBeFocused();
  expect(
    (
      await context.request.delete(origin + '/api/client/security/sessions/' + other.id, {
        headers: { Origin: 'https://wrong.example', 'X-Makan-Context': session.revision },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await context.request.delete(origin + '/api/client/security/sessions/' + other.id, {
        headers: { Origin: origin, 'X-Makan-Context': 'old' },
      })
    ).status(),
  ).toBe(409);
  const second = await browser.newContext({ baseURL: origin });
  const teacher = await login(second, 'Teacher');
  expect(
    (
      await second.request.delete(origin + '/api/client/security/sessions/' + other.id, {
        headers: { Origin: origin, 'X-Makan-Context': teacher.revision },
      })
    ).status(),
  ).toBe(404);
  await second.close();
  await page.getByRole('button', { name: 'پایان این نشست', exact: true }).click();
  await dialog.getByRole('button', { name: 'پایان نشست', exact: true }).click();
  await expect(page.getByText('دستگاه آزمایشی دوم', { exact: true })).toHaveCount(0);
  await expect(page.getByText('دستگاه فعلی', { exact: true })).toBeVisible();
  await mkdir(shots, { recursive: true });
  for (const [width, height] of [
    [390, 844],
    [834, 1194],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `${shots}/devices-${width}.png` });
  }
});
