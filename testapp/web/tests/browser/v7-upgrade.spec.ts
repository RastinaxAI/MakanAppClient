import { attendanceReference } from '../fixtures/attendance-reference.mjs';
import { test, expect, login, fixture, ids } from './test';
import { v7Ui as t, aiIntegration as ai } from '../../src/content/fa';
import { chooseAssistantPayer } from './assistant-controls';
import { reviewPath } from './review-output';
import { mkdir } from 'node:fs/promises';
const sourceId = '00000000-0000-4000-8000-000000001500';
const channel = '00000000-0000-4000-8000-000000000977';
const output = 'output/review/v7';
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/design');
});
test('local AI cancellation keeps the frozen intent, never renders the late answer and retries with the same operation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant?view=chat');
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش ثابت برای توقف دریافت');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/ai/chat', method: 'POST', delay: 1200 },
  });
  const transmitting = page.waitForRequest(
    (value) => value.url().endsWith('/api/v1/ai/chat') && value.method() === 'POST',
  );
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await transmitting;
  await page.getByRole('button', { name: t.stopReceiving, exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: t.locallyStopped })).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-assistant-result]')).toHaveCount(0);
  const before = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    before.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/ai/chat' && r.method === 'POST',
    ),
  ).toHaveLength(1);
  await page.getByRole('button', { name: ai.retry, exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  const after = await (await request.get(fixture + '/__test__/state')).json();
  const sends = after.requests.filter(
    (r: { path: string; method: string }) => r.path === '/api/v1/ai/chat' && r.method === 'POST',
  );
  expect(sends).toHaveLength(2);
  expect(sends[0].body).toEqual(sends[1].body);
  expect(sends[0].aiHeaders).toEqual(sends[1].aiHeaders);
});
test('conversation information is a real page without a hidden inbox and blocking requires a matching active receipt', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher', false);
  await page.goto('/personal/messages/' + ids.chat + '/info');
  await expect(page.locator('[data-message-room],[data-chat-list]')).toHaveCount(0);
  const before = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    before.requests.filter((r: { path: string }) => r.path === '/api/v1/conversations/account'),
  ).toHaveLength(0);
  await page.getByRole('button', { name: t.blockAccount, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: t.blockAccount, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/messaging/blocks/') && r.method === 'POST',
    ),
  ).toHaveLength(1);
  await page.goto('/personal/settings/blocked');
  await expect(page.getByText('سارا احمدی', { exact: true })).toBeVisible();
});
async function readySources(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
) {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await request.post(fixture + '/__test__/source-ai-ready', { data: { sourceId } });
  await page.getByRole('tab', { name: 'منابع', exact: true }).click();
  const picker = page.getByRole('tabpanel');
  await picker
    .getByRole('checkbox', { name: 'انتخاب منبع واقعی منبع شخصی آزمایشی', exact: true })
    .check();
  await page.getByRole('tab', { name: t.chat, exact: true }).click();
}
test('V7 assistant has source navigation instead of a people inbox and preserves a private draft at every breakpoint', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto('/personal/assistant?view=chat');
  await readySources(page, request);
  const composer = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await composer.fill('پرسش از منبع با پیش‌نویس فارسی Latin 2026');
  await mkdir(reviewPath(output), { recursive: true });
  for (const theme of ['light', 'dark'])
    for (const [width, height] of [
      [320, 540],
      [390, 844],
      [768, 900],
      [834, 1112],
      [1024, 768],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.reading = innerWidth === 320 ? 'large' : 'standard';
      }, theme);
      await expect(composer).toHaveValue('پرسش از منبع با پیش‌نویس فارسی Latin 2026');
      await expect(composer).toBeInViewport();
      await expect(page.locator('[data-chat-list]')).toHaveCount(0);
      await expect(page.locator('[data-assistant-source-panel]')).toHaveCount(0);
      await page.getByRole('tab', { name: t.sources, exact: true }).click();
      await expect(
        page.getByRole('checkbox', { name: 'انتخاب منبع واقعی منبع شخصی آزمایشی', exact: true }),
      ).toBeChecked();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.getByRole('tab', { name: t.chat, exact: true }).click();
      await expect(composer).toHaveValue('پرسش از منبع با پیش‌نویس فارسی Latin 2026');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(2);
      await page.screenshot({ path: reviewPath(`${output}/AST-19-${theme}-${width}.png`) });
    }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) => r.path === '/api/v1/conversations/account'),
  ).toHaveLength(0);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/ai/') &&
        r.method === 'POST' &&
        !r.path.endsWith('/sources/preflight'),
    ),
  ).toHaveLength(0);
});
test('citation preview rechecks access on every open and restores focus to the citation after Escape', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/assistant?view=chat');
  await readySources(page, request);
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('یک پرسش برای بررسی شاهد');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  const citation = page
    .locator('[data-assistant-result]')
    .getByRole('button', { name: /^منبع شخصی آزمایشی نسخه/ });
  await citation.click();
  const dialog = page.getByRole('dialog', { name: t.citationTitle, exact: true });
  await expect(dialog.locator('[data-citation-source]')).toBeVisible();
  await expect(dialog.getByRole('link', { name: t.openSource, exact: true })).toHaveAttribute(
    'href',
    '/personal/resources/' + sourceId,
  );
  await page.keyboard.press('Escape');
  await expect(citation).toBeFocused();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/sources/' + sourceId, method: 'GET', status: 403 },
  });
  await citation.click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.locator('[data-citation-source],blockquote')).toHaveCount(0);
});
test('notice publication retries the same frozen message after lost acknowledgment and creates one official message', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/official-spaces', {
    data: { noticePublishing: true, noticeLostAckOnce: true },
  });
  await login(context, 'Manager');
  await page.goto('/personal/education/notices');
  await expect(page.locator('[data-school-notices]')).toContainText('اعلان انتشار');
  await page.getByRole('link', { name: t.publishNotice, exact: true }).click();
  await page.getByLabel(t.noticeTitle, { exact: true }).fill('اطلاعیهٔ تست ایزوله');
  await page.getByLabel(t.noticeBody, { exact: true }).fill('این پیام فقط در fixture ثبت می‌شود.');
  await page.getByRole('button', { name: t.publishNotice, exact: true }).click();
  await expect(page.getByRole('button', { name: t.retryNotice, exact: true })).toBeVisible();
  await expect(page.getByLabel(t.noticeTitle, { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: t.retryNotice, exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: t.noticeSent })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const calls = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/conversations/' + channel + '/messages' && r.method === 'POST',
  );
  expect(calls).toHaveLength(2);
  expect(calls[0].body).toEqual(calls[1].body);
  await page.goto('/personal/education/notices');
  await expect(page.locator('[data-school-notices]')).toContainText('اطلاعیهٔ تست ایزوله');
  await expect(
    page.locator('[data-school-notices] article').filter({ hasText: 'اطلاعیهٔ تست ایزوله' }),
  ).toHaveCount(1);
});
test('revoked channel publication never posts and a read-only channel has no publication form', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/official-spaces', { data: { noticePublishing: true } });
  await login(context, 'Manager');
  await page.goto('/personal/education/notices/new');
  await page.getByLabel(t.noticeTitle, { exact: true }).fill('پیش‌نویس مجاز پیش از لغو');
  await page.getByLabel(t.noticeBody, { exact: true }).fill('متن حفظ‌شده');
  await request.post(fixture + '/__test__/official-spaces', { data: { canRead: false } });
  await page.getByRole('button', { name: t.publishNotice, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) => r.path.endsWith('/messages') && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await request.post(fixture + '/__test__/official-spaces', {
    data: { canRead: true, noticePublishing: false },
  });
  await page.goto('/personal/education/notices/new');
  await expect(page.locator('[data-school-notice-form]')).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) => r.path.endsWith('/messages') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});
