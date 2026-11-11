import { test, expect, fixture, login, origin } from './test';
import type { APIRequestContext, Page } from '@playwright/test';
import * as copy from '../../src/content/fa';
import { attendanceReference, attendanceNames } from '../fixtures/attendance-reference.mjs';
import { sessionReferenceId } from '../fixtures/session-reference.mjs';
import { captureExactState } from './exact-state-capture';
const t = copy.v5Attendance,
  path = '/api/v1/academic/sessions/' + sessionReferenceId + '/attendance',
  root = '/personal/education/sessions/' + sessionReferenceId + '?view=attendance';
async function seed(
  request: APIRequestContext,
  options: { count?: number; recorded?: number } = {},
) {
  expect(
    (
      await request.post(fixture + '/__test__/manager-case', {
        data: { exactV5: true, exactV5Attendance: true, attendanceRosterCount: options.count ?? 3 },
      })
    ).ok(),
  ).toBeTruthy();
  const value = attendanceReference(options);
  expect(
    (await request.post(fixture + '/__test__/education-case', { data: value })).ok(),
  ).toBeTruthy();
  return value;
}
async function openRow(page: Page, index = 0) {
  await page.getByRole('button', { name: t.rowLabel(attendanceNames[index]), exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}
async function stage(
  page: Page,
  index: number,
  status: 'Present' | 'Absent' | 'Late' | 'Excused',
  reason = 'ثبت اولیه نیاز به اصلاح داشت',
) {
  const dialog = await openRow(page, index);
  await dialog.locator('input[type=radio][value=' + status + ']').check();
  if (await dialog.getByLabel(t.reason, { exact: true }).count())
    await dialog.getByLabel(t.reason, { exact: true }).fill(reason);
  await dialog
    .getByRole('button', {
      name: (await dialog.getByLabel(t.reason, { exact: true }).count())
        ? t.stageCorrection
        : t.stage,
      exact: true,
    })
    .click();
  await expect(dialog).toHaveCount(0);
}
async function review(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: t.save, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.review, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function writes(request: APIRequestContext) {
  const state = await (await request.get(fixture + '/__test__/state')).json();
  return state.requests.filter(
    (row: { path: string; method: string }) =>
      row.path.startsWith(path) && ['PUT', 'PATCH'].includes(row.method),
  );
}
test('an unavailable attendance read is an error and cannot become an empty attendance list or a writable zero count', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  let unavailable = true;
  let failedReads = 0;
  await page.route('**/api/client/backend' + path, (route) => {
    if (unavailable && route.request().method() === 'GET') {
      failedReads++;
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'FIXTURE_INJECTED_FAILURE' }),
      });
    }
    return route.continue();
  });
  await page.goto(root);
  const error = page.locator('.error-state[role="alert"]');
  await expect(error).toBeVisible();
  await expect(page.getByRole('button', { name: t.save, exact: true })).toHaveCount(0);
  await expect(page.getByText(t.empty, { exact: true })).toHaveCount(0);
  expect(await writes(request)).toHaveLength(0);
  const beforeRetry = failedReads;
  await error.getByRole('button', { name: copy.text_47eab78b8d28, exact: true }).click();
  await expect.poll(() => failedReads).toBeGreaterThan(beforeRetry);
  await expect(error).toBeVisible();
  unavailable = false;
  await page.reload();
  await expect(
    page.getByRole('button', { name: t.rowLabel(attendanceNames[0]), exact: true }),
  ).toBeEnabled();
});
test('the actual attendance dialog remains keyboard-operable and horizontally contained with200percent text at320px and reduced height', async ({
  page,
  context,
  request,
}) => {
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await login(context, 'Teacher');
  await seed(request);
  await page.setViewportSize({ width: 320, height: 400 });
  await page.goto(root);
  const dialog = await openRow(page);
  const present = dialog.locator('input[value=Present]');
  await present.focus();
  await page.keyboard.press('ArrowDown');
  await expect(dialog.locator('input[value=Absent]')).toBeChecked();
  await dialog.getByLabel(t.reason, { exact: true }).fill('اصلاح آزمایشی');
  const save = dialog.getByRole('button', { name: t.stageCorrection, exact: true });
  await save.focus();
  expect(
    await save.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
    }),
  ).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBeTruthy();
  expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBeTruthy();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: t.rowLabel(attendanceNames[0]), exact: true }),
  ).toBeFocused();
  expect(await writes(request)).toHaveLength(0);
});
test('native attendance resolves bound learner names and retains per-row drafts through filtering, width, theme, back and reload without writing', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  await page.goto(root);
  await expect(
    page.getByRole('button', { name: t.rowLabel(attendanceNames[0]), exact: true }),
  ).toBeEnabled();
  await captureExactState(
    page,
    ['MK-128'],
    'Actual Teacher attendance from the scoped session and bound authorized class roster; no sample data is mounted by the product.',
  );
  await stage(page, 1, 'Present');
  const row = page.getByTestId('attendance-00000000-0000-4000-8000-000000020001');
  await expect(row).toContainText(t.pendingStatus('غایب', 'حاضر'));
  await page.getByRole('searchbox', { name: t.search, exact: true }).fill(attendanceNames[1]);
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(row).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBeTruthy();
  }
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('button', { name: 'ذخیره ظاهر', exact: true }).click();
  await page.goto(root);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('searchbox', { name: t.search, exact: true })).toHaveValue(
    attendanceNames[1],
  );
  await expect(row).toContainText(t.pendingStatus('غایب', 'حاضر'));
  await captureExactState(
    page,
    ['RX-009'],
    'One real pending correction survives responsive changes, theme and reload; no attendance command was sent. The deep attendance route keeps its actual deep-page navigation.',
  );
  expect(await writes(request)).toHaveLength(0);
});
test('the correction dialog keeps a numeric server version, a required reason and its own scoped unfinished text; Escape returns to the originating row', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  await page.goto(root);
  let dialog = await openRow(page);
  await dialog.locator('input[value=Late]').check();
  await expect(dialog.getByRole('button', { name: t.stageCorrection, exact: true })).toBeDisabled();
  await dialog.getByLabel(t.reason, { exact: true }).fill('توضیح ذخیره‌نشدهٔ حضور');
  await captureExactState(
    page,
    ['MK-129'],
    'Actual correction choices, bound learner and required correction reason. The three ordinary reference choices are shown; a returned or saved Excused value remains representable.',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: t.rowLabel(attendanceNames[0]), exact: true }),
  ).toBeFocused();
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  dialog = await openRow(page);
  await expect(dialog.locator('input[value=Late]')).toBeChecked();
  await expect(dialog.getByLabel(t.reason, { exact: true })).toHaveValue('توضیح ذخیره‌نشدهٔ حضور');
  await dialog.getByRole('button', { name: t.stageCorrection, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await writes(request)).toHaveLength(0);
});
test('first attendance registration sends only selected previously unrecorded rows after explicit review and waits for the matching200 acknowledgment', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  const data = await seed(request, { recorded: 0 });
  await page.goto(root);
  await stage(page, 0, 'Present');
  await stage(page, 2, 'Late');
  expect(await writes(request)).toHaveLength(0);
  const dialog = await review(page);
  await expect(dialog).toContainText(attendanceNames[0]);
  await expect(dialog).toContainText(attendanceNames[2]);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(t.saved, { exact: true })).toBeVisible();
  const sent = await writes(request);
  expect(sent).toHaveLength(1);
  expect(sent[0].method).toBe('PUT');
  expect(sent[0].body).toEqual({
    entries: [
      { enrollmentId: data.attendance[0].entries[0].enrollmentId, status: 'Present' },
      { enrollmentId: data.attendance[0].entries[2].enrollmentId, status: 'Late' },
    ],
  });
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[1].enrollmentId),
  ).toContainText('ثبت نشده');
});
for (const malformed of ['partial', 'duplicate-attendance-id'] as const)
  test(
    'a bulk registration ' +
      malformed +
      ' acknowledgment preserves every pending row until explicit reconciliation and never repeats the write',
    async ({ page, context, request }) => {
      await login(context, 'Teacher');
      const data = await seed(request, { recorded: 0 });
      await page.goto(root);
      await stage(page, 0, 'Present');
      await stage(page, 1, 'Late');
      await page.route('**/api/client/backend' + path, async (route) => {
        if (route.request().method() !== 'PUT') return route.continue();
        const response = await route.fetch();
        const rows = await response.json();
        const invalid =
          malformed === 'partial'
            ? rows.slice(0, 1)
            : rows.map((row: Record<string, unknown>, index: number) =>
                index ? { ...row, attendanceId: rows[0].attendanceId } : row,
              );
        await route.fulfill({ response, json: invalid });
      });
      let dialog = await review(page);
      await dialog.getByRole('button', { name: t.save, exact: true }).click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(dialog.getByRole('button', { name: t.save, exact: true })).toBeDisabled();
      await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
      for (const index of [0, 1]) {
        await expect(
          page.getByTestId('attendance-' + data.attendance[0].entries[index].enrollmentId),
        ).toContainText('هنوز ذخیره نشده');
      }
      for (const index of [0, 1]) {
        dialog = await openRow(page, index);
        await dialog.getByRole('button', { name: t.latest, exact: true }).click();
        await dialog.getByRole('button', { name: t.discardThis, exact: true }).click();
        if (!index)
          await expect(
            page.getByTestId('attendance-' + data.attendance[0].entries[1].enrollmentId),
          ).toContainText('هنوز ذخیره نشده');
      }
      expect(await writes(request)).toHaveLength(1);
      await expect(page.getByText(t.saved, { exact: true })).toHaveCount(0);
    },
  );
