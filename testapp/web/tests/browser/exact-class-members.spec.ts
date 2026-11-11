import { test, expect, fixture, login, origin } from './test';
import { captureExactState } from './exact-state-capture';
import { v5ClassMembers as t, integration80c, v4_more, v5Product } from '../../src/content/fa';
import type { BrowserContext, Page } from '@playwright/test';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const classId = id(1800),
  memberId = id(1808),
  memberApi = `/api/v1/personal-classes/${classId}/memberships/${memberId}`;
const root = `/personal/extracurricular/classes/${classId}/members`;
const memberRoute = root + '/' + memberId + '?page=1';
async function seed(request: Parameters<typeof login>[0]['request'], extra = {}) {
  expect(
    (
      await request.post(fixture + '/__test__/personal-class', {
        data: { exactV5Members: true, exactV5MemberDetail: true, ...extra },
      })
    ).ok(),
  ).toBe(true);
}
async function calls(context: BrowserContext, method: string, path: string) {
  const state = await (await context.request.get(fixture + '/__test__/state')).json();
  return state.requests.filter(
    (row: { method: string; path: string }) => row.method === method && row.path === path,
  );
}
async function more(page: Page) {
  const button = page.getByRole('banner').getByRole('button', { name: v4_more, exact: true });
  await button.click();
  return page.getByRole('dialog');
}
async function openAction(page: Page, label: string) {
  await (await more(page)).getByRole('button', { name: label, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  return dialog;
}
const appAlert = (page: Page) =>
  page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)'));

test('V5.2 join review is a scoped dialog, preserves its draft after Escape and failure, and closes only after acknowledgment', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { join: true });
  await login(context, 'Personal', false);
  await page.goto(`/personal/extracurricular/classes/${classId}/requests`);
  const open = page.getByRole('button', { name: v5Product.reviewJoinRequest, exact: true });
  await open.click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel(integration80c.reason, { exact: true }).fill('بررسی همان درخواست عضویت');
  await dialog.getByLabel(integration80c.status, { exact: true }).selectOption('Rejected');
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1024, 768],
  ]) {
    await page.setViewportSize({ width, height });
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
    await expect(dialog.getByLabel(integration80c.reason, { exact: true })).toHaveValue(
      'بررسی همان درخواست عضویت',
    );
  }
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  const path = `/api/v1/personal-classes/join-requests/${id(1811)}/decision`;
  expect(await calls(context, 'POST', path)).toHaveLength(0);
  await open.click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel(integration80c.status, { exact: true })).toHaveValue('Rejected');
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  await dialog.getByRole('button', { name: integration80c.action, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel(integration80c.reason, { exact: true })).toHaveValue(
    'بررسی همان درخواست عضویت',
  );
  await dialog.getByRole('button', { name: integration80c.action, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const writes = await calls(context, 'POST', path);
  expect(writes).toHaveLength(2);
  expect(writes[1].body).toEqual(writes[0].body);
  expect(writes[1].body).toEqual({
    expectedVersion: 'MDAwMDAwMDE=',
    decision: 'Rejected',
    reason: 'بررسی همان درخواست عضویت',
  });
});

test('local roles use three accessible switches and send the reviewed membership version', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await expect(page.getByRole('switch', { name: t.learner, exact: true })).toBeChecked();
  const teacher = page.getByRole('switch', { name: t.teacher, exact: true });
  await expect(teacher).toBeChecked();
  await teacher.focus();
  await page.keyboard.press('Space');
  await expect(teacher).not.toBeChecked();
  await page.getByLabel(t.reason, { exact: true }).fill('تغییر مسئولیت با حفظ عضویت آموزشی');
  await captureExactState(page, ['MK-306']);
  await page.getByRole('button', { name: t.saveRoles, exact: true }).click();
  await expect(page.getByText(integration80c.changed, { exact: true })).toBeVisible();
  const writes = await calls(context, 'PUT', memberApi + '/roles');
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toEqual({
    expectedVersion: 'MDAwMDAwMDE=',
    roles: 'Learner',
    delegatedCapabilities: 'None',
    reason: 'تغییر مسئولیت با حفظ عضویت آموزشی',
  });
  expect(await calls(context, 'DELETE', memberApi)).toHaveLength(0);
});

