import { test, expect, login, fixture, ids } from './test';
import type { Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as fa from '../../src/content/fa';
const copy = fa.messengerPdf;
const out =
  process.env.MAKAN_MESSENGER_EVIDENCE || '/tmp/makan-messenger-pdf-20261113/browser-evidence';
async function ready(page: Page) {
  await expect(page.locator('[data-app-render-error]')).toHaveCount(0);
  await page
    .locator('.bootstrap:visible,.skeleton-wrap:visible')
    .first()
    .waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
}
async function capture(page: Page, name: string, reference: string) {
  await ready(page);
  await mkdir(out, { recursive: true });
  const meta = await page.evaluate(() => ({
    route: location.pathname + location.search,
    width: innerWidth,
    height: innerHeight,
    theme: document.documentElement.dataset.theme,
    reading: document.documentElement.dataset.reading,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    focus: document.activeElement?.getAttribute('aria-label'),
    rects: [
      ...document.querySelectorAll<HTMLElement>(
        '[data-chat-header],[data-ui="composer"],[data-ui="search"],[data-message-id],[data-app-navigation],[role="dialog"],[role="menu"],[class*="composerArea"],[class*="librarySearch"],[class*="libraryTabs"],[class*="identityCard"],[class*="mediaGrid"],[data-compact][data-visual]',
      ),
    ]
      .filter(
        (node) =>
          node.getBoundingClientRect().height &&
          getComputedStyle(node).visibility !== 'hidden' &&
          !node.closest('[inert]'),
      )
      .map((node) => {
        const r = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          tag: node.tagName,
          role: node.getAttribute('role'),
          id: node.dataset.messageId,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          background: style.backgroundColor,
          font: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          padding: style.padding,
          gap: style.gap,
          radius: style.borderRadius,
          className: node.className,
        };
      }),
  }));
  expect(meta.overflow).toBe(false);
  for (const rect of meta.rects.filter((rect) => rect.role === 'menu' || rect.role === 'dialog')) {
    expect(rect.x).toBeGreaterThanOrEqual(-1);
    expect(rect.y).toBeGreaterThanOrEqual(-1);
    expect(rect.x + rect.width).toBeLessThanOrEqual(meta.width + 1);
    expect(rect.y + rect.height).toBeLessThanOrEqual(meta.height + 1);
  }
  await page.screenshot({ path: `${out}/${name}.png`, animations: 'disabled' });
  await writeFile(
    `${out}/${name}.json`,
    JSON.stringify(
      {
        ...meta,
        synthetic: true,
        source: 'real Next.js client with isolated contract fixtures',
        priorReference: reference,
        activeReference:
          'Makan V7; current viewport comparisons are recorded in docs/ui-updates/v7',
        build: (await readFile('.next/BUILD_ID', 'utf8')).trim(),
      },
      null,
      2,
    ),
  );
}
for (const theme of ['light', 'dark'] as const)
  for (const [width, height] of [
    [375, 728],
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    test(`V7 messenger ${theme} ${width}: native list, composer, choices and sheets`, async ({
      page,
      context,
      request,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await request.post(fixture + '/__test__/design');
      await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
      await login(context, 'Student', false);
      await page.setViewportSize({ width, height });
      await page.goto('/personal/messages');
      await expect(
        page.getByRole('button', { name: fa.text_bb8b8f5b8bfc, exact: true }),
      ).toBeVisible();
      await expect(page.locator('[data-chat-list] .skeleton-wrap')).toHaveCount(0);
      const search = page.locator('[data-ui="search"]').first();
      await expect(search).toBeVisible();
      expect((await search.boundingBox())!.height).toBeCloseTo(48, 0);
      if (width === 375) {
        expect(
          Math.abs(
            (await page
              .locator('[data-chat-list] a[aria-current], [data-chat-list] [class*="chatItem"]')
              .first()
              .boundingBox())!.y - 228.4,
          ),
        ).toBeLessThan(4);
      }
      await capture(
        page,
        `inbox-${theme}-${width}`,
        'Light/Dark 29; RTL labels, permitted avatar placeholders, Makan five destinations',
      );
      await page.getByRole('button', { name: fa.text_197ebc70e3d9, exact: true }).click();
      await capture(page, `groups-${theme}-${width}`, 'Light/Dark 16; real empty group list');
      await page.goto('/personal/messages/new?kind=direct');
      await expect(page.getByRole('heading', { name: copy.newMessage, exact: true })).toBeVisible();
      await capture(
        page,
        `new-message-${theme}-${width}`,
        'Light/Dark 17; username replaces unavailable employee email',
      );
      await page.goto('/personal/messages/new?kind=groups');
      await page.getByLabel(fa.text_0e1567f71aa6, { exact: true }).fill('گروه بررسی رابط');
      await page.getByRole('button', { name: fa.v5Product.selectPeople, exact: true }).click();
      await expect(page.getByRole('checkbox').first()).toBeVisible();
      await page.getByRole('checkbox').first().check();
      await capture(
        page,
        `new-group-${theme}-${width}`,
        'Light/Dark 18; required API group information captured in preceding step',
      );
      await page.goto('/personal/messages/' + ids.chat);
      const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
      await expect(input).toBeVisible();
      await expect(page.locator('[data-message-id]')).toHaveCount(4);
      expect(
        Math.abs(
          (await page.locator('[data-chat-header]').boundingBox())!.height -
            (width < 768 ? 74.4 : 76),
        ),
      ).toBeLessThan(4);
      await capture(
        page,
        `chat-${theme}-${width}`,
        'Light/Dark 40,44; no status bar/home indicator/device frame',
      );
      await input.fill('پیش‌نویس محفوظ');
      const incoming = page.locator('[data-message-direction="incoming"]').first();
      await incoming.click({ button: 'right' });
      await expect(page.getByRole('menu')).toBeVisible();
      await capture(
        page,
        `message-options-${theme}-${width}`,
        'Light/Dark 42; preserved forward/save/report extensions',
      );
      await page.getByRole('menuitem', { name: fa.text_a6340bbd29bf, exact: true }).click();
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('پیش‌نویس محفوظ');
      await capture(page, `reply-${theme}-${width}`, 'Light/Dark 45,47');
      await page.getByRole('button', { name: fa.text_9a9aac0aea02, exact: true }).click();
      await page.getByRole('button', { name: fa.text_01eac8227680, exact: true }).click();
      await expect(page.getByRole('menu')).toBeVisible();
      await capture(
        page,
        `attachment-menu-${theme}-${width}`,
        'Light/Dark 57; Files and Camera; the file chooser retains image/video/document support and draft voice is preserved',
      );
      await page.keyboard.press('Escape');
      await page.getByRole('link', { name: fa.text_3a3510c0ba99, exact: true }).first().click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(
        page.getByRole('link', { name: fa.text_563cba00d087, exact: true }),
      ).toBeVisible();
      await capture(page, `details-${theme}-${width}`, 'V7 MSG-14; independent information page');
      await expect(page.getByRole('link', { name: copy.pins, exact: true })).toBeVisible();
      await page
        .getByRole('banner')
        .getByRole('link', { name: fa.common_back, exact: true })
        .click();
      await expect(input).toHaveValue('پیش‌نویس محفوظ');
      expect(errors).toEqual([]);
    });
  }

test('edit, conflict, cancel, pin and explicit deletion keep the original draft and obey receipts', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/messages/' + ids.chat);
  const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
  await input.fill('پیش‌نویس مستقل از ویرایش');
  const own = page.locator('[data-message-direction="outgoing"]').last();
  const id = await own.getAttribute('data-message-id');
  await own.getByRole('button', { name: /گزینه‌های پیام/ }).click();
  await page.getByRole('menuitem', { name: copy.editMessage, exact: true }).click();
  await input.fill('متن ویرایش شده');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/messages/' + id, method: 'PATCH', status: 409 },
  });
  await page.getByRole('button', { name: fa.text_51dd685556b8, exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(input).toHaveValue('متن ویرایش شده');
  await capture(page, 'edit-conflict-light-390', 'Light/Dark 43; real 409 preserves edit');
  await page.getByRole('button', { name: copy.cancelEdit, exact: true }).click();
  await expect(input).toHaveValue('پیش‌نویس مستقل از ویرایش');
  await own.getByRole('button', { name: /گزینه‌های پیام/ }).click();
  await page.getByRole('menuitem', { name: copy.editMessage, exact: true }).click();
  await input.fill('متن ویرایش معتبر');
  await page.getByRole('button', { name: fa.text_51dd685556b8, exact: true }).click();
  await expect(own).toContainText('متن ویرایش معتبر');
  await expect(input).toHaveValue('پیش‌نویس مستقل از ویرایش');
  await own.getByRole('button', { name: /گزینه‌های پیام/ }).click();
  await page.getByRole('menuitem', { name: copy.pinMessage, exact: true }).click();
  await expect(
    page.getByRole('link').filter({ hasText: 'متن ویرایش معتبر' }).first(),
  ).toBeVisible();
  await capture(page, 'pin-light-390', 'Light/Dark 48');
  await own.getByRole('button', { name: /گزینه‌های پیام/ }).click();
  await page.getByRole('menuitem', { name: copy.unpinMessage, exact: true }).click();
  await own.getByRole('button', { name: /گزینه‌های پیام/ }).click();
  await page.getByRole('menuitem', { name: copy.deleteMessage, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: copy.deleteMessage, exact: true });
  await expect(dialog).toBeVisible();
  await capture(page, 'delete-confirm-light-390', 'Light/Dark 49');
  await dialog.getByRole('button', { name: copy.confirmDelete, exact: true }).click();
  await expect(own).toContainText(fa.text_105c4ade8a0f);
  await expect(input).toHaveValue('پیش‌نویس مستقل از ویرایش');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const edits = state.requests.filter(
    (row: { method: string; path: string }) =>
      row.method === 'PATCH' && row.path.endsWith('/messages/' + id),
  );
  expect(edits).toHaveLength(2);
  expect(edits[0].body.expectedVersion).toBe(edits[1].body.expectedVersion);
  expect(
    state.requests.filter(
      (row: { method: string; path: string }) =>
        row.method === 'POST' && row.path.endsWith('/messages'),
    ),
  ).toHaveLength(0);
});

test('search tabs call the documented API; a matched message opens by its real sequence', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/messages?search=1&searchIn=messages&q=' + encodeURIComponent('جلسه'));
  const result = page.locator('[data-message-search-results] a').first();
  await expect(result).toBeVisible();
  await capture(page, 'search-messages-light-390', 'Light/Dark 26');
  await result.click();
  await expect(page).toHaveURL(/sequence=/);
  await expect(page.locator('[data-message-id]').filter({ hasText: 'جلسه' }).first()).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some(
      (r: { path: string; query: { q: string } }) =>
        r.path === '/api/v1/messages/search' && r.query.q === 'جلسه',
    ),
  ).toBe(true);
});