test('day/week selection, notice drafts and the class learner report survive real responsive layouts', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/official-spaces', { data: { noticePublishing: true } });
  await login(context, 'Manager');
  await page.goto('/personal/education/notices/new');
  await page
    .getByLabel(t.noticeTitle, { exact: true })
    .fill('عنوان بلند آموزشگاه برای بررسی فارسی و Latin 2026');
  await page.getByLabel(t.noticeBody, { exact: true }).fill('پیش‌نویس اطلاعیه');
  for (const width of [320, 390, 768, 834, 1024, 1440]) {
    await page.setViewportSize({ width, height: 540 });
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.dataset.reading = 'large';
    });
    await expect(page.getByLabel(t.noticeBody, { exact: true })).toHaveValue('پیش‌نویس اطلاعیه');
    await expect(page.getByRole('button', { name: t.publishNotice, exact: true })).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(2);
  }
  await page.goto('/personal/education/schedule');
  await page.getByRole('button', { name: t.dayView, exact: true }).click();
  await expect(page.getByRole('combobox', { name: t.chooseDay, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: t.dayView, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await login(context, 'Teacher');
  await page.goto(
    '/personal/education/classes/' + ids.class + '/learners/00000000-0000-4000-8000-000000000501',
  );
  await expect(page.getByRole('heading', { name: 'سارا احمدی', exact: true })).toBeVisible();
  await expect(page.getByText(t.releasedAssignments, { exact: true })).toBeVisible();
  await login(context, 'Parent');
  await page.goto(
    '/personal/education/classes/' + ids.class + '/learners/00000000-0000-4000-8000-000000000501',
  );
  await expect(page.getByRole('heading', { name: 'سارا احمدی', exact: true })).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
});

test('source methods expose only the existing file workflow; proposed connectors cannot write or consume AI quota', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/resources');
  await page.getByRole('button', { name: 'افزودن منبع', exact: true }).click();
  const choice = page.locator('[data-source-type-choice]');
  await expect(choice).toBeVisible();
  for (const name of [t.ownedText, t.webSource, t.connectorSource])
    await expect(choice.getByRole('button', { name: new RegExp(name) })).toBeDisabled();
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 540 });
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.reading = innerWidth === 320 ? 'large' : 'standard';
      }, theme);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(2);
    }
  await choice.getByRole('link', { name: new RegExp(t.pdfSource) }).click();
  await expect(page.getByLabel('عنوان منبع', { exact: true })).toBeEditable();
  await expect(page.getByLabel('فایل منبع', { exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) =>
        r.method === 'POST' &&
        (r.path === '/api/v1/files' ||
          r.path === '/api/v1/sources' ||
          r.path.startsWith('/api/v1/ai/')),
    ),
  ).toHaveLength(0);
});

