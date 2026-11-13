import { test, expect, login, fixture, ids } from './test';
import { v71Ui as t, v6Ui, messagingInvitations as invites } from '../../src/content/fa';
import type { Page } from '@playwright/test';

const from = '/personal/messages?filter=Direct&list=1';
const picker = '/personal/messages/new?kind=direct&' + new URLSearchParams({ from });
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/design');
});

test('U71-01 country group and phone are centered and isolated at 320 with 200% text; national OTP validation is preserved', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/enter');
  const phone = page.getByRole('textbox', { name: 'شماره همراه', exact: true });
  await phone.fill('۰۹۱۲۰۰۰۰۱۰۱');
  await expect(phone).toHaveValue('09120000101');
  await expect(phone).toHaveCSS('text-align', 'center');
  await expect(phone).toHaveAttribute('dir', 'ltr');
  await expect(phone).toHaveAttribute('autocomplete', 'tel');
  const country = page.getByRole('combobox', { name: v6Ui.authCountry, exact: true });
  await expect(country).toHaveValue('IR');
  await expect(page.locator('[data-country-value] bdi')).toHaveText('+98');
  await expect(page.locator('[data-country-value] bdi')).toHaveAttribute('dir', 'ltr');
  await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
  await noOverflow(page);
  const geometry = await page.locator('[data-country-value]').evaluate((el) => {
    const r = el.getBoundingClientRect();
    const child = document.createRange();
    child.selectNodeContents(el);
    const c = child.getBoundingClientRect();
    return {
      offset: c.left + c.width / 2 - (r.left + r.width / 2),
      width: r.width,
      content: c.width,
    };
  });
  expect(Math.abs(geometry.offset)).toBeLessThan(2);
  expect(geometry.content).toBeLessThanOrEqual(geometry.width);
  await country.focus();
  await expect(country).toBeFocused();
  await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'کد ورود', exact: true })).toBeVisible();
});

test('U71-02/05/10 floating pencil belongs to list, respects actual navigation and opens contacts directly', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  await page.goto(from);
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [767, 844],
    [768, 900],
    [834, 1112],
    [1024, 768],
    [1199, 900],
    [1200, 900],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    const fab = page.getByRole('link', { name: t.newMessage, exact: true });
    await expect(fab).toBeInViewport();
    const box = (await fab.boundingBox())!,
      pane = (await page.locator('[data-chat-list]').boundingBox())!;
    expect(box.width).toBe(56);
    expect(box.height).toBe(56);
    expect(Math.abs(box.x - pane.x - 16)).toBeLessThan(1);
    expect(Math.abs(pane.y + pane.height - box.y - box.height - 16)).toBeLessThan(1);
    if (width < 768)
      expect(box.y + box.height).toBeLessThanOrEqual(
        (await page.locator('[data-app-navigation]:visible').boundingBox())!.y - 16,
      );
    await noOverflow(page);
  }
  await page.getByRole('button', { name: t.inboxMore, exact: true }).click();
  await expect(page.getByRole('menuitem')).toHaveText([
    'پیام‌های ذخیره‌شده',
    t.archive,
    t.folders,
    'تنظیمات پیام‌رسان',
  ]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: t.inboxMore, exact: true })).toBeFocused();
  await page.getByRole('link', { name: t.newMessage, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.newMessage, exact: true })).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('link', { name: t.newGroup, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: t.newChannel, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: t.newContact, exact: true })).toBeVisible();
  await expect(page.locator('[data-composer-trigger]')).toHaveCount(0);
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('filter=Direct&list=1$'));
});

for (const count of [0, 1, 65])
  test(`U71-03 saved contacts ${count}: real pagination, account-only search and discoverable add`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/messaging-repair', { data: { contactCount: count } });
    await login(context, 'Teacher', false);
    await page.goto(picker);
    if (count) await expect(page.getByText('مخاطب آزمایشی 1', { exact: true })).toBeVisible();
    if (count === 65) {
      const next = page.getByRole('button', { name: 'نمایش بیشتر', exact: true });
      await next.click();
      await expect(page.getByText('مخاطب آزمایشی 31', { exact: true })).toBeVisible();
      await next.click();
      await expect(page.getByText('مخاطب آزمایشی 65', { exact: true })).toBeVisible();
      await expect(next).toHaveCount(0);
    }
    const search = page.getByRole('textbox', { name: t.searchContacts, exact: true });
    await search.fill('وجود ندارد');
    await search.press('Enter');
    await expect(page.getByRole('link', { name: t.newContact, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: t.newGroup, exact: true })).toHaveCount(0);
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter((r: { path: string }) => r.path === '/api/v1/people/search'),
    ).toHaveLength(0);
    expect(
      state.requests.some(
        (r: { path: string; query: { q?: string } }) =>
          r.path === '/api/v1/contacts' && r.query.q === 'وجود ندارد',
      ),
    ).toBe(true);
  });

