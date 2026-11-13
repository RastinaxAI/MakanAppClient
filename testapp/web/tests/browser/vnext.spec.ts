import { reviewPath } from './review-output';
import { captureExactState } from './exact-state-capture';
import { test, expect, login, fixture, ids, chooseSchoolCatalog } from './test';
import { vnext as t, v5ClassMembers as members } from '../../src/content/fa';
const base = '/personal/education';
test.beforeEach(async ({ context, request }) => {
  await login(context, 'Manager', true);
  await request.post(fixture + '/__test__/vnext', { data: {} });
});
test('organization sent invitations survive reload, page/filter on server and revoke by version', async ({
  page,
  request,
}) => {
  await page.goto(base + '/invitations');
  const panel = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: t.sentInvitations, exact: true }) });
  await expect(panel.getByRole('heading', { name: 'دعوت والد 1', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'صفحهٔ بعد', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'دعوت والد 31', exact: true })).toBeVisible();
  await panel.getByLabel(t.status, { exact: true }).selectOption('Accepted');
  await expect(panel.getByRole('heading', { name: 'دعوت والد 33', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: t.revoke, exact: true })).toHaveCount(0);
  await panel.getByLabel(t.status, { exact: true }).selectOption('Pending');
  const invitation = panel
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'دعوت والد 1', exact: true }) });
  await invitation.getByLabel(t.reason, { exact: true }).fill('لغو درخواست آزمایشی');
  await invitation.getByRole('button', { name: t.revoke, exact: true }).click();
  await captureExactState(page, ['MK-112']);
  await page.getByRole('dialog').getByRole('button', { name: t.revoke, exact: true }).click();
  await expect(invitation).toHaveCount(0);
  await page.reload();
  await expect(panel.getByRole('heading', { name: t.sentInvitations })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const calls = state.requests.filter(
    (r: { path: string }) => r.path === '/api/v1/organization/invitations',
  );
  expect(
    calls.some(
      (r: { query: { page: string; status: string } }) =>
        r.query.status === 'Accepted' && r.query.page === '1',
    ),
  ).toBe(true);
});
test('role changes preserve the other role and ending the last manager is rejected', async ({
  page,
  request,
}) => {
  await page.goto(base + '/members');
  const teacher = page
    .getByRole('row')
    .filter({ has: page.getByText('معلم اول', { exact: true }) });
  await teacher.getByRole('button', { name: t.manageRoles, exact: true }).click();
  const editor = page.locator('section').filter({
    has: page.getByRole('heading', { name: t.manageRoles + ' · معلم اول', exact: true }),
  });
  await captureExactState(page, ['MK-108']);
  await editor.getByLabel(t.roleAction).selectOption('end-role');
  await editor.getByLabel(t.reason, { exact: true }).fill('بازبینی پایان نقش مدرس');
  const confirmRole = editor.getByRole('button', { name: t.confirmMutation, exact: true });
  await confirmRole.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await captureExactState(page, ['MK-109']);
  await page.keyboard.press('Escape');
  await expect(confirmRole).toBeFocused();
  const beforeRoleChange = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    beforeRoleChange.requests.filter(
      (row: { path: string; method: string }) =>
        row.path.includes('/roles/') && row.method === 'DELETE',
    ),
  ).toHaveLength(0);
  await editor.getByLabel(t.roleAction).selectOption('change');
  await editor.getByLabel(t.newRole).selectOption('Student');
  await editor.getByLabel(t.reason, { exact: true }).fill('تغییر فقط نقش معلم');
  await editor.getByRole('button', { name: t.confirmMutation, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: t.confirmMutation, exact: true })
    .click();
  await expect(editor.getByText(/دانش‌آموز.*والد/).first()).toBeVisible();
  await editor.getByRole('button', { name: t.close, exact: true }).click();
  await page
    .getByRole('row')
    .filter({ has: page.getByText('مدیر فعلی', { exact: true }) })
    .getByRole('button', { name: t.manageRoles, exact: true })
    .click();
  const manager = page.locator('section').filter({
    has: page.getByRole('heading', { name: t.manageRoles + ' · مدیر فعلی', exact: true }),
  });
  await manager.getByLabel(t.roleAction).selectOption('end-membership');
  await manager.getByLabel(t.reason, { exact: true }).fill('آزمون حفاظت آخرین مدیر');
  await manager.getByRole('button', { name: t.confirmMutation, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: t.confirmMutation, exact: true })
    .click();
  await expect(page.getByRole('dialog').getByText(t.lastManager)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(manager.getByLabel(t.reason, { exact: true })).toHaveValue('آزمون حفاظت آخرین مدیر');
});
test('class edit retains intent through conflict until the new version is explicitly accepted', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext', { data: { classConflict: true } });
  await page.goto(base + '/classes/' + ids.class);
  await page.getByText(t.classSettings, { exact: true }).click();
  const form = page.locator('form').filter({ has: page.getByLabel(t.title, { exact: true }) });
  await form.getByLabel(t.title, { exact: true }).fill('عنوان اصلاح‌شده کلاس');
  await form.getByLabel(t.capacity, { exact: true }).fill('25');
  await form.getByLabel(t.reason, { exact: true }).fill('افزایش ظرفیت مجاز');
  await form.getByRole('button', { name: t.saveClassSettings, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: t.confirmSettings, exact: true })
    .click();
  await expect(page.getByRole('dialog').getByRole('alert').first()).toBeVisible();
  await captureExactState(page, ['MK-97', 'MK-428']);

  await expect(form.getByLabel(t.title, { exact: true })).toHaveValue('عنوان اصلاح‌شده کلاس');
  await page.getByRole('dialog').getByRole('button', { name: t.reviewLatest, exact: true }).click();
  await form.getByRole('button', { name: t.saveClassSettings, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: t.confirmSettings, exact: true })
    .click();
  await expect(form.getByLabel(t.title, { exact: true })).toHaveValue('عنوان اصلاح‌شده کلاس');
  await expect(form.getByRole('status')).toBeVisible();
});
test('exam author discovers drafts after reload without exposing discovery to a personal workspace', async ({
  page,
  context,
}) => {
  await page.goto(base + '/exams');
  await page.getByLabel(t.status, { exact: true }).selectOption('Draft');
  await expect(
    page.getByRole('heading', { name: 'پیش‌نویس آزمون قابل بازیابی', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'پیش‌نویس آزمون قابل بازیابی', exact: true }),
  ).toBeVisible();
  await login(context, 'Personal', false);
  const session = await (await context.request.get('/api/client/session')).json();
  const denied = await context.request.get('/api/client/backend/api/v1/academic/exams/discovery', {
    headers: { 'X-Makan-Context': session.revision },
  });
  expect(denied.status()).toBe(403);
});
test('content activity filters use teacher user identity and guardian names come from the relation', async ({
  page,
  request,
}) => {
  await page.goto(base + '/reports?kind=content-activities');
  await expect(
    page.getByRole('heading', { name: 'جزوهٔ منتشرشدهٔ معلم', exact: true }),
  ).toBeVisible();
  await page.getByLabel(t.contentKind).selectOption('Lesson');
  await page.getByLabel('معلم آموزشگاه', { exact: true }).selectOption({ label: 'معلم اول' });
  await expect(
    page.getByRole('heading', { name: 'جزوهٔ منتشرشدهٔ معلم', exact: true }),
  ).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some(
      (r: { path: string; query: { teacherUserId: string } }) =>
        r.path.endsWith('/teacher-content-activities') &&
        r.query.teacherUserId === '00000000-0000-4000-8000-000000000810',
    ),
  ).toBe(true);
  await page.goto(base + '/guardians');
  await expect(page.getByText('والد امن سازمانی', { exact: false })).toBeVisible();
});
test('academic delegation exposes only the managers effective subset to a teacher', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Personal', false);
  await request.post(fixture + '/__test__/personal-class', {
    data: { academicRecipient: true, capabilities: { canGrade: false, canAuthorExams: false } },
  });
  await page.goto('/personal/extracurricular/classes/00000000-0000-4000-8000-000000001800/members');
  await page.getByTestId('membership-00000000-0000-4000-8000-000000001802').click();
  await expect(page).toHaveURL(/\/members\/00000000-0000-4000-8000-000000001802(?:\?|$)/);
  const target = new URL(page.url());
  target.searchParams.set('view', 'permissions');
  await page.goto(target.href);
  await expect(page.getByRole('switch', { name: members.assignment, exact: true })).toBeEnabled();
  await expect(page.getByRole('switch', { name: members.grade, exact: true })).toBeDisabled();
  await expect(page.getByRole('switch', { name: members.exam, exact: true })).toBeDisabled();
  const session = await (await context.request.get('/api/client/session')).json();
  const permissionPath =
    '/api/client/backend/api/v1/personal-classes/00000000-0000-4000-8000-000000001800/academic-permissions/00000000-0000-4000-8000-000000001802';
  const headers = { Origin: 'http://127.0.0.1:3132', 'X-Makan-Context': session.revision };
  const command = {
    capabilities: 'Grade',
    expectedMembershipVersion: 'MDAwMDAwMDE=',
    expectedGrantVersion: null,
    reason: 'بررسی سقف اختیار',
    clientOperationId: crypto.randomUUID(),
  };
  expect((await context.request.put(permissionPath, { headers, data: command })).status()).toBe(
    403,
  );
  await request.post(fixture + '/__test__/personal-class', { data: {} });
  await page.reload();
  await expect(page.getByRole('switch', { name: members.assignment, exact: true })).toHaveCount(0);
  expect(
    (
      await context.request.put(permissionPath, {
        headers,
        data: {
          ...command,
          capabilities: 'AuthorAssignments',
          clientOperationId: crypto.randomUUID(),
        },
      })
    ).status(),
  ).toBe(403);
});

