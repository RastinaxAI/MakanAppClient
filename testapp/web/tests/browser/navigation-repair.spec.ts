import { test, expect, login, fixture, origin } from './test';
import * as fa from '../../src/content/fa';
import {
  v7Ui,
  v4_more,
  unsavedNavigation,
  text_69c1e5b1fe20,
  text_8e87c1832a1e,
} from '../../src/content/fa';
import { chooseAssistantPayer } from './assistant-controls';
import type { Page } from '@playwright/test';
const sourceId = '00000000-0000-4000-8000-000000001500';
const back = (page: Page) =>
  page.locator('a[aria-label="بازگشت"]:visible,button[aria-label="بازگشت"]:visible').first();
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/design');
});

test('Latin contact name and handle share the right edge; phone and OTP values stay centered', async ({
  page,
  context,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/enter');
  await page.getByRole('textbox', { name: 'شماره همراه', exact: true }).fill('۰۹۱۲۰۰۰۰۱۰۱');
  await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
  const otp = page.getByRole('textbox', { name: 'کد ورود', exact: true });
  await otp.fill('۱۲۳۴۵۶');
  await expect(otp).toHaveValue('123456');
  await expect(otp).toHaveCSS('text-align', 'center');
  await expect(otp).toHaveAttribute('autocomplete', 'one-time-code');
  await page.getByRole('button', { name: 'تأیید و ادامه', exact: true }).click();
  await page.waitForURL('**/personal/workspaces');
  const session = await (await context.request.get('/api/client/session')).json();
  const receipt = await context.request.post(origin + '/api/client/backend/api/v1/contacts', {
    headers: { Origin: origin, 'X-Makan-Context': session.revision },
    data: {
      contactUserId: '00000000-0000-4000-8000-000000000102',
      savedName: 'Development Teacher',
    },
  });
  expect(receipt.ok()).toBe(true);
  await page.goto('/personal/messages/new?kind=direct');
  const name = page.getByText('Development Teacher', { exact: true });
  await expect(name).toBeVisible();
  await expect(name).toHaveCSS('text-align', 'right');
  const edges = await name.evaluate((el) => {
    const box = (node: Node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return range.getBoundingClientRect().right;
    };
    return { name: box(el), handle: box(el.parentElement!.querySelector('small')!) };
  });
  expect(Math.abs(edges.name - edges.handle)).toBeLessThan(2);
  await noOverflow(page);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.includes('/auth/otp/challenges') && r.method === 'POST',
    ),
  ).toHaveLength(1);
});

test('back uses the exact previous in-app page after reload, then supports native forward without a return loop', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  await page.goto('/personal/profile?origin=exact#profile-position');
  const start = page.url();
  await page.locator('a[href="/personal/settings"]:visible').first().click();
  await page.locator('a[href="/personal/settings/privacy"]:visible').first().click();
  await expect(page).toHaveURL(/\/personal\/settings\/privacy$/);
  await page.reload();
  await expect(back(page)).toHaveAttribute('href', '/personal/settings');
  await back(page).click();
  await expect(page).toHaveURL(/\/personal\/settings$/);
  await expect(back(page)).toHaveAttribute(
    'href',
    new URL(start).pathname + new URL(start).search + new URL(start).hash,
  );
  await back(page).click();
  await expect(page).toHaveURL(start);
  await page.goForward();
  await expect(page).toHaveURL(/\/personal\/settings$/);
  await expect(back(page)).toHaveAttribute(
    'href',
    new URL(start).pathname + new URL(start).search + new URL(start).hash,
  );
});

test('a fresh deep link has a safe semantic fallback and never follows outside browser history', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  await page.goto('about:blank');
  await page.goto('/personal/settings/privacy');
  await expect(back(page)).toHaveAttribute('href', '/personal/settings');
  await back(page).click();
  await expect(page).toHaveURL(origin + '/personal/settings');
});

test('contextual back preserves the unsaved form guard and the real origin', async ({
  page,
  context,
}) => {
  await login(context, 'Teacher', false);
  await page.goto('/personal/profile?from=review');
  const start = page.url();
  await page.locator('a[href="/personal/profile/edit"]:visible').first().click();
  await page.getByLabel(text_69c1e5b1fe20, { exact: true }).fill('نام ویرایش‌نشده');
  await back(page).click();
  const dialog = page.getByRole('dialog', { name: unsavedNavigation.title, exact: true });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('button', { name: unsavedNavigation.continueEditing, exact: true })
    .click();
  await expect(page.getByLabel(text_69c1e5b1fe20, { exact: true })).toHaveValue('نام ویرایش‌نشده');
  await back(page).click();
  await dialog
    .getByRole('button', { name: unsavedNavigation.leaveWithoutSaving, exact: true })
    .click();
  await expect(page).toHaveURL(start);
});

