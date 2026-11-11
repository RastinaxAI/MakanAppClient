import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v4Text, v4_more, v5Product as t } from '../../src/content/fa';

const chat = '/personal/messages/00000000-0000-4000-8000-000000000950';
const members = '/personal/extracurricular/classes/00000000-0000-4000-8000-000000001800/members';

test('context summaries prioritize visible form fields, resolve numeric selections and exclude closed option dialogs', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: { canPublish: true } },
  });
  await login(context, 'Teacher', false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(chat + '/poll-new');
  await page.getByLabel(v4Text.question, { exact: true }).fill('چه زمانی؟');
  await page.getByLabel('گزینه ۱', { exact: true }).fill('شنبه');
  await page.getByLabel('گزینه ۲', { exact: true }).fill('دوشنبه');
  const panel = page.locator('.rx-context-panel');
  await expect(panel.locator('.context-item > b')).toHaveText([
    v4Text.question,
    'گزینه ۱',
    'گزینه ۲',
  ]);
  await page.getByRole('switch', { name: v4Text.anonymous, exact: true }).uncheck();
  await expect(panel.locator('.context-item > b')).toHaveCount(3);

  await page.goto(chat + '/quiz-new');
  await page.getByLabel(v4Text.question, { exact: true }).fill('کدام گزینه؟');
  await page.getByRole('button', { name: v4Text.options, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: v4Text.options, exact: true });
  await dialog.getByLabel('گزینه ۱', { exact: true }).fill('الف / ب');
  await dialog.getByLabel('گزینه ۲', { exact: true }).fill('پاسخ دوم');
  await dialog.getByRole('button', { name: v4Text.applyOptions, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel(v4Text.correctOption, { exact: true }).selectOption('2');
  await page.getByLabel(v4Text.explanation, { exact: true }).fill('توضیح معتبر');
  await expect(panel.locator('.context-item > b')).toHaveText([
    v4Text.question,
    v4Text.options,
    v4Text.correctOption,
    v4Text.explanation,
  ]);
  await expect(panel.locator('.context-value')).toHaveText([
    'کدام گزینه؟',
    'الف / ب / پاسخ دوم',
    'پاسخ دوم',
    'توضیح معتبر',
  ]);
  await captureExactState(
    page,
    ['MK-245'],
    'Active Admin, visible four-field quiz; closed option-editor fields never appear in the page context.',
  );
});

test('independent member search preserves context and page, displays only matching identities and defers transfer reads until opened', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: { exactV5Members: true } });
  await login(context, 'Personal', false);
  await page.goto(members);
  const rows = page.locator('[data-testid^="membership-"]');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(1)).toContainText('مریم رضایی');
  await captureExactState(page, ['MK-305']);
  const search = page.getByRole('textbox', { name: t.memberName, exact: true });
  await search.fill('مریم');
  await expect(rows).toHaveCount(1);
  await page.reload();
  await expect(search).toHaveValue('مریم');
  await expect(rows).toHaveCount(1);
  await page.setViewportSize({ width: 834, height: 1112 });
  await rows.first().click();
  await expect(page.locator('[data-v5-scene="MK-306"]')).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(search).toHaveValue('مریم');
  await expect(rows).toHaveCount(1);
  await search.fill('هیچ عضو با این نام');
  await expect(page.getByRole('heading', { name: t.noMatchingMembers, exact: true })).toBeVisible();
  await page.locator('.v5-search-clear').click();
  await expect(rows).toHaveCount(3);
  let calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(calls.filter((r: { path: string }) => r.path.endsWith('/manager-transfers'))).toHaveLength(
    0,
  );
  expect(
    calls
      .filter((r: { path: string; query: Record<string, string> }) =>
        r.path.endsWith('/memberships'),
      )
      .every((r: { query: Record<string, string> }) =>
        Object.keys(r.query).every((key) => ['page', 'pageSize'].includes(key)),
      ),
  ).toBe(true);
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'انتقال مدیریت', exact: true })
    .click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'انتقال مدیریت', exact: true }).first(),
  ).toBeVisible();
  calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(calls.some((r: { path: string }) => r.path.endsWith('/manager-transfers'))).toBe(true);
  expect(
    calls.filter(
      (r: { method: string; path: string }) =>
        r.method !== 'GET' && r.path.startsWith('/api/v1/personal-classes/'),
    ),
  ).toHaveLength(0);
});

test('a profile belonging to another identity never labels a class member or appears in search or context', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: { exactV5Members: true } });
  await login(context, 'Personal', false);
  await page.route(
    '**/api/client/backend/api/v1/people/00000000-0000-4000-8000-000000000102',
    async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        json: {
          ...(await response.json()),
          userId: '00000000-0000-4000-8000-000000009999',
          displayName: 'هویت متعلق به فرد دیگر',
        },
      });
    },
  );
  await page.goto(members);
  await expect(page.getByTestId('membership-00000000-0000-4000-8000-000000001808')).toContainText(
    t.classMember,
  );
  await expect(page.getByText('هویت متعلق به فرد دیگر', { exact: true })).toHaveCount(0);
  await page
    .getByRole('textbox', { name: t.memberName, exact: true })
    .fill('هویت متعلق به فرد دیگر');
  await expect(page.getByRole('heading', { name: t.noMatchingMembers, exact: true })).toBeVisible();
  await expect(page.locator('.rx-context-panel')).not.toContainText('هویت متعلق به فرد دیگر');
});

test('join-request review keeps the selected version after failure and displays only the acknowledged result', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: {
      exactV5: true,
      referenceJoinRequests: true,
      adminCapabilities: { canManageInvites: true },
    },
  });
  await login(context, 'Teacher', false);
  await page.goto(chat + '/invites?view=requests');
  await expect(page.locator('[data-v5-scene="MK-219"]')).toBeVisible();
  await expect(page.locator('.v5-row').first()).toContainText('ریحانه زمانی');
  await captureExactState(
    page,
    ['MK-219'],
    'Active Admin, actual pending request DTOs and authorized public identities; self-cancellation is not substituted with manager rejection.',
  );
  await page
    .getByRole('button', { name: t.reviewJoinRequest, exact: true })
    .filter({ visible: true })
    .click();
  const dialog = page.getByRole('dialog', { name: t.reviewJoinRequest, exact: true });
  await expect(dialog.getByRole('heading', { name: 'ریحانه زمانی', exact: true })).toBeVisible();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/approve', method: 'POST', status: 503 },
  });
  await dialog.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(page.locator('.v5-row').first()).toContainText('در انتظار بررسی');
  await dialog.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.v5-row').first()).toContainText('پذیرفته‌شده');
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const writes = calls.filter(
    (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/approve'),
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual({ expectedVersion: 'join-reference-1' });
  expect(writes[0].body).toEqual(writes[1].body);
  expect(calls.some((r: { path: string }) => /\/join-requests\/[^/]+\/cancel$/.test(r.path))).toBe(
    false,
  );
});
