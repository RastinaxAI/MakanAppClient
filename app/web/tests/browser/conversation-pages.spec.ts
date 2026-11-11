import { reviewPath } from './review-output';
import { test, expect, login, fixture, ids } from './test';
import { captureExactState } from './exact-state-capture';
import { mkdir } from 'node:fs/promises';
const group = '00000000-0000-4000-8000-000000000950';
const base = '/personal/messages/' + group;
test('conversation members and media follow server pagination and a media filter restarts its cursor', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Student', false);
  await page.goto(base + '/info');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  await expect(
    page.getByRole('dialog').getByText('توضیحات معتبر گروه آزمایشی', { exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: /^اعضا و مدیران/ }).click();
  await expect(
    page.locator('.v5-list .v5-row').filter({ hasText: 'مالک آزمایشی گفتگو' }),
  ).toBeVisible();
  await expect(page.getByText('عضو آزمایشی دوم', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'صفحهٔ بعد', exact: true }).click();
  await expect(
    page.locator('.v5-list .v5-row').filter({ hasText: 'عضو آزمایشی دوم' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'صفحهٔ بعد', exact: true })).toBeDisabled();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(/\/info$/);
  await page.getByRole('link', { name: /^رسانه و فایل/ }).click();
  await expect(page.getByText('جزوه-50.pdf', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'نمایش بیشتر', exact: true }).click();
  await expect(page.getByText('جزوه-20.pdf', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'نمایش بیشتر', exact: true })).toHaveCount(0);
  const filtered = page.waitForRequest(
    (r) => r.url().includes('/media?') && r.url().includes('kind=Image'),
  );
  await page.getByLabel('نوع رسانه', { exact: true }).selectOption('Image');
  expect((await filtered).url()).not.toContain('beforeSequence');
  await expect(page.getByText('رسانه‌ای در این بخش نیست', { exact: true })).toBeVisible();
  await page.getByLabel('نوع رسانه', { exact: true }).selectOption('');
  await expect(page.getByText('جزوه-50.pdf', { exact: true })).toBeVisible();
  await request.post(fixture + '/__test__/conversation-details', {
    data: { mediaTitle: 'فایل تازه' },
  });
  await expect(page.getByText('فایل تازه-50.pdf', { exact: true })).toBeVisible();
});
test('conversation settings retain failed selections and leave confirmation retains failure until accepted', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Student', false);
  await page.goto(base + '/settings');
  await page
    .getByRole('group', { name: 'نمایان‌بودن', exact: true })
    .getByRole('radio', { name: 'عمومی', exact: false })
    .check();
  await page
    .getByRole('group', { name: 'تاریخچه برای عضو جدید', exact: true })
    .getByRole('radio', { name: 'تاریخچهٔ کامل', exact: false })
    .check();
  await captureExactState(page, ['MK-201', 'MK-447']);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/settings', method: 'PATCH', status: 409 },
  });
  await page.getByRole('button', { name: 'ثبت تنظیمات گفتگو' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: 'نمایان‌بودن', exact: true })
      .getByRole('radio', { name: 'عمومی', exact: false }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'ثبت تنظیمات گفتگو' }).click();
  await expect(page.getByText('تنظیمات گفتگو ثبت شد.', { exact: true })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page.getByText('گروه · عمومی', { exact: true })).toBeVisible();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/leave', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: 'ترک گروه', exact: true }).click();
  await captureExactState(page, ['MK-256', 'MK-448']);
  await page.getByRole('dialog').getByRole('button', { name: 'ترک گفتگو', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'ترک گفتگو', exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/messages$/);
});
test('education roles do not grant group ownership and system managed conversation does not expose manual management', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Teacher', false);
  await page.goto(base + '/settings');
  await expect(page.getByRole('button', { name: 'ثبت تنظیمات گفتگو' })).toHaveCount(0);
  await request.post(fixture + '/__test__/conversation-details', { data: { system: true } });
  await login(context, 'Student', false);
  await page.goto(base + '/info');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
    .click();
  await expect(
    page.getByText('عضویت و مدیریت این فضای رسمی تابع دسترسی آموزشی معتبر است.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'ترک گروه', exact: true })).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.some((r: { method: string }) => r.method === 'PATCH')).toBe(false);
});
test('direct conversation info is reached from chat and archive uses confirmed user state', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/messages/' + ids.chat);
  await page.getByRole('link', { name: 'اطلاعات گفتگو', exact: true }).click();
  await expect(page).toHaveURL(/\/info$/);
  await captureExactState(page, ['MK-180']);
  await page.getByRole('button', { name: 'آرشیو گفتگو', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page).toHaveURL(/filter=Archived/);
  await page.goto('/personal/messages/' + ids.chat + '/info');
  await expect(page.getByRole('button', { name: 'بازگرداندن به گفتگوها' })).toBeVisible();
});
test('conversation detail pages preserve RTL and layout at mobile tablet and desktop', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Student', false);
  await mkdir(reviewPath('output/review/conversation-pages'), { recursive: true });
  for (const section of ['info', 'members', 'settings', 'media']) {
    await page.goto(base + '/' + section);
    await expect(
      page.getByRole('banner').getByRole('heading', {
        name: (
          {
            info: 'اطلاعات گروه',
            members: 'اعضای گروه',
            settings: 'تنظیمات گروه',
            media: 'رسانه‌های گروه',
          } as Record<string, string>
        )[section],
        exact: true,
      }),
    ).toBeVisible();
    for (const [width, height] of [
      [390, 844],
      [834, 1194],
      [1440, 1000],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: reviewPath(`output/review/conversation-pages/${section}-${width}.png`),
      });
      if (width < 768 && ['info', 'settings'].includes(section)) {
        if (section === 'info')
          await page
            .getByRole('banner')
            .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
            .click();
        await (
          section === 'info'
            ? page.getByRole('dialog').locator('.dialog-body')
            : page.getByRole('main')
        ).evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        const action = page.getByRole('button', {
          name: section === 'info' ? 'ترک گروه' : 'ثبت تنظیمات گفتگو',
          exact: true,
        });
        await action.scrollIntoViewIfNeeded();
        await expect(action).toBeInViewport();
        const actionBox = await action.boundingBox();
        await expect(page.locator('[data-app-navigation]:visible')).toHaveCount(0);
        expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(height - 8);
        if (section === 'info') await page.keyboard.press('Escape');
      }
    }
  }
});