test('independent class tabs keep one header and URL, preserve request filters and return from the real formation form', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: { v6Spaces: true } });
  await login(context, 'Teacher', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/extracurricular');
  const title = page.getByRole('heading', { level: 1, name: 'فوق‌برنامه', exact: true });
  await expect(title).toBeVisible();
  await expect(
    page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }),
  ).toHaveCount(0);
  await page.getByRole('tab', { name: 'درخواست‌ها', exact: true }).click();
  expect(new URL(page.url()).pathname).toBe('/personal/extracurricular');
  await expect(page.getByRole('tabpanel')).toBeVisible();
  await expect(title).toBeVisible();
  await page.getByRole('tabpanel').getByRole('combobox').selectOption('NeedsChanges');
  await page.getByRole('tab', { name: 'دعوت‌ها', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'دعوت‌ها', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'درخواست‌ها', exact: true }).click();
  await expect(page.getByRole('tabpanel').getByRole('combobox')).toHaveValue('NeedsChanges');
  await page.getByRole('tabpanel').locator('a[href*="/requests/new"]').click();
  await expect(page).toHaveURL(/\/requests\/new/);
  await back(page).click();
  await expect(page).toHaveURL(/\/personal\/extracurricular\?tab=requests$/);
  await expect(page.getByRole('tabpanel').getByRole('combobox')).toHaveValue('NeedsChanges');
  await page.getByRole('tab', { name: 'درخواست‌ها', exact: true }).press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'دعوت‌ها', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await noOverflow(page);
});

for (const route of ['requests', 'invitations'])
  test(`legacy ${route} links open the canonical local tab`, async ({ page, context }) => {
    await login(context, 'Teacher', false);
    await page.goto('/personal/extracurricular/' + route);
    await expect(page).toHaveURL('/personal/extracurricular?tab=' + route);
    await expect(page.getByRole('tab', { selected: true })).toHaveText(
      route === 'requests' ? 'درخواست‌ها' : 'دعوت‌ها',
    );
  });

test('assistant tabs change inline, preserve a draft, show real sources and the existing authorized output tools', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await request.post(fixture + '/__test__/source-ai-ready', { data: { sourceId } });
  await login(context, 'Teacher', false);
  await page.goto('/personal/assistant?view=chat');
  const input = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await input.fill('پیش‌نویس فارسی Latin 2026');
  await expect(page.getByRole('banner').locator('a[href="/personal/notifications"]')).toHaveCount(
    0,
  );
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [834, 1112],
    [1024, 768],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('tab', { name: v7Ui.sources, exact: true }).click();
    expect(new URL(page.url()).pathname).toBe('/personal/assistant');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-assistant-resources]')).toBeVisible();
    await expect(page.getByRole('banner')).toHaveCount(1);
    await page.getByRole('tab', { name: v7Ui.outputs, exact: true }).click();
    await expect(
      page
        .locator('#assistant-panel-outputs')
        .getByRole('tablist', { name: fa.aiIntegration.tools, exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.getByRole('tab', { name: v7Ui.chat, exact: true }).click();
    await expect(input).toHaveValue('پیش‌نویس فارسی Latin 2026');
    await noOverflow(page);
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/ai/') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('a source opened from the assistant returns to that exact workspace tab after refresh', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await request.post(fixture + '/__test__/source-ai-ready', { data: { sourceId } });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant?view=chat');
  await page.getByRole('tab', { name: v7Ui.sources, exact: true }).click();
  const start = page.url();
  await page
    .locator(`[data-assistant-resources] a[href="/personal/resources/${sourceId}"]`)
    .click();
  await expect(page).toHaveURL(new RegExp('/personal/resources/' + sourceId + '$'));
  await page.reload();
  await expect(back(page)).toHaveAttribute('href', new URL(start).pathname + new URL(start).search);
  await back(page).click();
  await expect(page).toHaveURL(start);
  await expect(page.getByRole('tab', { name: v7Ui.sources, selected: true })).toBeVisible();
});

test('switching assistant tabs during a response retains the pending operation and receives it once', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant?view=chat');
  await chooseAssistantPayer(page, 'Individual');
  await page
    .getByRole('textbox', { name: 'سؤال از دستیار', exact: true })
    .fill('پرسش هم‌زمان با تغییر تب');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/ai/chat', method: 'POST', delay: 1200 },
  });
  const send = page.waitForRequest(
    (r) => r.url().endsWith('/api/v1/ai/chat') && r.method() === 'POST',
  );
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await send;
  await page.getByRole('tab', { name: v7Ui.sources, exact: true }).click();
  await expect(page.locator('[data-assistant-resources]')).toBeVisible();
  await page.waitForTimeout(1400);
  await page.getByRole('tab', { name: v7Ui.chat, exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/ai/chat' && r.method === 'POST',
    ),
  ).toHaveLength(1);
});

