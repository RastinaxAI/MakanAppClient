import { test, expect, login, fixture, origin, ids } from './test';
import type { Page, APIRequestContext } from '@playwright/test';
import * as copy from '../../src/content/fa';
import type { components } from '../../src/generated/api/schema';
import { sessionReference, sessionReferenceId as id } from '../fixtures/session-reference.mjs';
import { captureExactState } from './exact-state-capture';
type S = components['schemas'];
const t = copy.v5Sessions,
  path = '/api/v1/academic/sessions/' + id,
  route = '/personal/education/sessions/' + id;
async function seed(request: APIRequestContext) {
  const data = sessionReference();
  expect((await request.post(fixture + '/__test__/education-case', { data })).ok()).toBeTruthy();
  expect(
    (await request.post(fixture + '/__test__/official-spaces', { data: {} })).ok(),
  ).toBeTruthy();
  return data.sessions[0];
}
async function menu(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: copy.v4_more, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function command(page: Page, complete = false) {
  await (await menu(page))
    .getByRole('button', { name: complete ? t.complete : copy.text_7a68b6ab2d41, exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: complete ? t.complete : copy.text_0435469ff2ca,
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  return dialog;
}
test('a short large-text dialog keeps a full touch portion reachable and returns keyboard focus without completing the session', async ({
  page,
  context,
  request,
}) => {
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await login(context, 'Teacher');
  await seed(request);
  await page.goto(route + '/edit');
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'large');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 400 });
    const dialog = await command(page, true);
    const check = dialog.getByRole('checkbox', { name: t.reviewed, exact: true });
    await expect(check).toBeEnabled();
    await check.focus();
    const visible = await check.evaluate((element) => {
      const target = element.closest('label')!;
      target.scrollIntoView({ block: 'center' });
      const bounds = target.getBoundingClientRect();
      let top = Math.max(0, bounds.top),
        bottom = Math.min(innerHeight, bounds.bottom);
      for (let parent = target.parentElement; parent; parent = parent.parentElement) {
        if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowY)) {
          const clip = parent.getBoundingClientRect();
          top = Math.max(top, clip.top + parent.clientTop);
          bottom = Math.min(bottom, clip.top + parent.clientTop + parent.clientHeight);
        }
      }
      return Math.max(0, bottom - top);
    });
    expect(visible).toBeGreaterThanOrEqual(44);
    await check.check();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: t.completeAction, exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true }),
    ).toBeFocused();
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/complete'))).toHaveLength(
    0,
  );
});
test('Student session detail uses the bound class resources and readable official group without requesting a management roster', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student');
  const original = await seed(request);
  await page.goto(route);
  await expect(page.getByRole('heading', { name: original.title, exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: t.resources + ' ' + t.resourcesHint, exact: true }),
  ).toHaveAttribute('href', '/personal/education/classes/' + ids.class + '?tab=lessons');
  const group = page.getByRole('link', { name: t.official + ' ' + t.officialHint, exact: true });
  await expect(group).toHaveAttribute(
    'href',
    '/personal/messages/00000000-0000-4000-8000-000000000970?view=organization',
  );
  await captureExactState(
    page,
    ['MK-124'],
    'Student session, actual authorized group and class resources; no private teacher roster is used to invent a teacher name.',
  );
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1112 });
    await expect(group).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBeTruthy();
  }
  await request.post(fixture + '/__test__/official-spaces', { data: { canRead: false } });
  await page.reload();
  await expect(group).toHaveCount(0);
  await expect(
    page.locator('.v5-list').getByText(t.officialUnavailable, { exact: true }),
  ).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) =>
      /\/(teachers|learners|attendance)(?:\?|$)/.test(r.path),
    ),
  ).toHaveLength(0);
  expect(
    state.requests.filter((r: { method: string }) => ['PUT', 'PATCH', 'DELETE'].includes(r.method)),
  ).toHaveLength(0);
});
test('plain session date fields retain the real picker through touch, keyboard and Escape without a redundant icon', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route + '/edit');
  const input = page.getByLabel(t.start, { exact: true });
  const calendar = page.getByRole('group', { name: copy.text_e3211dce980c, exact: true });
  await expect(page.locator('.makan-date-trigger')).toHaveCount(0);
  await expect(input).toHaveAttribute('aria-keyshortcuts', 'ArrowDown');
  await input.click();
  await expect(calendar).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(calendar).toBeHidden();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('1405/08/14 16:00');
  await input.press('ArrowDown');
  await expect(calendar).toBeVisible();
  await calendar.locator('.jdp-day.selected').focus();
  await page.keyboard.press('Escape');
  await expect(calendar).toBeHidden();
  await expect(input).toBeFocused();
  await input.blur();
  await expect(input).toHaveValue('۱۴ آبان، ۱۶:۰۰');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path.startsWith(path) && r.method !== 'GET',
    ),
  ).toHaveLength(0);
});
test('native session editing retains a stale local draft until explicit review, keeps its real version and blocks invalid time ranges', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const original = await seed(request),
    headers = { Origin: origin, 'X-Makan-Context': session.revision };
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(route + '/edit');
  await page.getByLabel(t.title, { exact: true }).fill('پیش‌نویس محلی جلسه');
  const remote = await context.request.patch('/api/client/backend' + path, {
    headers,
    data: {
      title: 'جلسهٔ تازهٔ سرویس',
      startUtc: original.startUtc,
      endUtc: original.endUtc,
      timeZoneId: original.timeZoneId,
      meetingUrl: original.meetingUrl,
      expectedRowVersion: original.rowVersion,
    },
  });
  expect(remote.ok()).toBeTruthy();
  const fresh: S['SessionResult'] = await remote.json();
  await page.reload();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('پیش‌نویس محلی جلسه');
  await expect(page.getByRole('button', { name: t.save, exact: true })).toBeDisabled();
  await page.getByRole('button', { name: copy.text_363bc802fb51, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: copy.text_c36e75eccc66, exact: true })
    .click();
  await expect(page.getByLabel(t.title, { exact: true })).toBeFocused();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue(fresh.title);
  await page.getByLabel(t.end, { exact: true }).fill('1405/08/14 15:00');
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(
    page.getByRole('button', { name: copy.text_796a59104e57, exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: copy.text_250a7c7f7fe9, exact: true }).click();
  await page.getByLabel(t.end, { exact: true }).fill('1405/08/14 18:00');
  await page.getByLabel(t.title, { exact: true }).fill('ویرایش بازبینی‌شده');
  await captureExactState(page, ['MK-125']);
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await page.getByRole('button', { name: copy.text_796a59104e57, exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/sessions/' + id + '$'));
  await expect(
    page.getByRole('heading', { name: 'ویرایش بازبینی‌شده', exact: true }),
  ).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { method: string; path: string }) => r.method === 'PATCH' && r.path === path,
  );
  expect(writes).toHaveLength(2);
  expect(writes[1].body.expectedRowVersion).toBe(fresh.rowVersion);
  expect(writes[1].body.timeZoneId).toBe(original.timeZoneId);
});
test('session cancellation freezes the stored version, preserves a cancelled local edit and requires explicit refresh after conflict', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const original = await seed(request),
    headers = { Origin: origin, 'X-Makan-Context': session.revision };
  await page.goto(route + '/edit');
  await page.getByLabel(t.title, { exact: true }).fill('صورت ذخیره‌نشدهٔ جلسه');
  let dialog = await command(page);
  await expect(dialog.locator('.v5-dialog-summary')).toContainText(original.title);
  await expect(dialog.locator('.v5-dialog-summary')).not.toContainText('صورت ذخیره‌نشدهٔ جلسه');
  await captureExactState(
    page,
    ['MK-126'],
    'Existing version-only cancel command; no cancellation reason is claimed as persisted.',
  );
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('صورت ذخیره‌نشدهٔ جلسه');
  dialog = await command(page);
  const remote = await context.request.patch('/api/client/backend' + path, {
    headers,
    data: {
      title: 'عنوان تازهٔ سرور',
      startUtc: original.startUtc,
      endUtc: original.endUtc,
      timeZoneId: original.timeZoneId,
      meetingUrl: original.meetingUrl,
      expectedRowVersion: original.rowVersion,
    },
  });
  expect(remote.ok()).toBeTruthy();
  const fresh: S['SessionResult'] = await remote.json();
  await dialog.getByRole('button', { name: copy.text_7a68b6ab2d41, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: copy.text_7a68b6ab2d41, exact: true }),
  ).toBeDisabled();
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('صورت ذخیره‌نشدهٔ جلسه');
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/cancel'))).toHaveLength(
    1,
  );
  dialog = await command(page);
  await expect(dialog.locator('.v5-dialog-summary')).toContainText(fresh.title);
  await dialog.getByRole('button', { name: copy.text_7a68b6ab2d41, exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/sessions/' + id + '$'));
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter((r: { path: string }) => r.path.endsWith('/cancel'));
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual({ expectedRowVersion: original.rowVersion });
  expect(writes[1].body).toEqual({ expectedRowVersion: fresh.rowVersion });
});
test('completion waits for the real attendance read and explicit review, retains a failed operation and accepts only the confirmed session', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  await seed(request);
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/client/backend' + path + '/attendance', async (route) => {
    await held;
    await route.continue();
  });
  await page.goto(route + '/edit');
  const dialog = await command(page, true),
    save = dialog.getByRole('button', { name: t.completeAction, exact: true }),
    check = dialog.getByRole('checkbox', { name: t.reviewed, exact: true });
  try {
    await expect(save).toBeDisabled();
    await expect(check).toBeDisabled();
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter((r: { path: string }) => r.path.endsWith('/complete')),
    ).toHaveLength(0);
  } finally {
    release();
  }
  await expect(check).toBeEnabled();
  await expect(save).toBeDisabled();
  await expect(dialog.locator('.v5-dialog-summary')).toContainText('۲۲ نفر از ۲۴ نفر');
  await check.check();
  await captureExactState(
    page,
    ['MK-127'],
    'Actual registered attendance read with22 recorded of24, explicit review and frozen session version.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: path + '/complete', method: 'POST', status: 503 },
  });
  await save.click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(check).toBeChecked();
  await save.click();
  await expect(page).toHaveURL(new RegExp('/sessions/' + id + '$'));
  const response = await context.request.get('/api/client/backend' + path, {
    headers: { 'X-Makan-Context': session.revision },
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).status).toBe('Completed');
});
for (const field of ['id', 'organizationId'] as const)
  test(
    'a foreign completion acknowledgment ' +
      field +
      ' cannot close confirmation or discard the edit',
    async ({ page, context, request }) => {
      await login(context, 'Teacher');
      const original = await seed(request);
      await page.route('**/api/client/backend' + path + '/complete', (route) =>
        route.fulfill({
          status: 200,
          json: { ...original, [field]: ids.exam, status: 'Completed', rowVersion: '2' },
        }),
      );
      await page.goto(route + '/edit');
      await page.getByLabel(t.title, { exact: true }).fill('پیش‌نویس حفظ شود');
      const dialog = await command(page, true);
      await dialog.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
      await dialog.getByRole('button', { name: t.completeAction, exact: true }).click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(page).toHaveURL(/\/edit$/);
      await page.keyboard.press('Escape');
      await expect(page.getByLabel(t.title, { exact: true })).toHaveValue('پیش‌نویس حفظ شود');
    },
  );
