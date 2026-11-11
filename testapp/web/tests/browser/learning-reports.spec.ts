import { test, expect, login, ids } from './test';
import { learningReports as t } from '../../src/content/fa';

test('student reports show released results without exposing an unpublished score and preserve responsive report tabs', async ({
  page,
  context,
}) => {
  await login(context, 'Student', true);
  await page.goto('/personal/education/reports');
  await expect(page.getByRole('heading', { name: t.studentTitle, exact: true })).toBeVisible();
  await expect(
    page.getByText('تمرین فصل دوم', { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(
      page
        .getByRole('navigation', { name: t.categories })
        .getByRole('link', { name: t.grades, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
  }
  await page
    .getByRole('navigation', { name: t.categories })
    .getByRole('link', { name: t.assignments, exact: true })
    .click();
  await expect(page.getByText(t.noScore, { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/۱۹[٫.]۲۵/)).toHaveCount(0);
  const session = await (await context.request.get('/api/client/session')).json();
  const denied = await context.request.get(
    `/api/client/backend/api/v1/reports/teacher/classes/${ids.class}/assignments?PageNumber=1&PageSize=30`,
    { headers: { 'X-Makan-Context': session.revision } },
  );
  expect(denied.status()).toBe(403);
});

test('teacher report queries use an authorized class and keep private grading in the teacher context', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', true);
  await page.goto('/personal/education/reports?kind=assignments');
  await expect(page.getByRole('heading', { name: t.classTitle, exact: true })).toBeVisible();
  await expect(page.getByLabel(t.class, { exact: true })).toHaveValue(ids.class);
  await expect(
    page.getByText('سارا احمدی', { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  const session = await (await context.request.get('/api/client/session')).json();
  const denied = await context.request.get(
    '/api/client/backend/api/v1/reports/student/grades?PageNumber=1&PageSize=30',
    { headers: { 'X-Makan-Context': session.revision } },
  );
  expect(denied.status()).toBe(403);
});