for (const role of ['Student', 'Teacher', 'Parent', 'Manager'])
  test(`school header has no overflow menu and keeps real navigation for ${role}`, async ({
    page,
    context,
  }) => {
    await login(context, role);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/personal/education');
    await expect(
      page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('banner').getByRole('button', { name: 'بخش‌های آموزشگاه', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'بخش‌های آموزشگاه', exact: true }),
    ).toHaveCount(0);
    const nav = page.getByRole('navigation', { name: v7Ui.quickAccess, exact: true });
    await expect(nav).toBeVisible();
    await expect(nav.locator('a[href="/personal/education/invitations"]')).toBeVisible();
    await expect(page.getByRole('link', { name: text_8e87c1832a1e, exact: true })).toBeVisible();
    await noOverflow(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
    const boxes = await nav.evaluate((element) =>
      [...element.children].map((child) => {
        const box = child.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      }),
    );
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++)
        expect(
          boxes[i].right <= boxes[j].left + 1 ||
            boxes[j].right <= boxes[i].left + 1 ||
            boxes[i].bottom <= boxes[j].top + 1 ||
            boxes[j].bottom <= boxes[i].top + 1,
        ).toBe(true);
    const invitations = nav.locator('a[href="/personal/education/invitations"]');
    await invitations.scrollIntoViewIfNeeded();
    await expect(invitations).toBeInViewport();
    await noOverflow(page);
  });

// Current workflow: menus live with their target and tab changes retain one page shell.
test('assistant tabs retain header geometry, bottom navigation, chosen sources and composer focus at mobile and desktop sizes', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await request.post(fixture + '/__test__/source-ai-ready', { data: { sourceId } });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant?view=chat');
  const input = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await input.fill('متن محفوظ میان تب‌ها Latin 2026');
  for (const width of [320, 390, 768, 834, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const initial = await page
      .getByRole('tablist', { name: v7Ui.assistantSections, exact: true })
      .boundingBox();
    for (const label of ['منابع', 'خروجی‌ها', 'گفتگو']) {
      await page.getByRole('tab', { name: label, exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const box = (await page
        .getByRole('tablist', { name: v7Ui.assistantSections, exact: true })
        .boundingBox())!;
      expect(Math.abs(box.x - initial!.x)).toBeLessThan(2);
      expect(Math.abs(box.y - initial!.y)).toBeLessThan(2);
      expect(Math.abs(box.width - initial!.width)).toBeLessThan(2);
      if (width < 768)
        await expect(
          page.locator('[data-app-navigation][data-navigation-presentation="dock"]'),
        ).toBeVisible();
      if (label === 'منابع') {
        const selected = page.getByRole('checkbox', {
          name: 'انتخاب منبع واقعی منبع شخصی آزمایشی',
          exact: true,
        });
        await selected.check();
        await expect(selected).toBeChecked();
      }
      await noOverflow(page);
    }
    await expect(input).toHaveValue('متن محفوظ میان تب‌ها Latin 2026');
    await input.focus();
    if (width < 768)
      await expect(
        page.locator('[data-app-navigation][data-navigation-presentation="dock"]'),
      ).toBeVisible();
    await expect(input).toBeInViewport();
  }
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/ai/') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('inbox menu shares the time row without covering its text; message menus face the center outside both bubbles', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  for (const width of [320, 390, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/personal/messages?list=1');
    const row = page.locator('[data-inbox-row]').first();
    const time = row.locator('[data-inbox-time] time'),
      menu = row.getByRole('button');
    await expect(time).toBeVisible();
    const a = (await time.boundingBox())!,
      b = (await menu.boundingBox())!;
    expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(2);
    expect(b.x + b.width <= a.x + 1 || a.x + a.width <= b.x + 1).toBe(true);
    expect(b.width).toBeGreaterThanOrEqual(44);
    await menu.click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await page.goto('/personal/messages/00000000-0000-4000-8000-000000000009');
    for (const direction of ['incoming', 'outgoing']) {
      const message = page.locator(`[data-message-direction="${direction}"]`).first();
      const content = message.locator('[class*="messageContent"]').first(),
        options = message.getByRole('button', { name: /^گزینه‌های پیام / });
      await expect(options).toBeVisible();
      const bubble = (await content.boundingBox())!,
        control = (await options.boundingBox())!;
      const room = (await page.locator('[data-message-room]').boundingBox())!;
      if (bubble.x + bubble.width / 2 > room.x + room.width / 2)
        expect(control.x + control.width).toBeLessThanOrEqual(bubble.x + 1);
      else expect(control.x).toBeGreaterThanOrEqual(bubble.x + bubble.width - 1);
      await options.click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(options).toBeFocused();
    }
    await noOverflow(page);
  }
});

