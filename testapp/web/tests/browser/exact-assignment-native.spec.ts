import { test, expect, fixture, login, ids, origin } from './test';
import type { Page } from '@playwright/test';
import * as copy from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
const t = copy.v5Assignments;
const root = '/personal/education/classes/' + ids.class + '/assignments/new';
const path = '/api/v1/academic/classes/' + ids.class + '/assignments';
async function statement(page: Page) {
  await page.goto(root);
  await page.getByLabel(t.title, { exact: true }).fill('تمرین فصل دوم');
  await page
    .getByLabel(t.description, { exact: true })
    .fill('پرسش‌های ۱ تا ۵ جزوه را با توضیح روش حل پاسخ دهید.');
}
async function rules(page: Page) {
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await page.getByLabel(t.due, { exact: true }).fill('۱۴۰۶/۰۱/۱۵ ۱۲:۰۰');
  await page.getByLabel(t.due, { exact: true }).blur();
  await page.getByLabel(t.attempts, { exact: true }).fill('۲');
  await page.getByLabel(t.score, { exact: true }).fill('۲۰');
  await expect(page.getByRole('button', { name: t.review, exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: t.ready, exact: true }).check();
}
const file = {
  name: 'صورت-تکلیف.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7\nIsolated assignment fixture\n%%EOF'),
};

test('assignment files stay bound to the readable assignment; a Ready unbound file and a student draft read cannot reach bytes, and a denied published download remains an error', async ({
  page,
  context,
  request,
  browser,
}) => {
  const teacher = await login(context, 'Teacher');
  await statement(page);
  async function upload(name: string) {
    const response = page.waitForResponse(
      (r) => r.url().includes('/api/client/school-files?') && r.request().method() === 'POST',
    );
    await page.getByLabel(t.fileInput, { exact: true }).setInputFiles({ ...file, name });
    const asset = await (await response).json();
    await expect(
      page.getByRole('region', { name: t.files, exact: true }).getByText(name, { exact: true }),
    ).toBeVisible();
    return asset;
  }
  const attached = await upload(file.name),
    unbound = await upload('unbound.pdf');
  await page
    .getByRole('button', { name: copy.text_d3f1f47d3218 + 'unbound.pdf', exact: true })
    .click();
  await rules(page);
  await page.getByRole('button', { name: t.review, exact: true }).click();
  await expect(page).toHaveURL(/\/assignments\/[0-9a-f-]+\/publish-review$/);
  const assignmentId = page.url().split('/').at(-2)!;
  const fileUrl = (fileId: string) =>
    `/api/client/school-files/${fileId}/content?assignmentId=${assignmentId}`;
  expect(
    (
      await context.request.get(fileUrl(unbound.id), {
        headers: { 'X-Makan-Context': teacher.revision },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await context.request.get(fileUrl(attached.id) + '&classId=' + ids.class, {
        headers: { 'X-Makan-Context': teacher.revision },
      })
    ).status(),
  ).toBe(400);
  const studentContext = await browser.newContext({ baseURL: origin });
  try {
    await studentContext.route('**/*', (route) => {
      const u = new URL(route.request().url());
      return ['data:', 'blob:', 'about:'].includes(u.protocol) || u.hostname === '127.0.0.1'
        ? route.continue()
        : route.abort();
    });
    const student = await login(studentContext, 'Student');
    expect(
      (
        await studentContext.request.get(fileUrl(attached.id), {
          headers: { 'X-Makan-Context': student.revision },
        })
      ).status(),
    ).toBe(404);
    const teacherFiles = page.getByRole('region', { name: t.files, exact: true });
    const teacherDownload = teacherFiles.getByRole('button', {
      name: copy.text_6a835b3d71f3 + ' ' + file.name,
      exact: true,
    });
    await expect(teacherDownload).toBeEnabled();
    const draftDownload = page.waitForEvent('download', { timeout: 10000 });
    await teacherDownload.click();
    expect((await draftDownload).suggestedFilename()).toBe(file.name);
    await page.getByRole('button', { name: copy.text_d165c340ec56, exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: copy.text_2391d7b29480, exact: true })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const studentPage = await studentContext.newPage();
    await studentPage.goto('/personal/education/assignments/' + assignmentId);
    const studentFiles = studentPage.getByRole('region', { name: t.files, exact: true });
    const download = studentFiles.getByRole('button', {
      name: copy.text_6a835b3d71f3 + ' ' + file.name,
      exact: true,
    });
    await expect(download).toBeEnabled();
    await request.post(fixture + '/__test__/fault', {
      data: { path: '/api/v1/files/' + attached.id + '/content', method: 'GET', status: 403 },
    });
    await download.click();
    await expect(studentFiles.getByRole('alert')).toBeVisible();
    await expect(download).toBeEnabled();
    const valid = studentPage.waitForEvent('download');
    await download.click();
    expect((await valid).suggestedFilename()).toBe(file.name);
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter(
        (r: { path: string }) => r.path === '/api/v1/files/' + unbound.id + '/content',
      ),
    ).toHaveLength(0);
  } finally {
    await studentContext.close().catch(() => {});
  }
});

test('school assignment steps retain the scoped text, file and rules through back, resize, theme and reload; a failed create cannot publish or lose its draft', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', {
    data: { exactV5: true, exactV5TeacherRoster: true },
  });
  await login(context, 'Teacher');
  await statement(page);
  await expect(page.getByLabel(t.due, { exact: true })).toHaveCount(0);
  await page.getByLabel(t.fileInput, { exact: true }).setInputFiles(file);
  await expect(
    page.getByRole('region', { name: t.files, exact: true }).getByText(file.name, { exact: true }),
  ).toBeVisible();
  await captureExactState(
    page,
    ['MK-141'],
    'Actual organization assignment statement with one Ready fixture attachment; no draft create or publication yet.',
  );
  await rules(page);
  await page.getByRole('switch', { name: t.late, exact: true }).check();
  const reviewed = page.getByRole('checkbox', { name: t.ready, exact: true });
  await expect(reviewed).not.toBeChecked();
  await page
    .locator('form[data-v5-scene="MK-142"]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  const uncheckedState = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    uncheckedState.requests.filter(
      (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await reviewed.check();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveCount(0);
  await page
    .getByRole('banner')
    .getByRole('button', { name: copy.v4Text.back, exact: true })
    .click();
  await expect(page.getByLabel(t.title, { exact: true })).toBeFocused();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('تمرین فصل دوم');
  await page.getByRole('button', { name: t.next, exact: true }).click();
  await expect(page).toHaveURL(/\?step=rules$/);
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1112 });
    await expect(page.getByLabel(t.attempts, { exact: true })).toHaveValue('۲');
  }
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await page.goto(root + '?step=rules');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel(t.due, { exact: true })).toHaveValue('۱۵ فروردین، ۱۲:۰۰');
  await expect(page.getByRole('switch', { name: t.late, exact: true })).toBeChecked();
  await expect(reviewed).not.toBeChecked();
  await reviewed.check();
  await captureExactState(
    page,
    ['MK-142'],
    'Actual Teacher rule draft restored with its deadline, attempts, score, late policy and attachment metadata.',
  );
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let pending = 0;
  await page.route('**/api/client/backend' + path, async (route) => {
    pending++;
    await held;
    await route.continue();
  });
  const submit = page.locator('form[data-v5-scene="MK-142"] button[type="submit"]:visible');
  await expect(submit).toHaveAccessibleName(t.review);
  try {
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await page.locator('form[data-v5-scene="MK-142"]').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(pending).toBe(1);
  } finally {
    release();
  }
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByLabel(t.attempts, { exact: true })).toHaveValue('۲');
  await page.unroute('**/api/client/backend' + path);
  await submit.click();
  await expect(page).toHaveURL(/\/assignments\/[0-9a-f-]+\/publish-review$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toMatchObject({
    title: 'تمرین فصل دوم',
    maxAttempts: 2,
    maxScore: 20,
    allowLateSubmission: true,
    dueAtUtc: '2027-04-04T08:30:00.000Z',
  });
  expect(writes[1].body.attachmentFileIds).toHaveLength(1);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/files' && r.method === 'POST',
    ),
  ).toHaveLength(1);
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/publish'))).toHaveLength(
    0,
  );
});