test('member draft survives navigation, theme and orientation within the same context', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await page.getByRole('switch', { name: t.teacher, exact: true }).uncheck();
  await page.getByLabel(t.reason, { exact: true }).fill('پیش‌نویس نقش محلی');
  await (await more(page)).getByRole('link', { name: t.summaryTitle, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.dualTitle, exact: true })).toBeVisible();
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.evaluate(() => {
    localStorage.setItem('makan-theme', 'dark');
    window.dispatchEvent(new Event('makan-theme-changed'));
  });
  await page.goBack();
  await expect(page.getByLabel(t.reason, { exact: true })).toHaveValue('پیش‌نویس نقش محلی');
  await expect(page.getByRole('switch', { name: t.teacher, exact: true })).not.toBeChecked();
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
});

test('Escape retains both reasons, returns focus and performs no membership command', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await page.getByLabel(t.reason, { exact: true }).fill('تغییر نقش ناتمام');
  let dialog = await openAction(page, t.end);
  await dialog.getByLabel(t.permissionReason, { exact: true }).fill('به درخواست خود عضو');
  await captureExactState(page, ['MK-307']);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel(t.reason, { exact: true })).toHaveValue('تغییر نقش ناتمام');
  dialog = await openAction(page, t.end);
  await expect(dialog.getByLabel(t.permissionReason, { exact: true })).toHaveValue(
    'به درخواست خود عضو',
  );
  expect(await calls(context, 'DELETE', memberApi)).toHaveLength(0);
});

test('ending membership requires its reason and a 204 before showing the returned ended state', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  const dialog = await openAction(page, t.end);
  await dialog.getByRole('button', { name: t.end, exact: true }).click();
  expect(await calls(context, 'DELETE', memberApi)).toHaveLength(0);
  await dialog.getByLabel(t.permissionReason, { exact: true }).fill('پایان همکاری به درخواست عضو');
  await dialog.getByRole('button', { name: t.end, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText(t.ended, { exact: true })).toBeVisible();
  const writes = await calls(context, 'DELETE', memberApi);
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toEqual({
    expectedVersion: 'MDAwMDAwMDE=',
    reason: 'پایان همکاری به درخواست عضو',
  });
  await (await more(page)).getByRole('link', { name: t.summaryTitle, exact: true }).click();
  await expect(page.getByRole('switch').first()).toBeDisabled();
});

test('an accepted-but-unconfirmed response cannot claim the membership ended', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await request.post(fixture + '/__test__/fault', {
    data: { method: 'DELETE', path: memberApi, status: 202 },
  });
  await page.goto(memberRoute);
  const dialog = await openAction(page, t.end);
  await dialog.getByLabel(t.permissionReason, { exact: true }).fill('بررسی پایان عضویت');
  await dialog.getByRole('button', { name: t.end, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(page.getByText(t.ended, { exact: true })).toHaveCount(0);
  await expect(page.getByText(integration80c.changed, { exact: true })).toHaveCount(0);
});

test('a lost deletion acknowledgement is reconciled by reading and is never retried automatically', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.route('**/api/client/backend' + memberApi, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fetch();
      await route.abort('failed');
    } else await route.continue();
  });
  await page.goto(memberRoute);
  const dialog = await openAction(page, t.end);
  await dialog.getByLabel(t.permissionReason, { exact: true }).fill('پایان عضویت با پاسخ نامشخص');
  await dialog.getByRole('button', { name: t.end, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('button', { name: t.end, exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: t.reviewLatest, exact: true }).click();
  await expect(page.getByText(t.ended, { exact: true })).toBeVisible();
  expect(await calls(context, 'DELETE', memberApi)).toHaveLength(1);
});

