import { reviewPath } from './review-output';
import { test, expect, login, schoolSections, fixture, ids } from './test';
import { mkdir } from 'node:fs/promises';

test('V4 profile edit has labelled readable fields and a safe footer at all screen sizes', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await mkdir('test-results/school-redesign', { recursive: true });
  await page.goto('/personal/profile/edit');
  for (const [width, height] of [
    [390, 844],
    [834, 1194],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByLabel('نام', { exact: true })).toBeEditable();
    await expect(page.getByLabel('نام خانوادگی', { exact: true })).toBeEditable();
    await expect(page.getByLabel('نام نمایشی', { exact: true })).toBeEditable();
    await expect(page.getByLabel('نام کاربری', { exact: true })).toBeEditable();
    const action = page.getByRole('button', { name: 'ذخیره پروفایل', exact: true });
    const footer = page.locator('.rx-bottom-actions');
    await expect(footer).toBeVisible({ visible: width < 1200 });
    await expect(page.locator('.head-action')).toBeVisible({ visible: width >= 1200 });
    const box = (await action.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(height - 12);
    if (width < 1200) expect(height - box.y - box.height).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/school-redesign/profile-edit-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'ذخیره پروفایل', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/school-redesign/profile-footer-mobile.png' });
});

test('school has the authorized education destinations, three nearest items and a separate class page with URL-backed sections', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  const time = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();
  await request.post(fixture + '/__test__/education-case', {
    data: {
      dashboards: {
        Student: {
          nextSession: {
            sessionId: ids.class,
            classId: ids.class,
            classTitle: 'ریاضی',
            title: 'جلسهٔ نزدیک',
            startUtc: time(1),
            endUtc: time(2),
            status: 'Scheduled',
          },
          nearestAssignmentDeadline: {
            assignmentId: ids.assignment,
            classId: ids.class,
            classTitle: 'ریاضی',
            title: 'تکلیف نزدیک',
            dueAtUtc: time(3),
          },
          upcomingExams: [
            {
              examId: ids.exam,
              classId: ids.class,
              classTitle: 'ریاضی',
              title: 'آزمون نزدیک',
              availableFromUtc: time(4),
              availableUntilUtc: time(5),
            },
          ],
        },
      },
    },
  });
  await page.goto('/personal/education');
  const nav = await schoolSections(page);
  await expect(nav.getByRole('link')).toHaveText([
    'امروز',
    'کلاس‌ها',
    'برنامه',
    'دعوت‌ها',
    'گزارش‌ها و پیشرفت',
  ]);
  await page.keyboard.press('Escape');
  for (const [name, title] of [
    ['نزدیک‌ترین جلسه', 'جلسهٔ نزدیک'],
    ['نزدیک‌ترین تکلیف', 'تکلیف نزدیک'],
    ['نزدیک‌ترین آزمون', 'آزمون نزدیک'],
  ])
    await expect(page.getByRole('link').filter({ hasText: title }).first(), name).toBeVisible();
  for (const [width, height] of [
    [390, 844],
    [834, 1194],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/school-redesign/overview-${width}.png` });
  }
  await schoolSections(page);
  await nav.getByRole('link', { name: 'کلاس‌ها', exact: true }).click();
  await page.getByRole('link', { name: /کلاس آزمایشی ریاضی/ }).click();
  await expect(page).toHaveURL(new RegExp('/classes/' + ids.class));
  await expect(page.getByRole('navigation', { name: 'بخش‌های آموزشگاه', exact: true })).toHaveCount(
    0,
  );
  const sections = page.getByRole('navigation', { name: 'بخش‌های کلاس', exact: true });
  await expect(sections.getByRole('link')).toHaveText([
    'جلسه‌ها',
    'جزوه و کتاب‌ها',
    'تکلیف‌ها',
    'آزمون‌ها',
  ]);
  await sections.getByRole('link', { name: 'جزوه و کتاب‌ها', exact: true }).click();
  await expect(page).toHaveURL(/tab=lessons$/);
  await page.reload();
  await expect(sections.getByRole('link', { name: 'جزوه و کتاب‌ها', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('heading', { name: 'درس منتشرشدهٔ آزمایشی', exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/school-redesign/class-mobile.png' });
});

test('Teacher opens class members alongside activities without gaining management actions', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto(`/personal/education/classes/${ids.class}?tab=lessons`);
  const sections = page.getByRole('navigation', { name: 'بخش‌های کلاس', exact: true });
  await expect(sections.getByRole('link')).toHaveText([
    'جلسه‌ها',
    'جزوه و کتاب‌ها',
    'تکلیف‌ها',
    'آزمون‌ها',
    'اعضای کلاس',
  ]);
  await sections.getByRole('link', { name: 'اعضای کلاس', exact: true }).click();
  await expect(page).toHaveURL(/tab=members$/);
  await page.reload();
  await expect(sections.getByRole('link', { name: 'اعضای کلاس', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const members = page.getByRole('navigation', { name: 'نوع اعضای کلاس', exact: true });
  await expect(
    members.getByRole('link', { name: 'دانش‌آموزان کلاس', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await members.getByRole('link', { name: 'مدرسان کلاس', exact: true }).click();
  await expect(page).toHaveURL(/tab=members&member=teachers$/);
  await expect(members.getByRole('link', { name: 'مدرسان کلاس', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('button', { name: /حذف از کلاس/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /ثبت‌نام دانش‌آموز|انتساب معلم/ })).toHaveCount(0);
  await mkdir(reviewPath('output/review/class-members-tab'), { recursive: true });
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await sections.scrollIntoViewIfNeeded();
    await page.screenshot({ path: reviewPath(`output/review/class-members-tab/${width}.png`) });
  }
  await sections.getByRole('link', { name: 'جزوه و کتاب‌ها', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'درس منتشرشدهٔ آزمایشی', exact: true }),
  ).toBeVisible();
});

test('weekly schedule changes the server range and can return to the same week without date fields', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  await page.goto('/personal/education/schedule');
  await expect(
    page.getByRole('heading', { name: 'برنامهٔ هفتگی کلاس‌ها', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('جلسه‌ها از تاریخ', { exact: true })).toHaveCount(0);
  const weekHeading = page
    .getByRole('navigation', { name: 'جابه‌جایی هفته' })
    .locator('[aria-live]');
  const first = await weekHeading.textContent();
  const response = page.waitForResponse(
    (r) => r.url().includes('/api/v1/academic/schedule?') && r.request().method() === 'GET',
  );
  await page.getByRole('button', { name: 'هفتهٔ بعد', exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(weekHeading).not.toHaveText(first!);
  await page.getByRole('button', { name: 'هفتهٔ قبل', exact: true }).click();
  await expect(weekHeading).toHaveText(first!);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const requests = state.requests.filter(
    (r: { path: string }) => r.path === '/api/v1/academic/schedule',
  );
  expect(requests.length).toBeGreaterThanOrEqual(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/school-redesign/weekly-mobile.png' });
});

test('invitation details, consent, failed acceptance and decline retain truthful server state', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  const future = new Date(Date.now() + 86400000).toISOString();
  await request.post(fixture + '/__test__/education-case', {
    data: {
      invitations: [
        {
          id: ids.class,
          organizationName: 'آموزشگاه دعوت کیفیت',
          role: 'Student',
          status: 'Pending',
          expiresAtUtc: future,
          requiresPersonLinkConsent: true,
          organizationPersonDisplayName: 'پروندهٔ دانشجوی آزمایشی',
        },
        {
          id: ids.exam,
          organizationName: 'دعوت دوم',
          role: 'Student',
          status: 'Pending',
          expiresAtUtc: future,
        },
      ],
    },
  });
  await page.goto('/personal/education/invitations');
  const card = page.getByRole('article', { name: 'دعوت آموزشگاه دعوت کیفیت', exact: true });
  await expect(card.getByRole('button', { name: 'پذیرش دعوت', exact: true })).toBeDisabled();
  await card.getByText('جزئیات دعوت', { exact: true }).click();
  await expect(card.getByText('مهلت پاسخ', { exact: true })).toBeVisible();
  await expect(card).toContainText('پروندهٔ دانشجوی آزمایشی');
  await card.getByRole('checkbox').check();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/accept', method: 'POST', status: 503 },
  });
  await card.getByRole('button', { name: 'پذیرش دعوت', exact: true }).click();
  await expect(card.getByRole('alert')).toBeVisible();
  await expect(card.getByRole('checkbox')).toBeChecked();
  await expect(card).not.toContainText('پذیرفته‌شده');
  await card.getByRole('button', { name: 'پذیرش دعوت', exact: true }).click();
  await expect(card.getByRole('button', { name: 'پذیرش دعوت', exact: true })).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'وضعیت دعوت' })
    .getByRole('button', { name: 'پذیرفته‌شده', exact: true })
    .click();
  await expect(card).toBeVisible();
  await page
    .getByRole('navigation', { name: 'وضعیت دعوت' })
    .getByRole('button', { name: 'در انتظار', exact: true })
    .click();
  const second = page.getByRole('article', { name: 'دعوت دعوت دوم', exact: true });
  page.once('dialog', (dialog) => dialog.accept());
  await second.getByRole('button', { name: 'رد دعوت', exact: true }).click();
  await expect(second).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'وضعیت دعوت' })
    .getByRole('button', { name: 'ردشده', exact: true })
    .click();
  await expect(second).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/school-redesign/invitations-mobile.png' });
});
