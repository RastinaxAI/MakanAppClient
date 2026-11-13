import { test, expect, login, fixture, ids, origin } from './test';
import { v6Ui as t } from '../../src/content/fa';
import type { Page } from '@playwright/test';
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
async function picker(page: Page) {
  await page.getByRole('button', { name: t.chooseSchool, exact: true }).click();
  const d = page.getByRole('dialog', { name: t.schoolPicker, exact: true });
  await expect(d).toBeVisible();
  return d;
}
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/design');
  await request.post(fixture + '/__test__/v6-contexts', { data: {} });
});

test('school chooser groups only permitted combinations, rejects an expired role and preserves the pending selection after failure', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/profile');
  const d = await picker(page);
  await expect(d.getByRole('radio')).toHaveCount(4);
  const sepehr = d.getByRole('region', { name: 'آموزشگاه سپهر', exact: true });
  await expect(sepehr.getByRole('radio', { name: /مدرس/ })).toBeDisabled();
  await sepehr.getByRole('radio', { name: /والد/ }).check();
  await request.post(fixture + '/__test__/v6-contexts', { data: { revoked: id(507) } });
  await d.getByRole('button', { name: t.enterRole, exact: true }).click();
  await expect(d.getByRole('alert').filter({ hasText: 'دسترسی' })).toBeVisible();
  await expect(page).toHaveURL(/\/personal\/profile$/);
  await expect(sepehr.getByRole('radio', { name: /والد/ })).toBeDisabled();
  const s = await (await context.request.get('/api/client/session')).json();
  expect(s.context.activeRole).toBe('Teacher');
  expect(s.context.organizationId).toBe(ids.org);
});

test('a same-school role transition is acknowledged once and resets only the educational view', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/profile');
  const d = await picker(page);
  await d
    .getByRole('region', { name: 'آموزشگاه آفتاب', exact: true })
    .getByRole('radio', { name: /والد/ })
    .check();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/workspaces/select', method: 'POST', delay: 500 },
  });
  await d
    .getByRole('button', { name: t.enterRole, exact: true })
    .evaluate((el: HTMLButtonElement) => {
      el.click();
      el.click();
    });
  await expect(page).toHaveURL(/\/personal\/education$/);
  const s = await (await context.request.get('/api/client/session')).json();
  expect(s.context.activeRole).toBe('Parent');
  expect(s.context.organizationId).toBe(ids.org);
  expect(s.context.subjectOrganizationPersonId).toBeNull();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === '/api/v1/workspaces/select' && r.method === 'POST',
    ),
  ).toHaveLength(2);
});

test('school changes in another tab keep private contact and conversation drafts and independent search while the school subtree changes', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: { exactV5Members: true } });
  await request.post(fixture + '/__test__/parent-children', {
    data: {
      children: [
        {
          learnerOrganizationPersonId: id(501),
          displayName: 'فرزند آفتاب',
          organizationId: ids.org,
        },
        {
          learnerOrganizationPersonId: id(503),
          displayName: 'فرزند سپهر',
          organizationId: id(200),
          organizationName: 'آموزشگاه سپهر',
        },
      ],
    },
  });
  await login(context, 'Teacher');
  await page.goto('/personal/profile');
  const chat = await context.newPage();
  await chat.goto('/personal/messages/' + ids.chat);
  const compose = chat.getByRole('textbox', { name: 'متن پیام', exact: true });
  await compose.fill('پیش‌نویس شخصی ثابت');
  const contacts = await context.newPage();
  await contacts.goto('/personal/contacts');
  await contacts.getByRole('button', { name: 'مخاطب جدید', exact: true }).click();
  await contacts.getByLabel(t.contactName, { exact: true }).fill('نام مخاطب ثابت');
  await contacts.getByLabel(t.contactPhone, { exact: true }).fill('09120000101');
  const extra = await context.newPage();
  await extra.goto('/personal/extracurricular');
  const search = extra.locator('[data-ui="search"] input');
  await search.fill('کارگاه');
  const school = await context.newPage();
  await school.goto('/personal/education');
  await expect(school.locator('[data-v5-scene="MK-07"]')).toBeVisible();
  const d = await picker(page);
  await d
    .getByRole('region', { name: 'آموزشگاه سپهر', exact: true })
    .getByRole('radio', { name: /والد/ })
    .check();
  await d.getByRole('button', { name: t.enterRole, exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/education$/);
  await expect(page.getByText('فرزند سپهر', { exact: true })).toBeVisible();
  await expect(page.getByText('فرزند آفتاب', { exact: true })).toHaveCount(0);
  await expect(school.locator('[data-v5-scene="MK-07"]')).toHaveCount(0);
  await expect(school.getByText('فرزند سپهر', { exact: true })).toBeVisible();
  await expect(compose).toHaveValue('پیش‌نویس شخصی ثابت');
  await expect(contacts.getByLabel(t.contactName, { exact: true })).toHaveValue('نام مخاطب ثابت');
  await expect(contacts.getByLabel(t.contactPhone, { exact: true })).toHaveValue('09120000101');
  await expect(search).toHaveValue('کارگاه');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === '/api/v1/workspaces/select' && r.method === 'POST',
    ),
  ).toHaveLength(2);
});

