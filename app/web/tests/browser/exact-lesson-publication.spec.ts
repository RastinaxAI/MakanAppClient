import { test, expect, fixture, login, ids } from './test';
import type { Page } from '@playwright/test';
import { captureExactState } from './exact-state-capture';
import * as copy from '../../src/content/fa';
const t = copy.v5Lessons;
const root = '/personal/education/classes/' + ids.class + '/lessons/new';
async function create(page: Page, file = true) {
  await page.goto(root);
  await page.getByLabel(t.title, { exact: true }).fill('حل معادله درجه دوم');
  await page
    .getByLabel(t.body, { exact: true })
    .fill('دو روش تجزیه و فرمول را با مثال مقایسه می‌کنیم.');
  await page.getByLabel(t.order, { exact: true }).fill('۳');
  if (file) {
    await page.getByLabel(copy.text_ab79179420ee, { exact: true }).setInputFiles({
      name: 'جزوه فصل دوم.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\nIsolated lesson fixture\n%%EOF'),
    });
    await expect(
      page
        .getByRole('region', { name: copy.text_968ea718e159, exact: true })
        .getByText('جزوه فصل دوم.pdf', { exact: true }),
    ).toBeVisible();
  }
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  return page.url().split('/').at(-2)!;
}

test('editing retains order and upload controls in its menu; publication confines focus, requires review and preserves the frozen version after a failed send', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', {
    data: { exactV5: true, exactV5TeacherRoster: true, exactV5Lesson: true },
  });
  await login(context, 'Teacher');
  const id = await create(page);
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', {
      name: copy.text_6a835b3d71f3 + ' جزوه فصل دوم.pdf',
      exact: true,
    })
    .click();
  expect((await download).suggestedFilename()).toBe('جزوه فصل دوم.pdf');
  await expect(page.getByLabel(t.editBody, { exact: true })).toHaveAttribute('readonly', '');
  await page.getByRole('link', { name: t.edit, exact: true }).click();
  await expect(page.getByLabel(t.order, { exact: true })).toHaveCount(0);
  const more = page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true });
  await more.click();
  const menu = page.getByRole('dialog');
  await menu.getByLabel(t.order, { exact: true }).fill('۴');
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  await more.click();
  await expect(menu.getByLabel(t.order, { exact: true })).toHaveValue('۴');
  const chooser = page.waitForEvent('filechooser');
  await menu.getByRole('button', { name: t.addAttachment, exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: 'درس-دوم.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nfixture-only second file\n%%EOF'),
  });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page
      .getByRole('region', { name: copy.text_968ea718e159, exact: true })
      .getByText('درس-دوم.pdf', { exact: true }),
  ).toBeVisible();
  await captureExactState(
    page,
    ['MK-135'],
    'Real Teacher edit with two acknowledged fixture attachments; hidden order/upload controls remain reachable from the page menu.',
  );
  await more.click();
  await menu
    .getByRole('button', {
      name: copy.text_d3f1f47d3218 + 'درس-دوم.pdf',
      exact: true,
    })
    .click();
  await expect(menu).toHaveCount(0);
  await expect(
    page
      .getByRole('region', { name: copy.text_968ea718e159, exact: true })
      .getByText('درس-دوم.pdf', { exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: t.review, exact: true }).click();
  await expect(page).toHaveURL(/\/review$/);
  const trigger = page.getByRole('button', { name: t.publish, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: t.publishTitle, exact: true });
  await expect(dialog.getByText(t.authorizedMembers('۲۴'), { exact: false })).toBeVisible();
  const primary = dialog.locator('button[type="submit"]');
  await expect(primary).toBeDisabled();
  const reviewed = dialog.getByRole('checkbox', { name: t.reviewed, exact: true });
  await reviewed.focus();
  await reviewed.press('Space');
  await expect(reviewed).toBeChecked();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(reviewed).not.toBeChecked();
  await reviewed.check();
  await captureExactState(
    page,
    ['MK-136'],
    'The reviewed server lesson/version is frozen while the native publication dialog is open; no publication has been sent.',
  );
  const path = '/api/v1/academic/lessons/' + id + '/publish';
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let pendingRequests = 0;
  await page.route('**/api/client/backend' + path, async (route) => {
    pendingRequests++;
    await held;
    await route.continue();
  });
  try {
    await primary.click();
    await expect(primary).toBeDisabled();
    await expect(primary).toHaveAttribute('aria-busy', 'true');
    await dialog.locator('form').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(pendingRequests).toBe(1);
  } finally {
    release();
  }
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(reviewed).toBeChecked();
  await expect(page.getByText(copy.text_3dd42711b07e, { exact: true })).toHaveCount(0);
  await page.unroute('**/api/client/backend' + path);
  await primary.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(copy.text_3dd42711b07e, { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'حل معادله درجه دوم', exact: true }),
  ).toBeFocused();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (row: { path: string; method: string }) => row.path === path && row.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body.expectedVersion).toBe('2');
});

test('a denied roster read does not invent a zero member count or publish without explicit review', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', {
    data: { exactV5: true, exactV5Lesson: true },
  });
  await login(context, 'Teacher');
  await create(page, false);
  await page.route('**/api/client/backend/api/v1/academic/classes/*/learners?**', (route) =>
    route.fulfill({ status: 403, json: { code: 'WORKSPACE_NOT_ALLOWED' } }),
  );
  const denied = page.waitForResponse(
    (response) => response.url().includes('/learners?') && response.status() === 403,
  );
  await page.getByRole('button', { name: t.publish, exact: true }).click();
  await denied;
  const dialog = page.getByRole('dialog', { name: t.publishTitle, exact: true });
  await expect(dialog.getByText(/عضو مجاز/)).toHaveCount(0);
  await expect(dialog.locator('button[type="submit"]')).toBeDisabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((row: { path: string }) => row.path.endsWith('/publish')),
  ).toHaveLength(0);
});

for (const mismatch of ['id', 'organizationId', 'status', 'version'])
  test(
    'a publication acknowledgment with invalid ' + mismatch + ' does not become a published lesson',
    async ({ page, context, request }) => {
      const session = await login(context, 'Teacher');
      const id = await create(page, false);
      const path = '/api/v1/academic/lessons/' + id;
      const old = await (
        await context.request.get('/api/client/backend' + path, {
          headers: { 'X-Makan-Context': session.revision },
        })
      ).json();
      // Hold a stale replica read so polling cannot replace the deliberately malformed ACK.
      await page.route('**/api/client/backend' + path, (route) => route.fulfill({ json: old }));
      await page.route('**/api/client/backend' + path + '/publish', async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          json: {
            ...(await response.json()),
            [mismatch]: mismatch === 'status' ? 'Draft' : mismatch === 'version' ? '' : ids.lesson,
          },
        });
      });
      await page.getByRole('button', { name: t.publish, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: t.publishTitle, exact: true });
      await dialog.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
      await dialog.locator('button[type="submit"]').click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(page.getByText(copy.text_3dd42711b07e, { exact: true })).toHaveCount(0);
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (row: { path: string; method: string }) =>
            row.path === path + '/publish' && row.method === 'POST',
        ),
      ).toHaveLength(1);
    },
  );