test('U71-03 contact failure retries explicitly without replacing saved data by public people', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  await page.route('**/api/client/backend/api/v1/contacts?**', (route) =>
    route.fulfill({ status: 503, json: { code: 'FIXTURE_CONTACTS_UNAVAILABLE' } }),
  );
  await page.goto(picker);
  const error = page.locator('[data-recipient-picker]').getByRole('alert');
  await expect(error).toBeVisible();
  const retry = error.getByRole('button', { name: 'دریافت دوباره', exact: true });
  const again = page.waitForRequest((value) => value.url().includes('/api/v1/contacts?'));
  await retry.click();
  await again;
  await expect(error).toBeVisible();
  await page.unroute('**/api/client/backend/api/v1/contacts?**');
  await retry.click();
  await expect(error).toHaveCount(0);
  await expect(page.getByRole('heading', { name: t.contacts, exact: true })).toBeVisible();
});

test('U71-04 all three actions use existing flows and contact save refreshes the account picker', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', { data: { contactCount: 0 } });
  await login(context, 'Teacher', false);
  await page.goto(picker);
  for (const [label, field] of [
    [t.newGroup, 'نام گروه'],
    [t.newChannel, 'نام کانال'],
  ]) {
    await page.getByRole('link', { name: label, exact: true }).first().click();
    await expect(page.getByLabel(field, { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  }
  await page.getByRole('link', { name: t.newContact, exact: true }).first().click();
  await page.getByLabel(v6Ui.contactName, { exact: true }).fill('مخاطب ذخیره‌شدهٔ جدید');
  await page.getByLabel('شماره همراه', { exact: true }).fill('۰۹۱۲۰۰۰۰۱۰۱');
  await page.getByRole('button', { name: v6Ui.saveContact, exact: true }).click();
  await expect(page.getByText('مخاطب ذخیره‌شدهٔ جدید', { exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/contacts' && r.method === 'POST',
    ),
  ).toHaveLength(1);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        /conversations\/(groups|channels)$/.test(r.path) && r.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('U71-06 six single-selection presets use documented filters and preserve official cursor traversal', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Teacher', false);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/personal/messages?list=1');
  const nav = page.getByRole('navigation', { name: 'نوع گفتگوها', exact: true });
  await expect(nav.getByRole('button')).toHaveText([
    'همه',
    'مستقیم',
    'گروه‌ها',
    'کانال‌ها',
    'رسمی',
    'نخوانده',
  ]);
  for (const [label, filter] of [
    ['مستقیم', 'Direct'],
    ['گروه‌ها', 'Group'],
    ['کانال‌ها', 'Channel'],
    ['نخوانده', 'Unread'],
    ['همه', 'All'],
    ['رسمی', 'All'],
  ]) {
    const button = nav.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(new URL(page.url()).searchParams.get('filter')).toBe(filter);
    await expect(nav.locator('[aria-pressed=true]')).toHaveCount(1);
    await noOverflow(page);
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some((r: { query: { Filter?: string } }) => r.query?.Filter === 'Official'),
  ).toBe(false);
});

for (const name of [
  'نام فارسی طولانی برای بررسی هویت مخاطب',
  'English Contact With A Very Long Name',
  'Sara سارا 2026 کلاس',
])
  test(`U71-07 header identity stays RTL and keeps avatar: ${name}`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/chat-kind', { data: { displayName: name } });
    await login(context, 'Teacher', false);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/personal/messages/' + ids.chat);
    const header = page.locator('[data-chat-header]'),
      identity = page.locator('[data-chat-identity]');
    await expect(identity.getByRole('heading', { name, exact: true })).toBeVisible();
    const geometry = await header.evaluate((el) => {
      const bounds = (node: Element) => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const identity = el.querySelector('[data-chat-identity]')!;
      return {
        back: bounds(el.firstElementChild!),
        avatar: bounds(identity.firstElementChild!),
        name: bounds(identity.querySelector('h1')!),
        more: bounds(el.lastElementChild!),
      };
    });
    expect(geometry.avatar.width).toBe(40);
    expect(geometry.avatar.height).toBe(40);
    expect(geometry.back.x).toBeGreaterThan(geometry.avatar.x);
    expect(geometry.avatar.x).toBeGreaterThan(geometry.name.x);
    expect(geometry.more.x).toBeLessThan(geometry.name.x);
    await expect(identity.getByRole('heading')).toHaveCSS('text-align', 'right');
    await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
    await noOverflow(page);
    await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeInViewport();
    await identity.click();
    await expect(page).toHaveURL(new RegExp(ids.chat + '/info'));
  });

test('U71-08 invitations entry counts only valid pending received items, retains terminal states and never auto-accepts', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: {
      receivedStatuses: [
        'Pending',
        'Pending',
        'PastPending',
        'Revoked',
        'Accepted',
        'Declined',
        'Expired',
      ],
    },
  });
  await login(context, 'Teacher', false);
  await page.goto(from);
  const entry = page.locator('[data-messaging-invitations-entry]');
  await expect(entry.locator('b')).toHaveText('۲');
  await entry.click();
  await expect(page.getByRole('heading', { name: invites.title, exact: true })).toBeVisible();
  await expect(page.locator('[data-invitation-status]')).toHaveCount(7);
  await expect(page.getByRole('button', { name: invites.accept, exact: true })).toHaveCount(2);
  await expect(page.locator('[data-invitation-status=Expired]')).toHaveCount(2);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        /messaging\/invitations\/.+\/(accept|decline)/.test(r.path) && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('filter=Direct&list=1$'));
});

