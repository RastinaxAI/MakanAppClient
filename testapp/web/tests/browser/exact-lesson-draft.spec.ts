import { test, expect, fixture, login, ids } from './test';
import type { Page } from '@playwright/test';
import { captureExactState } from './exact-state-capture';
import * as copy from '../../src/content/fa';
const t = copy.v5Lessons;
const root = '/personal/education/classes/' + ids.class + '/lessons/new';
const createPath = '/api/v1/academic/classes/' + ids.class + '/lessons';
const pdf = (name: string) => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7\nfixture-only lesson\n%%EOF'),
});
async function fill(page: Page) {
  await page.getByLabel(t.title, { exact: true }).fill('حل معادله درجه دوم');
  await page
    .getByLabel(t.body, { exact: true })
    .fill('برای حل معادله، ابتدا عبارت را تجزیه می‌کنیم…');
  await page.getByLabel(t.order, { exact: true }).fill('۳');
}

test('lesson text, localized order and Ready/Pending metadata survive reload; a lost create acknowledgment replays the same operation without reuploading files', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto(root);
  await fill(page);
  const save = page.getByRole('button', { name: t.save, exact: true });
  await page.getByLabel(t.order, { exact: true }).fill('1.5');
  await expect(save).toBeDisabled();
  await expect(page.getByText(t.invalidOrder, { exact: true })).toBeVisible();
  await page.getByLabel(t.order, { exact: true }).fill('۳');
  const picker = page.getByLabel(copy.text_ab79179420ee, { exact: true });
  const panel = page.getByRole('region', { name: copy.text_968ea718e159, exact: true });
  await picker.setInputFiles(pdf('درس-آماده.pdf'));
  await expect(panel.getByText('درس-آماده.pdf', { exact: true })).toBeVisible();
  await request.post(fixture + '/__test__/next-file-status', { data: { status: 'Pending' } });
  await picker.setInputFiles(pdf('lesson-pending.pdf'));
  await expect(
    panel.getByRole('button', { name: copy.text_64197e65a1c9, exact: true }),
  ).toBeVisible();
  await expect(save).toBeDisabled();
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('حل معادله درجه دوم');
  await expect(page.getByLabel(t.order, { exact: true })).toHaveValue('۳');
  await expect(panel.getByText('درس-آماده.pdf', { exact: true })).toBeVisible();
  await expect(
    panel.getByRole('button', { name: copy.text_64197e65a1c9, exact: true }),
  ).toBeVisible();
  await expect(save).toBeDisabled();
  await request.post(fixture + '/__test__/ready-files');
  await panel.getByRole('button', { name: copy.text_64197e65a1c9, exact: true }).click();
  await expect(save).toBeEnabled();
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const fields = await page.locator('fieldset.v5-native-fields').boundingBox();
    const upload = await panel
      .getByRole('button', { name: t.addAttachment, exact: true })
      .boundingBox();
    expect(fields).not.toBeNull();
    expect(upload).not.toBeNull();
    expect(upload!.x).toBeCloseTo(fields!.x, 0);
    expect(upload!.width).toBeCloseTo(fields!.width, 0);
  }
  await captureExactState(
    page,
    ['MK-134'],
    'Real teacher draft with explicitly uploaded fixture files; Pending requires a fresh authorized status check.',
  );
  const pattern = '**/api/client/backend' + createPath;
  await page.route(
    pattern,
    async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fetch();
      await route.fulfill({ status: 503, json: { code: 'UPSTREAM_UNAVAILABLE' } });
    },
    { times: 1 },
  );
  await save.click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByLabel(t.title, { exact: true })).toBeDisabled();
  await expect(page).toHaveURL(new RegExp('/lessons/new$'));
  const applied = await (await request.get(fixture + '/__test__/state')).json();
  expect(applied.lessonCount).toBe(2);
  await page.reload();
  await expect(page.getByLabel(t.body, { exact: true })).toHaveValue(
    'برای حل معادله، ابتدا عبارت را تجزیه می‌کنیم…',
  );
  await expect(panel.getByText('lesson-pending.pdf', { exact: true })).toBeVisible();
  await save.click();
  await expect(page).toHaveURL(/\/lessons\/.+\/review$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (row: { path: string; method: string }) => row.path === createPath && row.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body.displayOrder).toBe(3);
  expect(writes[1].body.fileAssetIds).toHaveLength(2);
  expect(state.lessonCount).toBe(2);
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) =>
        row.path === '/api/v1/files' && row.method === 'POST',
    ),
  ).toHaveLength(2);
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) =>
        row.path.endsWith('/publish') && row.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('an edit cannot accept another lesson acknowledgment or silently adopt a newer server version after reload', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  await page.goto(root);
  await fill(page);
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  const id = page.url().split('/').at(-2)!;
  const path = '/api/v1/academic/lessons/' + id;
  await page.getByRole('link', { name: t.edit, exact: true }).click();
  await page.getByLabel(t.editTitle, { exact: true }).fill('پیش‌نویس محلی حفظ شود');
  const pattern = '**/api/client/backend' + path;
  await page.route(pattern, async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...(await response.json()), id: ids.lesson } });
  });
  await page.getByRole('button', { name: t.review, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByLabel(t.editTitle, { exact: true })).toHaveValue('پیش‌نویس محلی حفظ شود');
  await page.unroute(pattern);
  const current = await (
    await context.request.get('/api/client/backend' + path, {
      headers: { 'X-Makan-Context': session.revision },
    })
  ).json();
  const changed = await context.request.patch('/api/client/backend' + path, {
    headers: { Origin: 'http://127.0.0.1:3132', 'X-Makan-Context': session.revision },
    data: {
      title: 'عنوان تازه سرور',
      body: 'نسخه تازه بیرونی',
      displayOrder: 4,
      fileAssetIds: [],
      expectedVersion: current.version,
    },
  });
  expect(changed.ok()).toBe(true);
  const version = (await changed.json()).version;
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel(t.editTitle, { exact: true })).toHaveValue('پیش‌نویس محلی حفظ شود');
  await expect(page.getByRole('button', { name: t.review, exact: true })).toBeDisabled();
  await test
    .info()
    .attach('lesson-version-conflict', { body: await page.screenshot(), contentType: 'image/png' });
  await page.getByRole('button', { name: copy.text_363bc802fb51, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: copy.text_c36e75eccc66, exact: true })
    .click();
  await expect(page.getByLabel(t.editTitle, { exact: true })).toHaveValue('عنوان تازه سرور');
  await expect(page.getByLabel(t.editTitle, { exact: true })).toBeFocused();
  await page.getByLabel(t.editBody, { exact: true }).fill('ویرایش روی نسخه پذیرفته‌شده');
  await page.getByRole('button', { name: t.review, exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const edits = state.requests.filter(
    (row: { path: string; method: string }) => row.path === path && row.method === 'PATCH',
  );
  expect(edits.at(-1).body.expectedVersion).toBe(version);
});

