import { test, expect, login, fixture, ids } from './test';
import { captureExactState } from './exact-state-capture';
import { v5Product as t, vnext } from '../../src/content/fa';

test('teacher content uses authorized class contracts, keeps its kind and opens the existing editor', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext');
  await login(context, 'Teacher');
  await page.goto('/personal/education/classes');
  await page.getByRole('link', { name: 'کارهای من', exact: true }).click();
  await expect(page.getByRole('heading', { name: t.teacherContent, exact: true })).toBeVisible();
  const rows = page.locator('[data-teacher-work-list]');
  await expect(rows.getByRole('link')).not.toHaveCount(0);
  await captureExactState(page, ['MK-169']);
  const kinds = page.getByRole('group', { name: vnext.contentKind, exact: true });
  await kinds.getByRole('button', { name: vnext.activityKinds.Assignment, exact: true }).click();
  await expect(rows.getByRole('link', { name: 'تکلیف آزمایشی', exact: true })).toHaveAttribute(
    'href',
    '/personal/education/assignments/' + ids.assignment,
  );
  await kinds.getByRole('button', { name: vnext.activityKinds.Exam, exact: true }).click();
  await expect(
    rows.getByRole('link', { name: 'پیش‌نویس آزمون قابل بازیابی', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    kinds.getByRole('button', { name: vnext.activityKinds.Exam, exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await rows.getByRole('link', { name: 'پیش‌نویس آزمون قابل بازیابی', exact: true }).click();
  await expect(page).toHaveURL(/\/exams\/[^/]+\/edit$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some(
      (row: { path: string }) =>
        row.path.includes('/organization/teacher-content-activities') ||
        row.path.includes('/reports/manager/'),
    ),
  ).toBe(false);
});

for (const role of ['Student', 'Parent', 'Manager'])
  test(`${role} cannot enter the teacher content view or trigger its author reads`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/vnext');
    await login(context, role);
    const marker = (await (await request.get(fixture + '/__test__/state')).json()).requests.length;
    await page.goto('/personal/education/content');
    await expect(page.getByRole('main').getByRole('alert')).toContainText('دسترسی محدود');
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests
        .slice(marker)
        .some(
          (row: { path: string }) =>
            row.path.endsWith('/exams/discovery') ||
            /\/academic\/classes\/.+\/(lessons|assignments)$/.test(row.path),
        ),
    ).toBe(false);
  });