test('a lost class-create response is replayed with the same operation after reload', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext', { data: { lostClassAck: true } });
  await page.goto(base + '/classes/new');
  await page.getByLabel('عنوان کلاس', { exact: true }).fill('کلاس با رسید گم‌شده');
  await page.getByLabel('ظرفیت', { exact: true }).fill('20');
  await chooseSchoolCatalog(page, 'درس', 'ریاضی');
  await chooseSchoolCatalog(page, 'دوره', 'دورهٔ نمونه');
  await page.getByRole('button', { name: 'بازبینی کلاس', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')).first(),
  ).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.reload();
  await page.getByRole('button', { name: 'تأیید و ثبت', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'کلاس ایجاد شد', exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const creates = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/academic/classes' && r.method === 'POST',
  );
  expect(creates).toHaveLength(2);
  expect(creates[0].body).toEqual(creates[1].body);
});
test('an unavailable payment quote never enables order creation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext', { data: { paymentUnavailable: true } });
  await login(context, 'Personal', false);
  await page.goto('/personal/subscription?view=plans');
  await page
    .getByRole('button', { name: /^بررسی پلن / })
    .first()
    .click();
  await page
    .getByRole('combobox', { name: 'پلن', exact: true })
    .selectOption({ label: 'پلن آزمون محلی · ۱۰۰ تومان' });
  await page.getByRole('button', { name: 'دریافت برآورد هزینه', exact: true }).click();
  await expect(page.getByText(t.paymentUnavailable, { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'ساخت سفارش در انتظار پرداخت', exact: true }),
  ).toBeDisabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.endsWith('/personal/orders') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('a recipient sees the safe invitation identity before accepting without global lookup', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await request.post(fixture + '/__test__/personal-class', { data: { invitation: true } });
  await page.goto('/personal/extracurricular/invitations');
  await expect(
    page.getByRole('heading', { name: 'کلاس دعوتِ امن پیش از پذیرش', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/مدیر دعوت‌کنندهٔ مجاز/)).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) => r.path.startsWith('/api/v1/people/users/')),
  ).toHaveLength(0);
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/accept'))).toHaveLength(
    0,
  );
});
test('new management forms remain usable in both themes and four viewport widths', async ({
  page,
}) => {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(reviewPath('output/review/vnext-20261105/forms'), { recursive: true });
  await page.goto(base + '/members');
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.evaluate((value) => localStorage.setItem('makan-theme', value), theme);
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + '/members');
      await page
        .getByRole('row')
        .filter({ has: page.getByText('معلم اول', { exact: true }) })
        .getByRole('button', { name: t.manageRoles, exact: true })
        .click();
      const editor = page.locator('section').filter({
        has: page.getByRole('heading', { name: t.manageRoles + ' · معلم اول', exact: true }),
      });
      await editor.scrollIntoViewIfNeeded();
      await expect(editor.getByLabel(t.reason, { exact: true })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await page.screenshot({
        path: reviewPath(`output/review/vnext-20261105/forms/member-${width}-${theme}.png`),
      });
      await page.goto(base + '/classes/' + ids.class);
      await page.getByText(t.classSettings, { exact: true }).click();
      await page.getByLabel(t.title, { exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByLabel(t.capacity, { exact: true })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await page.screenshot({
        path: reviewPath(`output/review/vnext-20261105/forms/class-${width}-${theme}.png`),
      });
      await page.goto(base + '/reports?kind=content-activities');
      await page.getByLabel(t.contentKind).selectOption('Lesson');
      await expect(
        page.getByRole('heading', { name: 'جزوهٔ منتشرشدهٔ معلم', exact: true }),
      ).toBeVisible();
      await expect(page.getByLabel(t.contentKind).locator('option[value="Lesson"]')).toHaveText(
        'جزوه',
      );
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await page.screenshot({
        path: reviewPath(`output/review/vnext-20261105/forms/content-${width}-${theme}.png`),
      });
    }
});