for (const mismatch of ['classId', 'organizationId', 'version'])
  test(
    'a draft create acknowledgment with invalid ' +
      mismatch +
      ' remains unresolved until a valid replay',
    async ({ page, context, request }) => {
      await login(context, 'Teacher');
      await page.goto(root);
      await fill(page);
      const pattern = '**/api/client/backend' + createPath;
      await page.route(pattern, async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        const response = await route.fetch();
        await route.fulfill({
          response,
          json: {
            ...(await response.json()),
            [mismatch]: mismatch === 'version' ? '' : '00000000-0000-4000-8000-000000009999',
          },
        });
      });
      await page.getByRole('button', { name: t.save, exact: true }).click();
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(page).toHaveURL(/\/lessons\/new$/);
      await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('حل معادله درجه دوم');
      await page.unroute(pattern);
      page.on('dialog', (dialog) => dialog.accept());
      await page.reload();
      await page.getByRole('button', { name: t.save, exact: true }).click();
      await expect(page).toHaveURL(/\/review$/);
      const state = await (await request.get(fixture + '/__test__/state')).json();
      const writes = state.requests.filter(
        (row: { path: string; method: string }) => row.path === createPath && row.method === 'POST',
      );
      expect(writes).toHaveLength(2);
      expect(writes[0].body.clientOperationId).toBe(writes[1].body.clientOperationId);
      expect(state.lessonCount).toBe(2);
    },
  );