test('mobile keyboard-height, 200% text and live theme/width changes preserve the message draft', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.goto('/personal/messages/' + ids.chat);
  const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
  const draft = 'نام و پیام بلند فارسی Latin-2026-attachment.pdf برای بررسی بازچینی';
  await input.fill(draft);
  for (const theme of ['light', 'dark'])
    for (const [width, height] of [
      ...[320, 360, 390, 430, 768, 834, 1024, 1194, 1280, 1440, 1920].map((width) => [width, 540]),
      [844, 390],
      [390, 320],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate((theme) => {
        localStorage.setItem('makan-theme', theme);
        window.dispatchEvent(new Event('makan-theme-changed'));
        document.documentElement.dataset.reading = 'large';
      }, theme);
      await expect(input).toHaveValue(draft);
      const composer = await page.locator('[data-ui="composer"]').boundingBox();
      expect(composer!.y).toBeGreaterThanOrEqual(0);
      expect(composer!.y + composer!.height).toBeLessThanOrEqual(height + 1);
      await capture(
        page,
        `large-${theme}-${width}${height === 540 ? '' : '-h' + height}`,
        `Responsive extension of Components 12,20,21; 200% text, ${height} CSS px height`,
      );
    }
});

for (const theme of ['light', 'dark'])
  test(`PDF ${theme}: group, members, media library, mute and real empty/error states`, async ({
    page,
    context,
    request,
  }) => {
    const group = '00000000-0000-4000-8000-000000000950';
    await request.post(fixture + '/__test__/design');
    await request.post(fixture + '/__test__/conversation-details', { data: { messages: true } });
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Student', false);
    await page.setViewportSize({ width: 375, height: 728 });
    await page.goto('/personal/messages/' + group);
    await expect(page.locator('[data-message-id]')).toHaveCount(4);
    await capture(page, `group-chat-${theme}-375`, 'Light 92 / Dark 91');
    await page.goto('/personal/messages/' + group + '/info');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('banner').getByRole('heading')).toBeVisible();
    await capture(page, `group-info-${theme}-375`, 'Light 114 / Dark 113');
    await page.goto('/personal/messages/' + group + '/members');
    await expect(page.getByRole('tablist', { name: copy.conversationLibrary })).toBeVisible();
    await capture(page, `group-members-${theme}-375`, 'Light 114 / Dark 113');
    await page.locator('[data-conversation-member-add]:visible').click();
    const picker = page.getByRole('dialog', { name: fa.v5Product.invitePerson, exact: true });
    await expect(picker).toBeVisible();
    // Existing members remain checked/disabled; new selections are an explicit test action.
    const enabled = picker.locator('input[type="checkbox"]:not(:disabled)');
    await enabled.first().check();
    await enabled.nth(1).check();
    for (const width of [834, 1440, 375]) {
      await page.setViewportSize({ width, height: width === 375 ? 728 : 1000 });
      await expect(picker).toBeVisible();
      await expect(picker.locator('input[type="checkbox"]:not(:disabled):checked')).toHaveCount(2);
    }
    await capture(page, `group-add-members-${theme}-375`, 'Light 115 / Dark 114');
    let memberWrites = 0;
    await page.route(
      '**/api/client/backend/api/v1/conversations/' + group + '/members',
      async (route) => {
        if (route.request().method() === 'POST' && ++memberWrites === 2)
          await request.post(fixture + '/__test__/fault', {
            data: { path: '/' + group + '/members', method: 'POST', status: 503 },
          });
        await route.continue();
      },
    );
    await picker.getByRole('button', { name: copy.inviteSelected(2), exact: true }).click();
    await expect(picker.getByRole('alert')).toBeVisible();
    await expect(picker.locator('input[type="checkbox"]:not(:disabled):checked')).toHaveCount(1);
    await capture(
      page,
      `group-member-error-${theme}-375`,
      'Components 10: failure keeps selection',
    );
    await picker.getByRole('button', { name: copy.inviteSelected(1), exact: true }).click();
    await expect(picker).toHaveCount(0);
    const writes = (await (await request.get(fixture + '/__test__/state')).json()).requests.filter(
      (row: { path: string; method: string }) =>
        row.method === 'POST' && row.path === '/api/v1/conversations/' + group + '/members',
    );
    expect(writes).toHaveLength(3);
    expect(writes[0].body.userId).not.toBe(writes[1].body.userId);
    expect(writes[1].body.userId).toBe(writes[2].body.userId);
    await page.goto('/personal/messages/' + group + '/media');
    await expect(page.getByText('جزوه-50.pdf', { exact: true })).toBeVisible();
    await capture(page, `group-media-${theme}-375`, 'Light 116 / Dark 115');
    await page.getByRole('tab', { name: copy.pins, exact: true }).click();
    await expect(page.locator('[data-pin-results]')).toBeVisible();
    await capture(page, `group-pins-${theme}-375`, 'Light 117 / Dark 116; no fabricated pins');
    await page.getByRole('tab', { name: copy.links, exact: true }).click();
    await capture(page, `group-links-${theme}-375`, 'Light 118 / Dark 117; actual empty result');
    await page.getByRole('banner').getByRole('link', { name: fa.common_back, exact: true }).click();
    await expect(page).toHaveURL(new RegExp('/messages/' + group + '/info$'));
    await page.getByRole('banner').getByRole('link', { name: fa.common_back, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(group + '/media[?]library=links$'));
    await expect(page.getByRole('tab', { name: copy.links, exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.goto('/personal/messages?filter=Group');
    const row = page.getByLabel(fa.text_1e0263ee04dd + ' گفتگوی آزمایشی جزئیات', { exact: true });
    await capture(
      page,
      `groups-filled-${theme}-375`,
      'Light 85 / Dark 84; actual permitted groups',
    );
    await row.click();
    await capture(page, `inbox-options-${theme}-375`, 'Light/Dark 30');
    await page.getByRole('menuitem', { name: fa.text_16be3d3db4fc, exact: true }).click();
    const mute = page.getByRole('dialog', { name: copy.muteTitle, exact: true });
    await capture(page, `mute-duration-${theme}-375`, 'Light/Dark 31');
    await mute.getByRole('button', { name: copy.mute15, exact: true }).click();
    await expect(mute).toHaveCount(0);
    await row.click();
    await expect(
      page.getByRole('menuitem', { name: fa.text_db8eb8579dae, exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await request.post(fixture + '/__test__/fault', {
      data: { path: '/api/v1/conversations/account', method: 'GET', status: 503, repeat: true },
    });
    await page.reload();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await capture(
      page,
      `inbox-error-${theme}-375`,
      'Components 10; retry keeps service error truthful',
    );
  });

for (const theme of ['light', 'dark'])
  test(`PDF ${theme}: tabs query their own data, and empty conversation and emoji are usable`, async ({
    page,
    context,
    request,
  }) => {
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Student', false);
    await page.setViewportSize({ width: 375, height: 728 });
    await page.goto('/personal/messages/' + ids.chat);
    await capture(page, `empty-chat-${theme}-375`, 'Light/Dark 38');
    const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
    await page.getByRole('button', { name: copy.emoji, exact: true }).click();
    await capture(page, `emoji-${theme}-375`, 'Light/Dark 39; existing Persian emoji set');
    await page.getByRole('menuitem').first().click();
    await expect(input).not.toBeEmpty();
    await input.fill('پیوند آزمایشی https://example.org/guide');
    await page.getByRole('button', { name: fa.text_51dd685556b8, exact: true }).click();
    await expect(page.locator('[data-message-id]')).toHaveCount(1);
    for (const tab of ['people', 'groups', 'pins', 'media', 'links'] as const) {
      await page.goto('/personal/messages?search=1&searchIn=' + tab);
      await ready(page);
      await capture(
        page,
        `search-${tab}-${theme}-375`,
        'Light/Dark ' + { people: 20, groups: 21, pins: 22, media: 23, links: 24 }[tab],
      );
      if (tab === 'links')
        await expect(
          page.locator('[data-message-search-results] a[href="https://example.org/guide"]'),
        ).toBeVisible();
    }
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.some(
        (r: { path: string; query: { hasLinks?: string } }) =>
          r.path === '/api/v1/messages/search' && r.query.hasLinks === 'true',
      ),
    ).toBe(true);
    expect(
      state.requests.some(
        (r: { path: string; query: { hasAttachment?: string } }) =>
          r.path === '/api/v1/messages/search' && r.query.hasAttachment === 'true',
      ),
    ).toBe(true);
    await page.goto('/personal/messages');
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 540 });
      await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
      const field = (await page.locator('[data-ui="search"]').first().boundingBox())!;
      const input = (await page
        .getByRole('textbox', { name: 'جستجوی گفتگوها', exact: true })
        .boundingBox())!;
      expect(input.height).toBeLessThanOrEqual(field.height);
      expect(input.y + input.height).toBeLessThanOrEqual(
        (await page.getByRole('navigation', { name: 'نوع گفتگوها', exact: true }).boundingBox())!
          .y + 1,
      );
      await capture(
        page,
        `inbox-large-${theme}-${width}`,
        'Components 11; Makan five destinations reflow 3+2',
      );
    }
  });

test('presence badges use only the acknowledged user and hide private or expired states', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  const teacher = '00000000-0000-4000-8000-000000000102';
  await request.post(fixture + '/__test__/release-154', {
    data: { presence: { [teacher]: 'Online' } },
  });
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 375, height: 728 });
  for (const theme of ['light', 'dark']) {
    await page.goto('/personal/messages');
    await page.evaluate((value) => {
      localStorage.setItem('makan-theme', value);
      window.dispatchEvent(new Event('makan-theme-changed'));
    }, theme);
    await expect(page.getByRole('img', { name: copy.online, exact: true })).toBeVisible();
    await capture(
      page,
      `presence-${theme}-375`,
      'Light/Dark 29; acknowledged Online, no inferred activity',
    );
  }
  await request.post(fixture + '/__test__/release-154', {
    data: { presence: { [teacher]: 'Hidden' } },
  });
  const presenceResponse = page.waitForResponse((r) => r.url().includes('/presence'));
  await page.reload();
  await presenceResponse;
  await ready(page);
  await expect(page.getByRole('img', { name: copy.online, exact: true })).toHaveCount(0);
  await request.post(fixture + '/__test__/release-154', {
    data: { presence: { [teacher]: { state: 'Online', expiresAtUtc: '2000-01-01T00:00:00Z' } } },
  });
  const expiredResponse = page.waitForResponse((r) => r.url().includes('/presence'));
  await page.reload();
  await expiredResponse;
  await ready(page);
  await expect(page.getByRole('img', { name: copy.online, exact: true })).toHaveCount(0);
});