test('conversation menu contains information and personal history actions while creation tools live under plus', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/messages/00000000-0000-4000-8000-000000000009');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های گفتگو', exact: true })
    .click();
  for (const name of ['اطلاعات گفتگو', 'پاک کردن پیام‌ها', 'حذف چت'])
    await expect(page.getByRole('menuitem', { name, exact: true })).toBeVisible();
  for (const name of ['نظرسنجی تازه', 'پرسش کوتاه', 'چک‌لیست تازه', 'پیام‌های زمان‌بندی'])
    await expect(page.getByRole('menuitem', { name, exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: fa.text_01eac8227680, exact: true }).click();
  for (const name of [fa.v4Text.newPoll, fa.v4Text.quiz, fa.v4Text.newChecklist])
    await expect(page.getByRole('menuitem', { name, exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: fa.v4Text.newPoll, exact: true }).click();
  await expect(page).toHaveURL(/\/poll-new$/);
  await expect(page.getByLabel(fa.v4Text.question, { exact: true })).toBeVisible();
});

for (const activation of ['right-click', 'hold', 'keyboard'])
  test(`send ${activation} exposes scheduling without sending; its form receives the private draft`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/rich-messaging', {
      data: { exactV5: true, adminCapabilities: { canPublish: true, canManageMessages: true } },
    });
    await login(context, 'Teacher', false);
    const base = '/personal/messages/00000000-0000-4000-8000-000000000950';
    await page.goto(base);
    const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true });
    await input.fill('متن زمان‌دار حفظ‌شده Latin');
    const send = page.getByRole('button', { name: fa.text_51dd685556b8, exact: true });
    if (activation === 'right-click') await send.click({ button: 'right' });
    else if (activation === 'keyboard') {
      await send.focus();
      await send.press('ArrowDown');
    } else {
      const box = (await send.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.mouse.up();
    }
    await expect(
      page.getByRole('menuitem', { name: fa.v4Text.schedule, exact: true }),
    ).toBeVisible();
    let calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
    expect(
      calls.filter(
        (r: { path: string; method: string }) =>
          r.method === 'POST' && r.path.endsWith('/messages'),
      ),
    ).toHaveLength(0);
    await page.getByRole('menuitem', { name: fa.v4Text.schedule, exact: true }).click();
    await expect(page).toHaveURL(/\/scheduled\?compose=1$/);
    await expect(page.getByLabel(fa.v4Text.text, { exact: true })).toHaveValue(
      'متن زمان‌دار حفظ‌شده Latin',
    );
    calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
    expect(
      calls.filter(
        (r: { path: string; method: string }) =>
          r.method === 'POST' && r.path.endsWith('/scheduled-messages'),
      ),
    ).toHaveLength(0);
  });

test('a normal click and Enter submit the composer once each and closing the held menu never submits', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/messages/00000000-0000-4000-8000-000000000009');
  const input = page.getByRole('textbox', { name: fa.text_8b2fcc6817d9, exact: true }),
    send = page.getByRole('button', { name: fa.text_51dd685556b8, exact: true });
  await input.fill('ارسال با کلیک');
  await send.click();
  await expect(input).toHaveValue('');
  await input.fill('ارسال با صفحه‌کلید');
  await send.focus();
  await send.press('Enter');
  await expect(input).toHaveValue('');
  await input.fill('این فقط پیش‌نویس است');
  await send.click({ button: 'right' });
  await page.keyboard.press('Escape');
  await expect(input).toHaveValue('این فقط پیش‌نویس است');
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { path: string; method: string }) => r.method === 'POST' && r.path.endsWith('/messages'),
    ),
  ).toHaveLength(2);
});