test('a wrong member acknowledgement preserves the unsaved choices without reporting success', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.route('**/api/client/backend' + memberApi + '/roles', async (route) => {
    const response = await route.fetch(),
      body = await response.json();
    await route.fulfill({ response, json: { ...body, id: id(1809) } });
  });
  await page.goto(memberRoute);
  await page.getByRole('switch', { name: t.teacher, exact: true }).uncheck();
  await page.getByLabel(t.reason, { exact: true }).fill('اصلاح نقش با پاسخ نامعتبر');
  await page.getByRole('button', { name: t.saveRoles, exact: true }).click();
  await expect(appAlert(page)).toBeVisible();
  await expect(page.getByLabel(t.reason, { exact: true })).toHaveValue('اصلاح نقش با پاسخ نامعتبر');
  await expect(page.getByRole('switch', { name: t.teacher, exact: true })).not.toBeChecked();
  await expect(page.getByText(integration80c.changed, { exact: true })).toHaveCount(0);
});

test('concurrent role changes require review while keeping the user draft', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  const session = await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await page.getByLabel(t.reason, { exact: true }).fill('پیش‌نویس پس از تغییر هم‌زمان');
  await page.getByRole('switch', { name: t.learner, exact: true }).uncheck();
  expect(
    (
      await context.request.put(origin + '/api/client/backend' + memberApi + '/roles', {
        headers: { Origin: origin, 'X-Makan-Context': session.revision },
        data: {
          expectedVersion: 'MDAwMDAwMDE=',
          roles: 'Learner',
          delegatedCapabilities: 'None',
          reason: 'تغییر هم‌زمان مجاز',
        },
      })
    ).status(),
  ).toBe(200);
  await (await more(page)).getByRole('button', { name: t.refresh, exact: true }).click();
  await expect(page.getByText(t.changed, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: t.saveRoles, exact: true })).toBeDisabled();
  await expect(page.getByLabel(t.reason, { exact: true })).toHaveValue(
    'پیش‌نویس پس از تغییر هم‌زمان',
  );
  await page.getByRole('button', { name: t.reviewLatest, exact: true }).click();
  await page.getByRole('button', { name: t.saveRoles, exact: true }).click();
  await expect(page.getByText(integration80c.changed, { exact: true })).toBeVisible();
  const writes = await calls(context, 'PUT', memberApi + '/roles');
  expect(writes).toHaveLength(2);
  expect(writes[1].body.expectedVersion).not.toBe(writes[0].body.expectedVersion);
  expect(writes[1].body.roles).toBe('Teacher');
});

test('academic switches use the existing grant and both actual versions', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute + '&view=permissions');
  await expect(page.getByRole('switch', { name: t.assignment, exact: true })).toBeChecked();
  await expect(page.getByRole('switch', { name: t.exam, exact: true })).not.toBeChecked();
  await page.getByRole('switch', { name: t.grade, exact: true }).uncheck();
  await page.getByLabel(t.permissionReason, { exact: true }).fill('اختیار تکلیف با حفظ مرز کلاس');
  await captureExactState(page, ['MK-309']);
  await page.getByRole('button', { name: t.savePermissions, exact: true }).click();
  await expect(page.getByText(integration80c.changed, { exact: true })).toBeVisible();
  const writes = await calls(
    context,
    'PUT',
    `/api/v1/personal-classes/${classId}/academic-permissions/${memberId}`,
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toMatchObject({
    capabilities: 'AuthorAssignments',
    expectedMembershipVersion: 'MDAwMDAwMDE=',
    expectedGrantVersion: 'MDAwMDAwMDE=',
    reason: 'اختیار تکلیف با حفظ مرز کلاس',
  });
  expect(writes[0].body.clientOperationId).toMatch(/^[a-f0-9-]{36}$/);
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
});

test('the member grant on page two is read instead of creating a false empty grant', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { memberGrantPrefixCount: 100 });
  await login(context, 'Personal', false);
  await page.goto(memberRoute + '&view=permissions');
  await expect(page.getByRole('switch', { name: t.grade, exact: true })).toBeChecked();
  const reads = await calls(
    context,
    'GET',
    `/api/v1/personal-classes/${classId}/academic-permissions`,
  );
  expect(reads.some((row: { query: { page: string } }) => row.query.page === '2')).toBe(true);
  await page
    .getByLabel(t.permissionReason, { exact: true })
    .fill('حفظ اختیار دریافت‌شده از صفحه بعد');
  await page.getByRole('button', { name: t.savePermissions, exact: true }).click();
  await expect(page.getByText(integration80c.changed, { exact: true })).toBeVisible();
  const writes = await calls(
    context,
    'PUT',
    `/api/v1/personal-classes/${classId}/academic-permissions/${memberId}`,
  );
  expect(writes[0].body.expectedGrantVersion).toBe('MDAwMDAwMDE=');
});