for (const role of ['Student', 'Parent'])
  test(
    role + ' cannot enter session editing or send an author command',
    async ({ page, context, request }) => {
      const session = await login(context, role);
      await seed(request);
      await page.goto(route + '/edit');
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(page.getByLabel(t.title, { exact: true })).toHaveCount(0);
      const response = await context.request.post('/api/client/backend' + path + '/complete', {
        headers: { Origin: origin, 'X-Makan-Context': session.revision },
        data: { expectedRowVersion: '1' },
      });
      expect(response.status()).toBe(403);
    },
  );
test('HTTP202 is not a completed session acknowledgment', async ({ page, context, request }) => {
  await login(context, 'Teacher');
  const original = await seed(request);
  await page.route('**/api/client/backend' + path + '/complete', (route) =>
    route.fulfill({ status: 202, json: { ...original, status: 'Completed', rowVersion: '2' } }),
  );
  await page.goto(route + '/edit');
  const dialog = await command(page, true);
  await dialog.getByRole('checkbox', { name: t.reviewed, exact: true }).check();
  await dialog.getByRole('button', { name: t.completeAction, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toBeVisible();
});
test('a foreign attendance response cannot supply a completion count or unlock its review', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await seed(request);
  await page.route('**/api/client/backend' + path + '/attendance', (route) =>
    route.fulfill({
      status: 200,
      json: { sessionId: ids.exam, sessionStatus: 'Scheduled', entries: [], revisions: [] },
    }),
  );
  await page.goto(route + '/edit');
  const dialog = await command(page, true);
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('button', { name: t.completeAction, exact: true })).toBeDisabled();
  await expect(dialog.getByRole('checkbox', { name: t.reviewed, exact: true })).toBeDisabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/complete'))).toHaveLength(
    0,
  );
});