test('inbox favorite, read/unread and archive commands change only after an acknowledged result', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/messages');
  const options = page.getByRole('button', {
    name: fa.text_1e0263ee04dd + ' مریم رضایی',
    exact: true,
  });
  await options.click();
  await page.getByRole('menuitem', { name: copy.favorite, exact: true }).click();
  await options.click();
  await expect(page.getByRole('menuitem', { name: copy.unfavorite, exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: copy.markRead, exact: true }).click();
  await options.click();
  await page.getByRole('menuitem', { name: copy.markUnread, exact: true }).click();
  await options.click();
  await expect(page.getByRole('menuitem', { name: copy.markRead, exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: fa.text_5c846bae22ae, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: fa.text_5c846bae22ae, exact: true });
  await expect(dialog).toBeVisible();
  await capture(
    page,
    'archive-confirm-light-390',
    'Light/Dark 34; existing archive is recoverable closure, not permanent deletion',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/' + ids.chat + '/archive', method: 'POST', status: 503 },
  });
  await dialog.getByRole('button', { name: fa.text_df535a7ee41d, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: fa.text_df535a7ee41d, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.endsWith('/mark-unread') && r.method === 'POST',
    ),
  ).toHaveLength(1);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path.endsWith('/archive') && r.method === 'POST',
    ),
  ).toHaveLength(2);
});