test('a single-row conflict requires a fresh read and explicit adoption while another pending row and both reasons remain intact', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const data = await seed(request);
  await page.goto(root);
  await stage(page, 0, 'Late', 'دلیل ردیف اول');
  await stage(page, 1, 'Present', 'دلیل ردیف دوم');
  const remote = await context.request.patch(
    origin + '/api/client/backend' + path + '/' + data.attendance[0].entries[1].attendanceId,
    {
      headers: { Origin: origin, 'X-Makan-Context': session.revision },
      data: {
        status: 'Excused',
        correctionReason: 'اصلاح هم‌زمان آزمایشی',
        expectedRowVersion: '1',
      },
    },
  );
  expect(remote.status()).toBe(200);
  let dialog = await review(page);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog.getByText(t.reviewChanged, { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
  dialog = await openRow(page, 1);
  await expect(dialog).toHaveAccessibleName(t.conflict);
  await captureExactState(
    page,
    ['RX-010'],
    'A real version conflict is isolated to one enrollment; another row and both correction reasons remain local.',
  );
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await dialog.getByRole('button', { name: t.acceptLatest, exact: true }).click();
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[0].enrollmentId),
  ).toContainText('دیرکرد');
  dialog = await openRow(page, 1);
  await expect(dialog.getByLabel(t.reason, { exact: true })).toHaveValue('دلیل ردیف دوم');
  await page.keyboard.press('Escape');
  dialog = await review(page);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(t.saved, { exact: true })).toBeVisible();
  const sent = await writes(request);
  expect(sent).toHaveLength(3);
  expect(sent[1].body).toEqual({
    status: 'Late',
    correctionReason: 'دلیل ردیف اول',
    expectedRowVersion: '1',
  });
  expect(sent[2].body).toEqual({
    status: 'Present',
    correctionReason: 'دلیل ردیف دوم',
    expectedRowVersion: '2',
  });
});
for (const invalid of [
  'enrollmentId',
  'learnerOrganizationPersonId',
  'rowVersion',
  'status',
  'accepted202',
] as const)
  test(
    'an unmatched correction acknowledgment ' +
      invalid +
      ' never clears its draft or permits an automatic retry',
    async ({ page, context, request }) => {
      await login(context, 'Teacher');
      const data = await seed(request);
      const entry = data.attendance[0].entries[0];
      await page.goto(root);
      await stage(page, 0, 'Late');
      let called = 0;
      await page.route('**/api/client/backend' + path + '/' + entry.attendanceId, (route) => {
        called++;
        return route.fulfill({
          status: invalid === 'accepted202' ? 202 : 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...entry,
            status: 'Late',
            rowVersion: '2',
            ...(invalid === 'enrollmentId'
              ? { enrollmentId: data.attendance[0].entries[1].enrollmentId }
              : invalid === 'learnerOrganizationPersonId'
                ? {
                    learnerOrganizationPersonId:
                      data.attendance[0].entries[1].learnerOrganizationPersonId,
                  }
                : invalid === 'rowVersion'
                  ? { rowVersion: '1' }
                  : invalid === 'status'
                    ? { status: 'Present' }
                    : {}),
          }),
        });
      });
      let dialog = await review(page);
      await dialog.getByRole('button', { name: t.save, exact: true }).click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(dialog.getByRole('button', { name: t.save, exact: true })).toBeDisabled();
      await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
      dialog = await openRow(page);
      await expect(dialog).toHaveAccessibleName(t.conflict);
      await expect(dialog.getByText(t.uncertain, { exact: true })).toBeVisible();
      expect(called).toBe(1);
      await expect(page.getByText(t.saved, { exact: true })).toHaveCount(0);
    },
  );