test('clear history requires confirmation, retains failed history and only hides the current account after a valid retry', async ({
  page,
  context,
  request,
  browser,
}) => {
  await login(context, 'Student', false);
  const base = '/personal/messages/00000000-0000-4000-8000-000000000009';
  await page.goto(base);
  await expect(page.locator('[data-message-id]')).toHaveCount(4);
  const options = page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های گفتگو', exact: true });
  await options.click();
  await page
    .getByRole('menuitem', { name: fa.messagingWorkflow.clearMessages, exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: fa.messagingWorkflow.clearMessages,
    exact: true,
  });
  await dialog.getByRole('button', { name: fa.text_fa7af603d430, exact: true }).click();
  await expect(page.locator('[data-message-id]')).toHaveCount(4);
  await options.click();
  await page
    .getByRole('menuitem', { name: fa.messagingWorkflow.clearMessages, exact: true })
    .click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/clear-history', method: 'POST', status: 503 },
  });
  await dialog
    .getByRole('button', { name: fa.messagingWorkflow.clearMessages, exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(page.locator('[data-message-id]')).toHaveCount(4);
  await dialog
    .getByRole('button', { name: fa.messagingWorkflow.clearMessages, exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-message-id]')).toHaveCount(0);
  const other = await browser.newContext();
  try {
    await login(other, 'Teacher', false);
    const p = await other.newPage();
    await p.goto(origin + base);
    await expect(p.locator('[data-message-id]')).toHaveCount(4);
  } finally {
    await other.close();
  }
});

test('delete chat explains clear plus archive, retries a failed archive without clearing twice and remains recoverable', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/messages/00000000-0000-4000-8000-000000000009');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'گزینه‌های گفتگو', exact: true })
    .click();
  await page.getByRole('menuitem', { name: fa.messagingWorkflow.deleteChat, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: fa.messagingWorkflow.deleteChat, exact: true });
  await expect(dialog).toContainText(fa.messagingWorkflow.deleteHint);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/archive', method: 'POST', status: 503 },
  });
  await dialog
    .getByRole('button', { name: fa.messagingWorkflow.deleteConfirm, exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toContainText(fa.messagingWorkflow.archivePending);
  await dialog
    .getByRole('button', { name: fa.messagingWorkflow.deleteConfirm, exact: true })
    .click();
  await expect(page).toHaveURL(/\/personal\/messages\?list=1$/);
  await expect(page.locator('[data-inbox-row]')).toHaveCount(0);
  await page.goto('/personal/messages?filter=Archived&list=1');
  await expect(page.locator('[data-inbox-row]')).toHaveCount(1);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { path: string; method: string }) =>
        r.method === 'POST' && r.path.endsWith('/clear-history'),
    ),
  ).toHaveLength(1);
  expect(
    calls.filter(
      (r: { path: string; method: string }) => r.method === 'POST' && r.path.endsWith('/archive'),
    ),
  ).toHaveLength(2);
});

for (const state of ['Online', 'Offline', 'Hidden'])
  test(`header presence ${state} uses only the current published identity and exact server time`, async ({
    page,
    context,
    request,
  }) => {
    const at = '2026-11-12T10:17:00Z';
    await request.post(fixture + '/__test__/release-154', {
      data: { presence: { '00000000-0000-4000-8000-000000000102': { state, lastSeenAtUtc: at } } },
    });
    await login(context, 'Student', false);
    await page.goto('/personal/messages/00000000-0000-4000-8000-000000000009');
    const identity = page.locator('[data-chat-identity]');
    await expect(identity.getByRole('heading', { level: 1 })).toHaveCSS('text-align', 'right');
    if (state === 'Hidden') {
      await expect(identity.locator('[data-presence-state="Hidden"]')).toHaveCount(0);
      await expect(identity.locator('time')).toHaveCount(0);
    } else if (state === 'Online')
      await expect(identity.getByRole('status')).toHaveText(fa.messengerPdf.online);
    else {
      await expect(identity.locator('time')).toHaveAttribute('datetime', at);
      await expect(identity.getByRole('status')).toContainText(fa.messagingWorkflow.lastSeen);
    }
  });

test('text creation tools stay available when media permission is unknown, while uploads remain disabled', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: { canPublish: true, canManageMessages: true } },
  });
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/me/restriction', method: 'GET', status: 503, repeat: true },
  });
  await login(context, 'Teacher', false);
  await page.goto('/personal/messages/00000000-0000-4000-8000-000000000950');
  const plus = page.getByRole('button', { name: fa.text_01eac8227680, exact: true });
  await expect(plus).toBeEnabled();
  await plus.click();
  await expect(
    page.getByRole('menuitem', { name: fa.v4Text.newPoll, exact: true }),
  ).not.toHaveAttribute('aria-disabled', 'true');
  await expect(
    page.getByRole('menuitem', { name: fa.text_9974dd3a9f4a, exact: true }),
  ).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('menuitem', { name: fa.v4Text.newPoll, exact: true }).click();
  await expect(page).toHaveURL(/\/poll-new$/);
});
