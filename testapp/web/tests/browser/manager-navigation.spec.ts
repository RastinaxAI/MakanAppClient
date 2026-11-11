import { reviewPath } from './review-output';
import { test, expect, login, schoolSections, fixture } from './test';
import { mkdir } from 'node:fs/promises';
const base = '/personal/education';

test('members and records retain the same selected school destination and navigation position', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/directory-case');
  await login(context, 'Manager');
  await mkdir(reviewPath('output/review/manager-navigation'), { recursive: true });
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/members');
    const nav = await schoolSections(page);
    const destination = nav.getByRole('link', { name: 'اعضا', exact: true });
    const sections = page.getByRole('navigation', { name: 'اعضا و پرونده‌ها', exact: true });
    await expect(destination).toHaveAttribute('aria-current', 'page');
    const before = await nav.boundingBox();
    await page.keyboard.press('Escape');
    await sections.getByRole('link', { name: 'پرونده‌های آموزشی', exact: true }).click();
    await expect(page).toHaveURL(base + '/people');
    await schoolSections(page);
    await expect(destination).toHaveAttribute('aria-current', 'page');
    const after = await nav.boundingBox();
    await page.keyboard.press('Escape');
    await expect(
      sections.getByRole('link', { name: 'پرونده‌های آموزشی', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(Math.abs(after!.height - before!.height)).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: reviewPath(`output/review/manager-navigation/records-${width}.png`),
    });
    await sections.getByRole('link', { name: 'اعضای آموزشگاه', exact: true }).click();
    await expect(page).toHaveURL(base + '/members');
    await expect(
      sections.getByRole('link', { name: 'اعضای آموزشگاه', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await page.screenshot({
      path: reviewPath(`output/review/manager-navigation/members-${width}.png`),
    });
  }
});

test('manager actions and report choices remain clear, reachable and responsive', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager');
  await mkdir(reviewPath('output/review/manager-navigation'), { recursive: true });
  for (const [path, title, action, href] of [
    ['classes', 'مدیریت کلاس‌های آموزشگاه', 'کلاس تازه', '/classes/new'],
    ['guardians', 'والدین و دسترسی فرزندان', 'افزودن رابطهٔ والد و فرزند', '/guardians/new'],
    ['invitations', 'مدیریت دعوت‌های آموزشگاه', 'دعوت والد برای دانش‌آموز', '/guardians/new'],
    ['reports', 'گزارش‌های آموزشگاه', 'کارکرد معلمان', '/reports?kind=teacher-workload'],
  ]) {
    await page.goto(base + '/' + path);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    const link = page.getByRole('link', { name: action, exact: true });
    await expect(link).toHaveAttribute('href', base + href);
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: reviewPath(`output/review/manager-navigation/${path}-${width}.png`),
      });
    }
  }
  const reports = page.getByRole('navigation', { name: 'نوع گزارش مدیر', exact: true });
  await expect(reports.getByRole('link')).toHaveCount(5);
  await expect(
    reports.getByRole('link', { name: 'فعالیت محتوایی معلمان', exact: true }),
  ).toBeVisible();
  await reports.getByRole('link', { name: 'حضور کلاس‌ها', exact: true }).click();
  await expect(page).toHaveURL(/kind=attendance$/);
  await expect(reports.getByRole('link', { name: 'حضور کلاس‌ها', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.goto(base + '/invitations');
  const invitations = page.getByRole('navigation', { name: 'اقدام‌های دعوت و عضویت', exact: true });
  await expect(invitations.getByRole('link')).toHaveCount(3);
  await invitations.getByRole('link', { name: 'پرونده‌ها و اتصال حساب', exact: true }).click();
  await expect(page).toHaveURL(base + '/people');
  await page.goBack();
  await invitations.getByRole('link', { name: 'اعضای فعلی آموزشگاه', exact: true }).click();
  await expect(page).toHaveURL(base + '/members');
});