test('U71-08 unknown invitation count and a failed decision never announce success or remove the card', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { receivedStatuses: ['Pending'] },
  });
  await login(context, 'Teacher', false);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/messaging/invitations', method: 'GET', status: 503 },
  });
  await page.goto(from);
  await expect(page.locator('[data-messaging-invitations-entry]')).toHaveAttribute(
    'aria-label',
    t.invitations,
  );
  await expect(page.locator('[data-messaging-invitations-entry] b')).toHaveCount(0);
  await page.locator('[data-messaging-invitations-entry]').click();
  const retry = page.getByRole('button', { name: invites.refresh, exact: true });
  await retry.click();
  await expect(page.locator('[data-invitation-status=Pending]')).toHaveCount(1);
  await request.post(fixture + '/__test__/fault', {
    data: {
      path: '/messaging/invitations/00000000-0000-4000-8000-000000021000/accept',
      method: 'POST',
      status: 503,
    },
  });
  await page.getByRole('button', { name: invites.accept, exact: true }).click();
  await expect(page.locator('[data-messaging-invitations]').getByRole('alert')).toBeVisible();
  await expect(page.locator('[data-invitation-status=Pending]')).toHaveCount(1);
  await expect(page).toHaveURL(/messages\/invitations/);
});

test('U71-09 inbox scroll and filter return from picker; the open room draft survives resize, theme and picker round-trip', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/inbox-pages', {
    data: { personal: 31, organization: 0 },
  });
  await login(context, 'Teacher', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(from);
  await expect(page.getByText('گفتگوی حساب 1', { exact: true })).toBeVisible();
  await page.locator('[data-inbox-scroll]').evaluate((el) => {
    el.scrollTop = 500;
    el.dispatchEvent(new Event('scroll'));
  });
  const scroll = await page.locator('[data-inbox-scroll]').evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(300);
  await page.getByRole('link', { name: t.newMessage, exact: true }).click();
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect
    .poll(() => page.locator('[data-inbox-scroll]').evaluate((el) => el.scrollTop))
    .toBeCloseTo(scroll, 0);
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto('/personal/messages/' + ids.chat + '?filter=Direct');
  const composer = page.getByRole('textbox', { name: 'متن پیام', exact: true });
  await composer.fill('پیش‌نویس ثابت فارسی Latin 2026');
  await page.getByRole('link', { name: t.newMessage, exact: true }).click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(() => {
    localStorage.setItem('makan-theme', 'dark');
    window.dispatchEvent(new Event('makan-theme-changed'));
  });
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(composer).toHaveValue('پیش‌نویس ثابت فارسی Latin 2026');
  await expect(page.locator('[data-chat-identity]')).toBeVisible();
  const fab = (await page.locator('[data-composer-trigger]').boundingBox())!,
    list = (await page.locator('[data-chat-list]').boundingBox())!,
    room = (await page.locator('[data-message-room]').boundingBox())!;
  expect(fab.x).toBeGreaterThanOrEqual(list.x);
  expect(fab.x + fab.width).toBeLessThanOrEqual(list.x + list.width);
  expect(fab.x).toBeGreaterThanOrEqual(room.x + room.width);
  await page.setViewportSize({ width: 390, height: 540 });
  await expect(page.locator('[data-composer-trigger]')).not.toBeVisible();
  await expect(composer).toBeInViewport();
});