test('an acknowledged first correction is retained after a later failure; only the remaining row needs review', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  const data = await seed(request);
  await page.goto(root);
  await stage(page, 0, 'Late');
  await stage(page, 1, 'Present');
  await request.post(fixture + '/__test__/fault', {
    data: {
      path: path + '/' + data.attendance[0].entries[1].attendanceId,
      method: 'PATCH',
      status: 503,
    },
  });
  let dialog = await review(page);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[0].enrollmentId),
  ).not.toContainText('هنوز ذخیره نشده');
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[1].enrollmentId),
  ).toContainText('هنوز ذخیره نشده');
  dialog = await openRow(page, 1);
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await dialog.getByRole('button', { name: t.acceptLatest, exact: true }).click();
  dialog = await review(page);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const sent = await writes(request);
  expect(
    sent.filter((row: { path: string }) =>
      row.path.endsWith(data.attendance[0].entries[0].attendanceId!),
    ),
  ).toHaveLength(1);
  expect(
    sent.filter((row: { path: string }) =>
      row.path.endsWith(data.attendance[0].entries[1].attendanceId!),
    ),
  ).toHaveLength(2);
});
test('a lost acknowledgment after the real isolated write requires reading and accepting the returned state without repeating the command', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  const data = await seed(request);
  await page.goto(root);
  await stage(page, 0, 'Late');
  await page.route(
    '**/api/client/backend' + path + '/' + data.attendance[0].entries[0].attendanceId,
    async (route) => {
      await route.fetch();
      await route.abort('connectionfailed');
    },
  );
  let dialog = await review(page);
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
  dialog = await openRow(page);
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await dialog.getByRole('button', { name: t.discardThis, exact: true }).click();
  await expect(
    page.getByRole('banner').getByRole('button', { name: t.save, exact: true }),
  ).toBeDisabled();
  expect(await writes(request)).toHaveLength(1);
  await expect(page.getByText(t.saved, { exact: true })).toHaveCount(0);
});
test('a reason-only attendance correction is explicitly reviewed and retains the unchanged status in its versioned command', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  await page.goto(root);
  await stage(page, 0, 'Present', 'تکمیل توضیح ثبت قبلی');
  await expect(page.getByTestId('attendance-00000000-0000-4000-8000-000000020000')).toContainText(
    t.pendingReason('حاضر'),
  );
  const dialog = await review(page);
  await expect(dialog).toContainText('تکمیل توضیح ثبت قبلی');
  await dialog.getByRole('button', { name: t.save, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const sent = await writes(request);
  expect(sent).toHaveLength(1);
  expect(sent[0].body).toEqual({
    status: 'Present',
    correctionReason: 'تکمیل توضیح ثبت قبلی',
    expectedRowVersion: '1',
  });
});
test('authorized paginated roster resolution reaches a second page and a foreign learner identity never supplies a writable display name', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  const data = await seed(request, { count: 101 });
  await page.goto(root);
  const last = page.getByRole('button', { name: t.rowLabel('دانش‌آموز آزمایشی 101'), exact: true });
  await expect(last).toBeEnabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const rosterPages = state.requests.filter((row: { path: string }) =>
    row.path.includes('/learners'),
  );
  expect(
    new Set(rosterPages.map((row: { query: { Page: string } }) => Number(row.query.Page))),
  ).toEqual(new Set([1, 2]));
  expect(
    rosterPages.every((row: { query: { PageSize: string } }) => row.query.PageSize === '100'),
  ).toBe(true);
  data.attendance[0].entries[0].learnerOrganizationPersonId =
    '00000000-0000-4000-8000-000000099999';
  await request.post(fixture + '/__test__/education-case', { data });
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[0].enrollmentId),
  ).toBeDisabled();
  await expect(
    page.getByTestId('attendance-' + data.attendance[0].entries[0].enrollmentId),
  ).toContainText(t.unknownName);
  expect(await writes(request)).toHaveLength(0);
});
test('Student attendance history uses returned summary and session identities, exposes no teacher assertion and never requests management rosters', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student');
  const data = await seed(request);
  await page.goto('/personal/education/reports?kind=attendance');
  await expect(
    page.getByRole('heading', { name: copy.v5Sessions.myAttendance, exact: true }),
  ).toBeVisible();
  await expect(page.locator('.stats b')).toHaveText(['۲', '۱', '۰']);
  await expect(page.locator('.v5-list')).not.toContainText('ثبت مدرس');
  await expect(
    page.getByRole('link', { name: '۱۴ آبان · حل تمرین حاضر · ثبت‌شده', exact: true }),
  ).toHaveAttribute(
    'href',
    '/personal/education/sessions/' + data.studentAttendance.items[0].sessionId,
  );
  await captureExactState(
    page,
    ['MK-130'],
    'Student own-history report and its actual summary; the DTO provides no recorder role, so the product never claims teacher attribution.',
  );
  await page.goto(root);
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { path: string }) =>
        row.path.includes('/learners') ||
        row.path.includes('/teachers') ||
        row.path.startsWith(path),
    ),
  ).toHaveLength(0);
});
test('Student can return from a restored empty report page after the real result count shrinks without losing the report context', async ({
  page,
  context,
  request,
}) => {
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await page.setViewportSize({ width: 320, height: 400 });
  await login(context, 'Student');
  const data = await seed(request);
  const first = data.studentAttendance.items[0];
  const large = {
    ...data.studentAttendance,
    totalCount: 35,
    summary: {
      eligibleCount: 35,
      recordedCount: 35,
      presentCount: 35,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      notRecordedCount: 0,
    },
    items: Array.from({ length: 35 }, (_, index) => ({
      ...first,
      sessionId: '00000000-0000-4000-8000-' + String(6000 + index).padStart(12, '0'),
      sessionTitle: 'جلسه گزارش ' + index,
    })),
  };
  await request.post(fixture + '/__test__/education-case', {
    data: { ...data, studentAttendance: large },
  });
  await page.goto('/personal/education/reports?kind=attendance');
  await page.getByRole('button', { name: copy.text_12ca1a58c6ca, exact: true }).click();
  await expect(page.locator('.v5-list')).toContainText('جلسه گزارش 30');
  await request.post(fixture + '/__test__/education-case', { data });
  await page.reload();
  await expect(page.getByText(t.noHistory, { exact: true })).toBeVisible();
  const previous = page.getByRole('button', { name: copy.text_88e65319d694, exact: true });
  await expect(previous).toBeEnabled();
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'large');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 400 });
    await previous.focus();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    expect(
      await previous.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
      }),
    ).toBeGreaterThanOrEqual(44);
  }
  await expect(
    page.getByRole('button', { name: copy.text_12ca1a58c6ca, exact: true }),
  ).toBeDisabled();
  await previous.click();
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(3);
  await expect(page.locator('.stats b')).toHaveText(['۲', '۱', '۰']);
});
test('unfinished attendance input is isolated to the exact session even when the enrollment belongs to both sessions', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  const data = await seed(request);
  const other = '00000000-0000-4000-8000-000000006001';
  data.sessions.push({ ...data.sessions[0], id: other, title: 'جلسه دیگر' });
  const secondAttendance = { ...structuredClone(data.attendance[0]), sessionId: other };
  secondAttendance.entries.forEach((row, index) => {
    row.attendanceId = '00000000-0000-4000-8000-' + String(44000 + index).padStart(12, '0');
  });
  data.attendance.push(secondAttendance);
  await request.post(fixture + '/__test__/education-case', { data });
  await page.goto(root);
  let dialog = await openRow(page);
  await dialog.locator('input[value=Late]').check();
  await dialog.getByLabel(t.reason, { exact: true }).fill('فقط برای جلسه اول');
  await page.keyboard.press('Escape');
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/personal/education/sessions/' + other + '?view=attendance');
  dialog = await openRow(page);
  await expect(dialog.locator('input[value=Present]')).toBeChecked();
  await expect(dialog.getByLabel(t.reason, { exact: true })).toHaveValue('');
  expect(await writes(request)).toHaveLength(0);
});
