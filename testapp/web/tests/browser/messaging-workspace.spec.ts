import { reviewPath } from './review-output';
import { test, expect, login, fixture, origin } from './test';
import { messagingWorkspace as t } from '@/content/fa';
const conversation = '00000000-0000-4000-8000-000000000950';
const base = '/personal/messages/' + conversation;
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/conversation-context', { data: {} });
});

test('an organization inbox row stays available and returns to the same conversation after explicit selection', async ({
  page,
  context,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(context, 'Teacher', false);
  await page.goto('/personal/messages?filter=Group&q=' + encodeURIComponent('آزمون زمینه'));
  const row = page.getByRole('link').filter({ hasText: 'گفتگوی آموزشگاه برای آزمون زمینه' });
  await row.click();
  const notice = page.locator('[data-conversation-workspace]');
  await expect(notice.getByRole('heading', { name: t.title, exact: true })).toBeVisible();
  await expect(row).toBeVisible();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string }) =>
        r.path === `/api/v1/conversations/${conversation}` ||
        r.path === `/api/v1/conversations/${conversation}/messages`,
    ),
  ).toHaveLength(0);
  await notice.getByRole('button', { name: new RegExp(t.select) }).click();
  await expect(
    page
      .getByRole('link', { name: 'اطلاعات گفتگو', exact: true })
      .getByRole('heading', { name: 'گفتگوی آموزشگاه برای آزمون زمینه', exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(base);
  expect(new URL(page.url()).searchParams.get('filter')).toBe('Group');
  expect(new URL(page.url()).searchParams.get('q')).toBe('آزمون زمینه');
  await expect(notice).toHaveCount(0);
  state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === '/api/v1/workspaces/select' && r.method === 'POST',
    ),
  ).toHaveLength(1);
  const session = await (await context.request.get('/api/client/session')).json();
  expect(session.context.workspaceType).toBe('Organization');
  expect(session.context.activeRole).toBe('Teacher');
});

test('a matching organization context opens directly without selecting a workspace again', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto(base);
  await expect(
    page
      .getByRole('link', { name: 'اطلاعات گفتگو', exact: true })
      .getByRole('heading', { name: 'گفتگوی آموزشگاه برای آزمون زمینه', exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-conversation-workspace]')).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) => r.path === '/api/v1/workspaces/select'),
  ).toHaveLength(1);
});

test('a deep link absent from loaded inbox pages keeps the real 404 and offers permitted contexts', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-context', {
    data: { hiddenFromAccount: true },
  });
  await login(context, 'Teacher', false);
  await page.goto(base);
  const notice = page.locator('[data-conversation-workspace]');
  await expect(notice.getByRole('heading', { name: t.unresolvedTitle, exact: true })).toBeVisible();
  await expect(notice.getByRole('alert')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'گفتگوی آموزشگاه برای آزمون زمینه', exact: true }),
  ).toHaveCount(0);
  await notice.getByRole('button', { name: new RegExp(t.select) }).click();
  await expect(
    page
      .getByRole('link', { name: 'اطلاعات گفتگو', exact: true })
      .getByRole('heading', { name: 'گفتگوی آموزشگاه برای آزمون زمینه', exact: true }),
  ).toBeVisible();
});

for (const mode of ['workspacesDisabled', 'unrelatedWorkspace'])
  test(`${mode} never offers an invalid selection or loads chat content`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/conversation-context', { data: { [mode]: true } });
    await login(context, 'Teacher', false);
    await page.goto('/personal/messages');
    await page.getByRole('link').filter({ hasText: 'گفتگوی آموزشگاه برای آزمون زمینه' }).click();
    const notice = page.locator('[data-conversation-workspace]');
    await expect(notice.getByText(t.noMatchingWorkspace, { exact: true })).toBeVisible();
    await expect(notice.getByRole('button', { name: new RegExp(t.select) })).toHaveCount(0);
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter(
        (r: { path: string }) =>
          r.path === '/api/v1/workspaces/select' ||
          r.path === `/api/v1/conversations/${conversation}/messages`,
      ),
    ).toHaveLength(0);
  });

test('selecting a valid school role never grants a nonparticipant access to another conversation', async ({
  page,
  context,
}) => {
  await login(context, 'Parent', false);
  await page.goto(base);
  const notice = page.locator('[data-conversation-workspace]');
  await notice.getByRole('button', { name: new RegExp(t.select) }).click();
  await expect(notice.getByText(t.noAlternativeWorkspace, { exact: true })).toBeVisible();
  await expect(notice.getByRole('alert')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'گفتگوی آموزشگاه برای آزمون زمینه', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(0);
});

test('a failed workspace switch preserves the URL and personal context without loading the conversation', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher', false);
  await page.goto('/personal/messages');
  await page.getByRole('link').filter({ hasText: 'گفتگوی آموزشگاه برای آزمون زمینه' }).click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/workspaces/select', method: 'POST', status: 503 },
  });
  await page
    .locator('[data-conversation-workspace]')
    .getByRole('button', { name: new RegExp(t.select) })
    .click();
  await expect(
    page
      .getByRole('alert')
      .filter({ has: page.getByRole('heading', { name: 'اطلاعات دریافت نشد', exact: true }) }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(conversation));
  const session = await (await context.request.get(origin + '/api/client/session')).json();
  expect(session.context.workspaceType).toBe('Personal');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string }) => r.path === `/api/v1/conversations/${conversation}/messages`,
    ),
  ).toHaveLength(0);
});

test('workspace guidance fits both themes and phone tablet desktop viewports', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  const { mkdir } = await import('node:fs/promises');
  await mkdir(reviewPath('output/review/messaging-context-20261105/fixture'), { recursive: true });
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((v) => localStorage.setItem('makan-theme', v), theme);
      await page.goto('/personal/messages');
      await page.getByRole('link').filter({ hasText: 'گفتگوی آموزشگاه برای آزمون زمینه' }).click();
      const notice = page.locator('[data-conversation-workspace]');
      await expect(notice.getByRole('button', { name: new RegExp(t.select) })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
        .toBe(theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: reviewPath(`output/review/messaging-context-20261105/fixture/${theme}-${width}.png`),
      });
    }
});
