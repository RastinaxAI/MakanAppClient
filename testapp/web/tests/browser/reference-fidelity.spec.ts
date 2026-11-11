import { v5Lessons as lessons, v5Assignments as assignment } from '../../src/content/fa';
import { selectParentChild } from './parent-controls';
import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect, login, schoolSections, ids, fixture } from './test';

test('current Next product geometry and authoring flows at the three V5 viewport sizes', async ({
  page,
  context,
  request,
}) => {
  expect((await request.post(fixture + '/__test__/design')).ok()).toBeTruthy();
  await login(context, 'Student');
  await mkdir('test-results/reference-match', { recursive: true });
  const metrics = [];
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/personal/education');
    await expect(page.locator('[data-mk-view="MK-04"]')).toHaveCount(1);
    const destinations = page
      .getByRole('navigation', { name: 'ناوبری حساب شخصی' })
      .filter({ visible: true })
      .getByRole('link');
    await expect(destinations).toHaveCount(5);
    for (const [index, name] of [
      'آموزشگاه',
      'فوق‌برنامه',
      'دستیار',
      'پیام‌ها',
      'پروفایل',
    ].entries()) {
      await expect(destinations.nth(index)).toHaveAccessibleName(name);
    }
    const header = await page.getByRole('banner').boundingBox();
    expect(header!.height).toBeGreaterThanOrEqual(width < 768 ? 90 : width < 1200 ? 88 : 94);
    expect(header!.height).toBeLessThan(180);
    await page.screenshot({ path: `test-results/reference-match/S01-actual-${width}.png` });
    metrics.push({
      screen: 'MK-04',
      width,
      height,
      evidence:
        'Actual Next product with isolated design fixture; no atlas counted as product verification.',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.goto('/personal/profile/details');
    await expect(page.getByRole('heading', { name: 'سارا احمدی', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'وضعیت سنی', exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/reference-match/U01-actual-${width}.png` });
  }
  await login(context, 'Student', false);
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/personal/messages/' + ids.chat);
    await expect(
      page
        .getByLabel('پیام‌های گفتگو', { exact: true })
        .getByText('حتماً، تا جلسهٔ بعد.', { exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `test-results/reference-match/C03-actual-${width}.png` });
  }
  await login(context, 'Teacher');
  page.on('dialog', (d) => void d.accept());
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(`/personal/education/classes/${ids.class}/lessons/new`);
    await page.getByLabel(lessons.title, { exact: true }).fill('معادله‌های خطی');
    await page
      .getByLabel('متن درس', { exact: true })
      .fill(
        'در یک معادله خطی، مجهول توان اول دارد. برای یافتن x، در دو طرف معادله عمل یکسان انجام می‌دهیم.',
      );
    await page.getByLabel('ترتیب نمایش', { exact: true }).fill('3');
    await page.getByLabel(lessons.order, { exact: true }).blur();
    const submit = page.getByRole('button', { name: lessons.save, exact: true });
    await expect(submit).toBeInViewport();
    await expect(
      page.getByRole('navigation', { name: 'ناوبری حساب شخصی' }).filter({ visible: true }),
    ).toHaveCount(width >= 768 ? 1 : 0);
    await page.screenshot({ path: `test-results/reference-match/T02-actual-${width}.png` });
  }
  await page.getByRole('button', { name: lessons.save, exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByRole('link', { name: 'ویرایش پیش‌نویس', exact: true }).click();
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByLabel(lessons.editTitle, { exact: true })).toHaveValue('معادله‌های خطی');
    await page.screenshot({ path: `test-results/reference-match/T03-actual-${width}.png` });
  }
  await page.goto(`/personal/education/classes/${ids.class}/assignments/new`);
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole('button', { name: assignment.next, exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/reference-match/T05-actual-${width}.png` });
  }
  await writeFile('test-results/reference-match/geometry.json', JSON.stringify(metrics, null, 2));
});

test('workspace selection is explicit and a Student cannot author a class assignment', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.goto('/personal/workspaces');
  await expect(
    page.locator('[data-workspace-choices]').getByRole('button', { name: /حساب شخصی/ }),
  ).toHaveCount(0);
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: `test-results/reference-match/A04-actual-${width}.png` });
  }
  await page
    .locator('[data-workspace-choices]')
    .getByRole('button', { name: /آموزشگاه آفتاب/ })
    .click();
  await expect(page).toHaveURL(/\/personal$/);
  await expect(page.getByRole('heading', { name: 'آموزشگاه', exact: true })).toBeVisible();
  await page.goto(`/personal/education/classes/${ids.class}/assignments/new`);
  await expect(page.getByRole('main').getByRole('alert')).toContainText('دسترسی محدود است');
  await expect(page.getByRole('button', { name: 'ذخیرهٔ پیش‌نویس تکلیف' })).toHaveCount(0);
});