test('revoking evaluation keeps the other academic capability and local roles', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute + '&view=permissions');
  await expect(page.getByRole('switch', { name: t.grade, exact: true })).toBeChecked();
  const dialog = await openAction(page, t.revoke);
  await dialog.getByLabel(t.permissionReason, { exact: true }).fill('پایان مسئولیت ارزیابی');
  await captureExactState(page, ['MK-310']);
  await dialog.getByRole('button', { name: t.revokeAction, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('switch', { name: t.grade, exact: true })).not.toBeChecked();
  const writes = await calls(
    context,
    'PUT',
    `/api/v1/personal-classes/${classId}/academic-permissions/${memberId}`,
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body.capabilities).toBe('AuthorAssignments');
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
});

test('ending teaching preserves the learner role and requires the contract reason', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute + '&view=summary');
  await expect(page.getByRole('switch', { name: t.teacher, exact: true })).toBeChecked();
  await captureExactState(page, ['RX-032']);
  const dialog = await openAction(page, t.endTeacher);
  await dialog.getByRole('button', { name: t.endTeacher, exact: true }).click();
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
  await dialog
    .getByLabel(t.permissionReason, { exact: true })
    .fill('پایان مسئولیت تدریس به درخواست مدرس');
  await captureExactState(page, ['RX-033']);
  await dialog.getByRole('button', { name: t.endTeacher, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('switch', { name: t.teacher, exact: true })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: t.learner, exact: true })).toBeChecked();
  const writes = await calls(context, 'PUT', memberApi + '/roles');
  expect(writes[0].body.roles).toBe('Learner');
  expect(writes[0].body.reason).toBe('پایان مسئولیت تدریس به درخواست مدرس');
  expect(await calls(context, 'DELETE', memberApi)).toHaveLength(0);
  expect(
    await calls(
      context,
      'PUT',
      `/api/v1/personal-classes/${classId}/academic-permissions/${memberId}`,
    ),
  ).toHaveLength(0);
});

test('a school Teacher receives no independent management actions from the school role', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { capabilities: { canManageRoles: false, canManageMembers: false } });
  await login(context, 'Teacher', true);
  await page.goto(memberRoute);
  await expect(page.getByRole('switch', { name: t.teacher, exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: t.saveRoles, exact: true })).toHaveCount(0);
  const menu = await more(page);
  await expect(menu.getByRole('button', { name: t.end, exact: true })).toHaveCount(0);
  await expect(menu.getByRole('button', { name: t.endTeacher, exact: true })).toHaveCount(0);
  expect(
    await calls(context, 'GET', `/api/v1/personal-classes/${classId}/academic-permissions`),
  ).toHaveLength(0);
});

test('an archived class keeps member roles readable with all edits disabled', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.route(`**/api/client/backend/api/v1/personal-classes/${classId}`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: { ...(await response.json()), archived: true, state: 'Archived' },
    });
  });
  await page.goto(memberRoute);
  await expect(page.getByRole('switch', { name: t.learner, exact: true })).toBeChecked();
  await expect(page.getByRole('switch', { name: t.learner, exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: t.saveRoles, exact: true })).toHaveCount(0);
  const menu = await more(page);
  await expect(menu.getByRole('button', { name: t.end, exact: true })).toHaveCount(0);
});

test('member search is local to the returned class page, clears and survives back navigation', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(root);
  const search = page.getByRole('textbox', { name: v5Product.memberName, exact: true });
  await page.getByTestId('membership-' + memberId).waitFor();
  await search.fill('شایان');
  await expect(page.getByText(v5Product.noMatchingMembers, { exact: true })).toBeVisible();
  await captureExactState(page, ['MK-54']);
  await expect(
    page.getByRole('button', { name: v5Product.clearMemberSearch, exact: true }),
  ).toHaveCount(2);
  await page.getByRole('button', { name: v5Product.clearMemberSearch, exact: true }).last().click();
  await search.fill('مریم');
  await page.getByTestId('membership-' + memberId).click();
  await expect(page).toHaveURL(new RegExp('/members/' + memberId + '\\?page=1$'));
  await expect(page.getByRole('switch', { name: t.learner, exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'بازگشت', exact: true }).filter({ visible: true }).click();
  await expect(search).toHaveValue('مریم');
  await expect(page.getByTestId('membership-' + id(1802))).toHaveCount(0);
  const reads = await calls(context, 'GET', `/api/v1/personal-classes/${classId}/memberships`);
  expect(reads.every((row: { query: { search?: string } }) => !row.query.search)).toBe(true);
});