test('student attendance filters use the documented class and date query, preserve selections and never relabel stale rows as a filtered result', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student');
  const data = attendanceReference();
  const recent = new Date(Date.now() - 86400000).toISOString();
  const older = new Date(Date.now() - 60 * 86400000).toISOString();
  data.studentAttendance.items[0].startUtc = recent;
  data.studentAttendance.items[1].startUtc = older;
  data.studentAttendance.items[2].startUtc = older;
  await request.post(fixture + '/__test__/education-case', { data });
  await page.goto('/personal/education/reports?kind=attendance');
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(3);
  const period = page.getByRole('combobox', { name: t.reportPeriod, exact: true });
  const selected = page.getByRole('combobox', { name: t.reportClass, exact: true });
  await period.selectOption('7');
  await selected.selectOption(ids.class);
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(1);
  await expect(page.locator('.stats b')).toHaveText(['۱', '۰', '۰']);
  for (const width of [320, 390, 834, 1440]) {
    await page.setViewportSize({ width, height: 540 });
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.dataset.reading = 'large';
    });
    await expect(period).toHaveValue('7');
    await expect(selected).toHaveValue(ids.class);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(2);
  }
  await page.reload();
  await expect(period).toHaveValue('7');
  await expect(selected).toHaveValue(ids.class);
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(1);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const filtered = state.requests.filter(
    (r: { path: string; query: Record<string, string> }) =>
      r.path === '/api/v1/reports/student/attendance' &&
      r.query.ClassId === ids.class &&
      r.query.FromUtc,
  );
  expect(filtered.length).toBeGreaterThan(0);
  for (const r of filtered) {
    expect(r.query.PageNumber).toBe('1');
    expect((Date.parse(r.query.ToUtc) - Date.parse(r.query.FromUtc)) / 86400000).toBe(7);
  }
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) => r.method !== 'GET' && r.path.includes('/attendance'),
    ),
  ).toHaveLength(0);
});