test('Parent sees only the selected child dashboard and Manager uses the reference layout', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Parent');
  await page.goto('/personal/education');
  await selectParentChild(page, '00000000-0000-4000-8000-000000000501');
  await expect(page.getByRole('heading', { name: 'سارا احمدی', exact: true })).toBeVisible();
  await page.goto('/personal/education');
  await expect(
    page.getByText('این نما مربوط به اطلاعات مجاز سارا احمدی در آموزشگاه آفتاب است.', {
      exact: true,
    }),
  ).toBeVisible();
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: `test-results/reference-match/P02-actual-${width}.png` });
  }
  await login(context, 'Manager');
  await page.goto('/personal/education');
  await expect(page.getByRole('heading', { name: 'آموزشگاه', exact: true })).toBeVisible();
  const sections = await schoolSections(page);
  await expect(sections.getByRole('link', { name: 'اعضا', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: `test-results/reference-match/M01-actual-${width}.png` });
  }
});

test('exam question navigation retains answers and exposes final review separately', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context);
  await page.goto(`/personal/education/exams/${ids.exam}`);
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click();
  await page.getByRole('button', { name: 'سؤال بعد', exact: true }).click();
  await page.getByRole('button', { name: 'سؤال بعد', exact: true }).click();
  await page.getByRole('radio', { name: '۴', exact: true }).check();
  await page.getByRole('button', { name: 'ذخیرهٔ پاسخ 3', exact: true }).click();
  await expect(page.getByText('آخرین پاسخ ذخیره شد.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'سؤال قبل', exact: true }).click();
  await page.getByRole('button', { name: 'سؤال بعد', exact: true }).click();
  await expect(page.getByRole('radio', { name: '۴', exact: true })).toBeChecked();
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.locator('[data-exam-room] > div').evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.screenshot({ path: `test-results/reference-match/S13-actual-${width}.png` });
  }
});

test('public introduction and phone sign-in follow the PDF without owner navigation', async ({
  page,
}) => {
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/welcome');
    await expect(page.getByRole('heading', { name: /یادگیری،.*کنار آدم‌های شما/ })).toBeVisible();
    await page.screenshot({ path: `test-results/reference-match/W01-actual-${width}.png` });
    await page.goto('/enter');
    await expect(page.getByLabel('شماره همراه', { exact: true })).toBeVisible();
    await page.getByRole('heading', { name: 'شماره همراه شما', exact: true }).click();
    await page.screenshot({ path: `test-results/reference-match/A01-actual-${width}.png` });
  }
});

test('desktop inbox restores only a previously opened, currently filtered conversation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/personal/messages');
  await expect(
    page.getByRole('complementary', { name: 'در همین زمینه', exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('فهرست گفتگوها', { exact: true })
    .getByRole('link')
    .filter({ hasText: 'مریم رضایی' })
    .click();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  await page.locator('aside').getByRole('link', { name: 'پیام‌ها', exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/messages$/);
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'نوع گفتگوها' })
    .getByRole('button', { name: 'گروه‌ها', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'نوع گفتگوها' })
    .getByRole('button', { name: 'همه', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(
      width === 390 ? 0 : 1,
    );
    await page.screenshot({ path: `test-results/reference-match/C01-actual-${width}.png` });
  }
});
