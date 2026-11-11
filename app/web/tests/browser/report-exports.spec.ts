import { captureExactState } from './exact-state-capture';
import { test, expect, login, fixture, ids, origin } from './test';
import { reportExport as t } from '../../src/content/fa';

test('report output keeps one request after a lost reply, survives reload and downloads only a completed authorized job', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await request.post(fixture + '/__test__/report-exports', { data: { loseCreateOnce: true } });
  await login(context, 'Manager', true);
  await page.goto('/personal/education/reports?kind=attendance');
  await page.getByRole('button', { name: t.configure, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel(t.type, { exact: true })).toHaveValue('ManagerAttendance');
  await dialog.getByRole('button', { name: t.create, exact: true }).click();
  await expect(dialog.getByRole('alert').first()).toBeVisible();
  await dialog.getByRole('button', { name: t.create, exact: true }).click();
  await expect(page).toHaveURL(/export=00000000-0000-4000-8000-000000009800/);
  await expect(page.locator('[data-report-export-state="Queued"]')).toBeVisible();
  await expect(page.getByRole('button', { name: t.download, exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-report-export-state="Queued"]')).toBeVisible();
  await request.post(fixture + '/__test__/report-exports', { data: { status: 'Completed' } });
  await page.getByRole('button', { name: t.check, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.ready, exact: true })).toBeVisible();
  await captureExactState(page, ['MK-166']);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: t.download, exact: true }).click();
  expect((await download).suggestedFilename()).toBe('makan-report.csv');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const creates = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/reports/exports' && r.method === 'POST',
  );
  expect(creates).toHaveLength(2);
  expect(creates[0].body.clientOperationId).toBe(creates[1].body.clientOperationId);
});

test('report byte proxy rejects unfinished jobs, wrong context, personal workspace and a JSON error disguised as a file', async ({
  context,
  request,
}) => {
  const state = await login(context, 'Manager', true);
  const headers = { Origin: origin, 'X-Makan-Context': state.revision };
  const response = await context.request.post(
    origin + '/api/client/backend/api/v1/reports/exports',
    {
      headers,
      data: {
        reportType: 'ManagerAttendance',
        format: 'Csv',
        filters: { classId: ids.class },
        clientOperationId: '00000000-0000-4000-8000-000000009801',
      },
    },
  );
  expect(response.ok()).toBe(true);
  const job = await response.json();
  const path = origin + '/api/client/report-exports/' + job.jobId + '/content';
  expect(
    (await context.request.get(path, { headers: { 'X-Makan-Context': state.revision } })).status(),
  ).toBe(409);
  await request.post(fixture + '/__test__/report-exports', {
    data: { status: 'Completed', invalidBinary: true },
  });
  expect(
    (await context.request.get(path, { headers: { 'X-Makan-Context': state.revision } })).status(),
  ).toBe(502);
  expect(
    (await context.request.get(path, { headers: { 'X-Makan-Context': 'old-context' } })).status(),
  ).toBe(409);
  const personal = await login(context, 'Personal', false);
  expect(
    (
      await context.request.get(path, { headers: { 'X-Makan-Context': personal.revision } })
    ).status(),
  ).toBe(403);
  const student = await login(context, 'Student', true);
  expect(
    (
      await context.request.get(path, { headers: { 'X-Makan-Context': student.revision } })
    ).status(),
  ).toBe(403);
});

test('report configuration keeps its inputs at three widths and Escape returns focus to the visible action', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await login(context, 'Manager', true);
  await page.goto('/personal/education/reports');
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const trigger = page.getByRole('button', { name: t.configure, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(t.type, { exact: true }).selectOption('ManagerAssessments');
    const rect = (await dialog.boundingBox())!;
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    expect(rect.y + rect.height).toBeLessThanOrEqual(844);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
});