for (const theme of ['light', 'dark'])
  test(`group member mentions and server system events ${theme}`, async ({
    page,
    context,
    request,
  }) => {
    const group = '00000000-0000-4000-8000-000000000950';
    const teacher = '00000000-0000-4000-8000-000000000102';
    await request.post(fixture + '/__test__/design');
    await request.post(fixture + '/__test__/conversation-details', { data: { messages: true } });
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Student', false);
    await page.setViewportSize({ width: 375, height: 728 });
    await page.goto('/personal/messages/' + group);
    const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
    await input.fill('سلام @');
    await expect(
      page.getByRole('listbox', { name: copy.mentionPeople, exact: true }),
    ).toBeVisible();
    await capture(page, `group-mention-picker-${theme}-375`, 'Light 103 / Dark 102');
    await input.press('Enter');
    await expect(input).toHaveValue('سلام @test.102 ');
    await input.fill('سلام @test.102، بررسی نام‌بردن');
    await page.getByRole('button', { name: fa.text_51dd685556b8, exact: true }).click();
    const sent = page.locator('[data-message-id]').filter({ hasText: 'بررسی نام‌بردن' });
    await expect(sent).toBeVisible();
    await expect(sent.getByRole('link')).toHaveAttribute(
      'href',
      '/personal/contacts?person=' + teacher,
    );
    await capture(page, `group-mention-sent-${theme}-375`, 'Light 105 / Dark 104');
    const state = await (await request.get(fixture + '/__test__/state')).json();
    const command = state.requests.find(
      (row: { path: string; method: string }) =>
        row.path === '/api/v1/conversations/' + group + '/messages' && row.method === 'POST',
    );
    expect(command.body.mentionedUserIds).toEqual([teacher]);
    await request.post(fixture + '/__test__/conversation-details', {
      data: { systemMessages: true },
    });
    await page.reload();
    await expect(page.locator('[data-message-origin="System"]')).toHaveCount(3);
    await capture(
      page,
      `group-system-events-${theme}-375`,
      'Light 106-108 / Dark 105-107; only actual System origin is styled as a notice',
    );
  });