test('a Pending assignment file is checked through the existing scoped metadata read after reload; failure cannot make it Ready or trigger another upload', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await statement(page);
  await request.post(fixture + '/__test__/next-file-status', { data: { status: 'Pending' } });
  const uploaded = page.waitForResponse(
    (r) => r.url().includes('/api/client/school-files?') && r.request().method() === 'POST',
  );
  await page.getByLabel(t.fileInput, { exact: true }).setInputFiles(file);
  const asset = await (await uploaded).json();
  const check = page.getByRole('button', { name: copy.text_64197e65a1c9, exact: true });
  await expect(check).toBeEnabled();
  await expect(page.getByRole('button', { name: t.next, exact: true })).toBeDisabled();
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(check).toBeEnabled();
  await request.post(fixture + '/__test__/ready-files');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/api/v1/files/' + asset.id, method: 'GET', status: 503 },
  });
  await check.click();
  await expect(
    page.getByRole('region', { name: t.files, exact: true }).getByRole('alert'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: t.next, exact: true })).toBeDisabled();
  await check.click();
  await expect(check).toHaveCount(0);
  await expect(page.getByRole('button', { name: t.next, exact: true })).toBeEnabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/files' && r.method === 'POST',
    ),
  ).toHaveLength(1);
});

for (const mismatch of ['classId', 'organizationId', 'status', 'versionRowVersion'])
  test(
    'assignment create acknowledgment with invalid ' + mismatch + ' cannot open publication review',
    async ({ page, context, request }) => {
      await login(context, 'Teacher');
      await statement(page);
      await rules(page);
      await page.route('**/api/client/backend' + path, async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          json: {
            ...(await response.json()),
            [mismatch]:
              mismatch === 'status'
                ? 'Published'
                : mismatch === 'versionRowVersion'
                  ? ''
                  : ids.exam,
          },
        });
      });
      await page.getByRole('button', { name: t.review, exact: true }).click();
      await expect(
        page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/assignments\/new\?step=rules$/);
      await expect(page.getByLabel(t.due, { exact: true })).toHaveValue('۱۵ فروردین، ۱۲:۰۰');
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
        ),
      ).toHaveLength(1);
    },
  );

for (const role of ['Student', 'Parent'] as const)
  test(
    role +
      ' cannot enter school lesson or assignment author forms or upload/create through their controls',
    async ({ page, context, request }) => {
      await login(context, role);
      for (const destination of [root, root.replace('/assignments/new', '/lessons/new')]) {
        await page.goto(destination);
        await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
        await expect(page.getByLabel(t.fileInput, { exact: true })).toHaveCount(0);
        await expect(page.getByRole('main').locator('form')).toHaveCount(0);
        if (role === 'Parent' && destination === root)
          await page.screenshot({
            path: test.info().outputPath('parent-assignment-role-guard.png'),
          });
      }
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (r: { path: string; method: string }) =>
            r.method === 'POST' &&
            (r.path === path ||
              r.path === path.replace('/assignments', '/lessons') ||
              r.path === '/api/v1/files'),
        ),
      ).toHaveLength(0);
    },
  );