for (const theme of ['light', 'dark'])
  test(`U71-10/11 ${theme}: 200% text, short landscape, keyboard-sized viewport and open menus keep controls accessible`, async ({
    page,
    context,
  }) => {
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Teacher', false);
    for (const [width, height] of [
      [320, 568],
      [390, 420],
      [834, 540],
      [1024, 540],
      [1440, 700],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(from);
      await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
      await noOverflow(page);
      const nav = page.locator('[data-app-navigation]:visible');
      const fab = page.getByRole('link', { name: t.newMessage, exact: true });
      await expect(fab).toBeInViewport();
      if (width < 768)
        expect((await fab.boundingBox())!.y + 56).toBeLessThanOrEqual(
          (await nav.boundingBox())!.y - 16,
        );
      await page.getByRole('button', { name: t.inboxMore, exact: true }).click();
      await expect(
        page.getByRole('menuitem', { name: 'تنظیمات پیام‌رسان', exact: true }),
      ).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: t.inboxMore, exact: true })).toBeFocused();
      await fab.click();
      const search = page.getByRole('textbox', { name: t.searchContacts, exact: true });
      await expect(search).toBeInViewport();
      await search.fill('یافت نمی‌شود');
      await search.press('Enter');
      await page.getByRole('link', { name: t.newContact, exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('link', { name: t.newContact, exact: true })).toBeInViewport();
      await noOverflow(page);
    }
  });

test('U71-06 folders retain their selected name and back destination without becoming a type filter', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', { data: {} });
  await login(context, 'Student', false);
  await page.goto('/personal/messages/folders?' + new URLSearchParams({ from }));
  await page.getByRole('button', { name: 'آموزشگاه', exact: true }).click();
  await expect(
    page.locator('[data-active-folder]').getByRole('heading', { name: 'آموزشگاه', exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get('folder')).toBeTruthy();
  await page.reload();
  await expect(
    page.locator('[data-active-folder]').getByRole('heading', { name: 'آموزشگاه', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: t.allFolders, exact: true }).click();
  await expect(page.locator('[data-active-folder]')).toHaveCount(0);
  await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('filter=Direct&list=1$'));
});

test('U71-11 keyboard focus clears the measured sticky header, including 200% text and a scrolling short-screen header', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/inbox-pages', {
    data: { personal: 31, organization: 0 },
  });
  await login(context, 'Teacher', false);
  await page.goto('/personal/messages?list=1');
  await expect(page.getByText('گفتگوی حساب 6', { exact: true })).toBeVisible();
  for (const [width, height, large] of [
    [390, 844, false],
    [834, 1112, true],
    [390, 420, true],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(
      (large) => (document.documentElement.dataset.reading = large ? 'large' : 'standard'),
      large,
    );
    await expect
      .poll(() =>
        page.locator('[data-inbox-scroll]').evaluate((scroll) => {
          const header = scroll.querySelector<HTMLElement>('[data-inbox-header]')!;
          return getComputedStyle(header).position === 'static'
            ? parseFloat(getComputedStyle(scroll).scrollPaddingBlockStart) === 0
            : Math.abs(
                parseFloat(getComputedStyle(scroll).scrollPaddingBlockStart) -
                  header.getBoundingClientRect().height,
              ) < 1;
        }),
      )
      .toBe(true);
    const visible = await page.locator('[data-inbox-scroll]').evaluate((scroll) => {
      const links = scroll.querySelectorAll<HTMLAnchorElement>('a[href*="/personal/messages/000"]');
      const target = links[5];
      target.blur();
      scroll.scrollTop = 0;
      scroll.scrollTop =
        target.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 10;
      target.focus();
      const r = target.getBoundingClientRect();
      return target.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    });
    expect(visible).toBe(true);
    await noOverflow(page);
  }
});