for (const theme of ['light', 'dark'])
  test(`empty personal inbox retains real destinations and creation ${theme}`, async ({
    page,
    context,
  }) => {
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Personal', false);
    await page.setViewportSize({ width: 375, height: 728 });
    await page.goto('/personal/messages');
    await expect(
      page.getByRole('heading', { name: copy.emptyPersonal, exact: true }),
    ).toBeVisible();
    await capture(
      page,
      `empty-inbox-${theme}-375`,
      'Light/Dark 15; unavailable source illustration uses a declared placeholder',
    );
    await page.getByRole('button', { name: fa.v71Ui.inboxMore, exact: true }).click();
    await expect(page.getByRole('menuitem')).toHaveText([
      fa.text_9f3597ff2f66,
      fa.v71Ui.archive,
      fa.v71Ui.folders,
      fa.text_feab3764e510,
    ]);
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: copy.addNewMessage, exact: true }).click();
    await expect(page.getByRole('heading', { name: copy.newMessage, exact: true })).toBeVisible();
  });

for (const theme of ['light', 'dark'])
  test(`native media tile geometry uses real fixture attachments ${theme}`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/design');
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await login(context, 'Student', false);
    await page.setViewportSize({ width: 375, height: 728 });
    await page.goto('/personal/messages/' + ids.chat);
    await page.getByRole('button', { name: fa.text_01eac8227680, exact: true }).click();
    await expect(page.getByRole('menuitem')).toHaveText([
      fa.v4Text.newPoll,
      fa.v4Text.quiz,
      fa.v4Text.newChecklist,
      fa.text_9974dd3a9f4a,
      fa.text_4cab0b40565e,
    ]);
    const attachmentMenu = (await page.getByRole('menu').boundingBox())!;
    expect(attachmentMenu.width).toBeCloseTo(172, 0);
    expect(attachmentMenu.height).toBeCloseTo(244, 0);
    expect(attachmentMenu.x).toBeGreaterThanOrEqual(0);
    expect(attachmentMenu.x + attachmentMenu.width).toBeLessThanOrEqual(375);
    expect(attachmentMenu.y + attachmentMenu.height).toBeLessThanOrEqual(
      (await page.locator('[data-ui="composer"]').boundingBox())!.y,
    );
    await capture(
      page,
      `attachment-empty-${theme}-375`,
      '172px popover extended by requested poll/quiz/checklist actions; Files/Camera retained.',
    );
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('menuitem', { name: fa.text_9974dd3a9f4a, exact: true }).click();
    await (
      await chooser
    ).setFiles([
      {
        name: 'تصویر آزمون.png',
        mimeType: 'image/png',
        buffer: await readFile('public/messaging/classic-wallpaper.png'),
      },
      {
        name: 'ویدئو آزمون.mp4',
        mimeType: 'video/mp4',
        buffer: await readFile('tests/fixtures/media-test-video.mp4'),
      },
      {
        name: 'یادداشت آزمون.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Isolated attachment fixture only.'),
      },
    ]);
    const upload = page.getByRole('dialog', { name: fa.text_4314e718c6d3, exact: true });
    await capture(
      page,
      `upload-preview-${theme}-375`,
      'Light/Dark 58,69,77; actual PNG/video/text, no PDF photo copied',
    );
    await upload.getByRole('button', { name: 'ارسال ۳ پیوست', exact: true }).click();
    await expect(upload).toHaveCount(0);
    await page.goto('/personal/messages/' + ids.chat + '/media');
    const image = page.getByRole('img', { name: 'تصویر آزمون.png', exact: true });
    await expect(image).toBeVisible();
    const tile = page.locator('[data-compact][data-visual]').first();
    const rect = (await tile.boundingBox())!;
    expect(rect.width).toBeCloseTo(109, 0);
    expect(rect.height).toBeCloseTo(132, 0);
    const searchBox = (await page.getByRole('search').boundingBox())!;
    expect(rect.y).toBeGreaterThan(searchBox.y + searchBox.height);
    expect(searchBox.height).toBeGreaterThanOrEqual(48);
    const fileName = page.locator('[data-compact]').getByText('یادداشت آزمون.txt', { exact: true });
    await expect(fileName).toBeVisible();
    expect((await fileName.boundingBox())!.width).toBeGreaterThan(150);
    const videoTile = page.locator('[data-compact][data-visual]').nth(1);
    expect((await videoTile.boundingBox())!.height).toBeCloseTo(132, 0);
    await capture(
      page,
      `media-library-${theme}-375`,
      'Light/Dark 35; 109x132 reference tiles, gap8, unavailable video thumbnail stays an honest playable cover',
    );
    await image.click();
    await capture(page, `image-viewer-${theme}-375`, 'Light/Dark 67; actual fixture image');
    await page.keyboard.press('Escape');
    await videoTile.getByRole('button').click();
    const videoViewer = page.getByRole('dialog', { name: 'ویدئو آزمون.mp4', exact: true });
    await expect(videoViewer.locator('video')).toBeVisible();
    await expect(videoViewer.locator('video')).toHaveAttribute('src', /^blob:/);
    await capture(
      page,
      `video-viewer-${theme}-375`,
      'Light/Dark 83; single-tap library video viewer and actual isolated MP4',
    );
    await page.keyboard.press('Escape');
  });