test('a response from the previous account cannot restore its private form in the new account', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/messages/' + ids.chat);
  await page.getByRole('textbox', { name: 'متن پیام', exact: true }).fill('متن خصوصی حساب اول');
  await login(context, 'Student');
  await page.evaluate(() => {
    const c = new BroadcastChannel('makan-client-session');
    c.postMessage('changed');
    c.close();
  });
  // A tab does not receive its own channel message; a second document emits the real cross-tab hint.
  const peer = await context.newPage();
  await peer.goto(origin + '/personal/profile');
  await peer.evaluate(() => {
    const c = new BroadcastChannel('makan-client-session');
    c.postMessage('changed');
    c.close();
  });
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveValue('');
  await expect(peer.getByRole('heading', { name: 'سارا احمدی', exact: true })).toBeVisible();
});

test('a delayed old-cookie session 401 rechecks the current login and cannot expire the newly authenticated account', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/messages/' + ids.chat);
  await page.getByRole('textbox', { name: 'متن پیام', exact: true }).fill('متن حساب قبلی');
  let release!: () => void, started!: () => void;
  const arrived = new Promise<void>((resolve) => {
      started = resolve;
    }),
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
  let stale = 0;
  await page.route('**/api/client/session', async (route) => {
    if (stale++ === 0) {
      started();
      await gate;
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{"status":401}' });
    } else await route.continue();
  });
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await arrived;
  await login(context, 'Student');
  release();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveValue('');
  await expect(page).toHaveURL(new RegExp('/personal/messages/' + ids.chat));
  await expect(page.getByRole('dialog', { name: 'برای ادامه وارد شوید', exact: true })).toHaveCount(
    0,
  );
  expect(stale).toBeGreaterThanOrEqual(2);
});

test('a confirmed missing session still expires safely after one bounded verification retry', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  // Settle the initial realtime snapshot check before faulting this explicit verification.
  const initialized = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/client/session') &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
  await page.goto('/personal/messages/' + ids.chat);
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  await initialized;
  let checks = 0;
  await page.route('**/api/client/session', async (route) => {
    checks++;
    await route.fulfill({ status: 401, contentType: 'application/json', body: '{"status":401}' });
  });
  await page.evaluate(() => window.dispatchEvent(new Event('makan:expired')));
  await expect(page).toHaveURL(/\/enter$/);
  await expect(
    page.getByRole('dialog', { name: 'برای ادامه وارد شوید', exact: true }),
  ).toBeVisible();
  expect(checks).toBe(2);
});

test('a temporary activity-renewal failure preserves the current login and private draft', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher');
  await page.goto('/personal/messages/' + ids.chat);
  const draft = page.getByRole('textbox', { name: 'متن پیام', exact: true });
  await draft.fill('پیش‌نویس هنگام قطع موقت سرویس');
  let checks = 0;
  await page.route('**/api/client/session', async (route) => {
    if (route.request().method() === 'POST') {
      checks++;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"status":503,"code":"UPSTREAM_UNAVAILABLE"}',
      });
    } else await route.continue();
  });
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.poll(() => checks).toBe(1);
  await expect(draft).toHaveValue('پیش‌نویس هنگام قطع موقت سرویس');
  await expect(page).toHaveURL(new RegExp('/personal/messages/' + ids.chat));
  await page.unroute('**/api/client/session');
  const resumed = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/client/session') && response.request().method() === 'POST',
  );
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  expect((await resumed).status()).toBe(200);
  await expect(draft).toHaveValue('پیش‌نویس هنگام قطع موقت سرویس');
});

test('a cold inbox does not refetch fresh queries before realtime reconciliation; reconciliation still refreshes it', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher', false);
  let release!: () => void;
  const reconciliation = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/client/backend/api/v1/realtime/**', async (route) => {
    await reconciliation;
    await route.continue().catch(() => {});
  });
  const reads = async () => {
    const state = await (await request.get(fixture + '/__test__/state')).json();
    return state.requests.filter(
      (row: { path: string; method: string }) =>
        row.path === '/api/v1/conversations/account' && row.method === 'GET',
    ).length;
  };
  try {
    await page.goto('/personal/messages?list=1');
    const row = page.locator(`[data-chat-list] a[href*="/messages/${ids.chat}"]`).first();
    await expect(row).toBeVisible();
    expect(await reads()).toBe(1);
    release();
    await expect.poll(reads).toBeGreaterThan(1);
    await expect(row).toBeVisible();
  } finally {
    release();
  }
});