test('a later empty membership page retains Previous and does not claim the class has no members', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.route(
    `**/api/client/backend/api/v1/personal-classes/${classId}/memberships?*`,
    async (route) => {
      if (new URL(route.request().url()).searchParams.get('page') !== '2') return route.continue();
      await route.fulfill({
        status: 200,
        json: { items: [], page: 2, pageSize: 30, totalCount: 30 },
      });
    },
  );
  await page.goto(root + '?page=2');
  await expect(page.getByText(t.emptyPage, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /صفحه.*قبل/ })).toBeEnabled();
  await page.getByRole('button', { name: /صفحه.*قبل/ }).click();
  await expect(page.getByTestId('membership-' + memberId)).toBeVisible();
});

test('member controls and the confirmation action remain reachable at 200 percent and short heights', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await page.goto(memberRoute);
  for (const width of [320, 390, 430, 834, 1440]) {
    await page.setViewportSize({ width, height: 400 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const dialog = await openAction(page, t.end);
    await dialog
      .getByLabel(t.permissionReason, { exact: true })
      .fill('پایان عضویت در نمایش متن بزرگ');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: t.end, exact: true })).toBeFocused();
    await expect(dialog.getByRole('button', { name: t.end, exact: true })).toBeInViewport();
    expect(
      await dialog
        .getByRole('button', { name: t.end, exact: true })
        .evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
  }
});

test('a mismatched class response cannot fetch or edit memberships of the other class', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  // Read the actual authorized fixture DTO before registering the deliberately
  // mismatched response. No route.fetch remains pending when this page closes.
  const session = await (await context.request.get(origin + '/api/client/session')).json();
  const response = await context.request.get(
    origin + `/api/client/backend/api/v1/personal-classes/${classId}`,
    { headers: { 'X-Makan-Context': session.revision } },
  );
  expect(response.status()).toBe(200);
  const foreignClass = { ...(await response.json()), id: id(9999) };
  await page.route(`**/api/client/backend/api/v1/personal-classes/${classId}`, (route) =>
    route.fulfill({ status: 200, json: foreignClass }),
  );
  await page.goto(memberRoute);
  await expect(appAlert(page)).toBeVisible();
  await expect(page.getByRole('switch')).toHaveCount(0);
  expect(
    await calls(context, 'GET', `/api/v1/personal-classes/${id(9999)}/memberships`),
  ).toHaveLength(0);
});

test('a whitespace-only role reason never issues a command', async ({ page, context, request }) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await page.getByLabel(t.reason, { exact: true }).fill('   ');
  await page.getByRole('button', { name: t.saveRoles, exact: true }).click();
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
  expect(
    await page
      .getByLabel(t.reason, { exact: true })
      .evaluate((element: HTMLInputElement) => element.validity.valid),
  ).toBe(false);
});

test('teaching responsibility links stay in the actual class and preserve the member draft', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await login(context, 'Personal', false);
  await page.goto(memberRoute);
  await page.getByLabel(t.reason, { exact: true }).fill('پیش‌نویس با بازدید از مسئولیت مدرس');
  await (await more(page)).getByRole('link', { name: t.teaching, exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'کارگاه داستان‌نویسی', exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: new RegExp(t.related) })).toHaveAttribute(
    'href',
    `/personal/extracurricular/classes/${classId}/learning`,
  );
  await page.getByRole('link', { name: new RegExp(t.info) }).click();
  await expect(page.getByLabel(t.reason, { exact: true })).toHaveValue(
    'پیش‌نویس با بازدید از مسئولیت مدرس',
  );
  expect(await calls(context, 'PUT', memberApi + '/roles')).toHaveLength(0);
});