test('foreground use renews a persistent 30-day cookie; passive and cross-origin reads cannot extend it', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  const cookie = (await context.cookies()).find((item) => item.name === 'makan_client_session')!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Strict');
  expect(cookie.expires - Date.now() / 1000).toBeGreaterThan(29.9 * 86400);
  // An older browser deadline must be renewed on verified return, rather than keeping the original login date.
  await context.addCookies([{ ...cookie, expires: Date.now() / 1000 + 120 }]);
  const renewed = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/client/session') && response.request().method() === 'POST',
  );
  await page.goto('/personal/profile');
  expect((await renewed).status()).toBe(200);
  const current = (await context.cookies()).find((item) => item.name === cookie.name)!;
  expect(current.expires - Date.now() / 1000).toBeGreaterThan(29.9 * 86400);
  expect(current.expires - Date.now() / 1000).toBeLessThanOrEqual(30 * 86400);
  const passive = await context.request.get('/api/client/session');
  expect(passive.status()).toBe(200);
  expect(passive.headers()['set-cookie']).toBeUndefined();
  const forged = await context.request.post('/api/client/session', {
    headers: { Origin: 'https://external.invalid' },
  });
  expect(forged.status()).toBe(403);
  expect(forged.headers()['set-cookie']).toBeUndefined();
  const peer = await context.newPage();
  await peer.goto('/personal/messages?list=1');
  await expect(peer.getByRole('heading', { name: 'پیام‌ها', exact: true })).toBeVisible();
});

test('inbox search is owned by the header and the new-message header has no More menu', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/messages?list=1');
  await expect(page.locator('[data-chat-list] input')).toHaveCount(0);
  await page
    .locator('[data-inbox-header]')
    .getByRole('link', { name: 'انجام جستجوی گفتگو', exact: true })
    .click();
  const search = page.getByRole('textbox', { name: 'جستجوی گفتگوها', exact: true });
  await expect(search).toBeVisible();
  await expect(page.locator('[data-inbox-header]')).toContainText('جستجو');
  expect(await search.evaluate((element) => !!element.closest('[data-inbox-header]'))).toBe(true);
  await expect(page.getByRole('textbox')).toHaveCount(1);
  await search.fill('سارا');
  await search.press('Enter');
  await expect(page).toHaveURL(/q=/);
  await noOverflow(page);
  await page.goto(picker);
  await expect(page.locator('[data-recipient-picker]')).toBeVisible();
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'گزینه‌های بیشتر', exact: true }),
  ).toHaveCount(0);
});

for (const type of ['Group', 'Channel']) {
  test(`${type} empty conversation centers its identity, explanation and actions`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/conversation-details', { data: { type } });
    await login(context, 'Student', false);
    await page.goto('/personal/messages/00000000-0000-4000-8000-000000000950');
    const hero = page.getByRole('region', { name: 'شروع گفتگو', exact: true });
    await expect(hero).toBeVisible();
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      const offsets = await hero.evaluate((element) => {
        const root = element.getBoundingClientRect();
        return [...element.children]
          .filter((node) => node.getBoundingClientRect().width)
          .map((node) => {
            const r = node.getBoundingClientRect();
            return Math.abs(r.x + r.width / 2 - root.x - root.width / 2);
          });
      });
      expect(Math.max(...offsets)).toBeLessThanOrEqual(2);
      await noOverflow(page);
    }
  });
  test(`${type} library changes local panels without replacing its header, search draft or media filter`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/conversation-details', { data: { type } });
    await login(context, 'Student', false);
    const base = '/personal/messages/00000000-0000-4000-8000-000000000950/media';
    await page.goto(base);
    const tabs = page.getByRole('tablist', { name: 'بخش‌های گفتگو', exact: true });
    await expect(tabs).toBeVisible();
    await page.getByRole('banner').evaluate((element) => {
      element.dataset.testInstance = 'same-library-header';
    });
    const search = page.getByRole('textbox', { name: 'جستجو در گفتگو', exact: true });
    await search.fill('پیش‌نویس جستجوی رسانه');
    await page.getByRole('button', { name: 'نوع رسانه', exact: true }).click();
    await page.getByRole('combobox', { name: 'نوع رسانه', exact: true }).selectOption('Image');
    for (const name of ['سنجاق‌ها', 'پیوندها', 'اعضا', 'رسانه']) {
      await tabs.getByRole('tab', { name, exact: true }).click();
      await expect(tabs.getByRole('tab', { name, exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.getByRole('banner')).toHaveAttribute(
        'data-test-instance',
        'same-library-header',
      );
      expect(new URL(page.url()).pathname).toBe(base);
    }
    await expect(search).toHaveValue('پیش‌نویس جستجوی رسانه');
    await page.getByRole('button', { name: 'نوع رسانه', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'نوع رسانه', exact: true })).toHaveValue(
      'Image',
    );
    await tabs.getByRole('tab', { name: 'اعضا', exact: true }).click();
    await page.getByRole('textbox', { name: 'نام یا شناسه عضو', exact: true }).fill('مالک');
    await tabs.getByRole('tab', { name: 'رسانه', exact: true }).click();
    await tabs.getByRole('tab', { name: 'اعضا', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'نام یا شناسه عضو', exact: true })).toHaveValue(
      'مالک',
    );
    await noOverflow(page);
  });
}
