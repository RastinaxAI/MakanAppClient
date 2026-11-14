import { reviewPath } from './review-output';
import { captureExactState } from './exact-state-capture';
import { test, expect, login, fixture, origin } from './test';
import { mkdir } from 'node:fs/promises';
import * as fa from '../../src/content/fa';
const id = '00000000-0000-4000-8000-000000000950',
  base = '/personal/messages/' + id;
test('mute is confirmed by the service and a failed change never shows false success', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Student', false);
  await page.goto(base + '/info');
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/mute', method: 'PUT', status: 503 },
  });
  await page.getByRole('button', { name: 'بی‌صدا', exact: true }).click();
  const duration = page.getByRole('dialog', { name: fa.messengerPdf.muteTitle, exact: true });
  await duration.getByRole('button', { name: fa.messengerPdf.mute15, exact: true }).click();
  await expect(duration.getByRole('alert')).toBeVisible();
  await expect(duration).toBeVisible();
  await duration.getByRole('button', { name: fa.messengerPdf.mute15, exact: true }).click();
  await expect(duration).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'فعال‌کردن صدا', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await expect(page.getByRole('button', { name: 'فعال‌کردن صدا', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'فعال‌کردن صدا', exact: true }).click();
  await expect(page.getByRole('button', { name: 'بی‌صدا', exact: true })).toBeVisible();
});
test('invite link creation retries with one command, requires approval, then can be revoked', async ({
  page,
  context,
  request,
  browser,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: { type: 'Channel' } });
  await login(context, 'Student', false);
  await page.goto(base + '/invites');
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'لینک جدید', exact: true }).click();
  const form = page.locator('form.v5-native-form');
  await form.getByLabel(fa.v5Product.inviteLinkMaximumUses, { exact: true }).fill('2');
  await form.getByRole('switch').check();
  await captureExactState(page, ['MK-215']);
  await page.getByRole('banner').getByRole('link', { name: fa.common_back, exact: true }).click();
  await expect(page.locator('[data-v5-scene="MK-216"]')).toBeVisible();
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'لینک جدید', exact: true }).click();
  await expect(form.getByLabel(fa.v5Product.inviteLinkMaximumUses, { exact: true })).toHaveValue(
    '2',
  );
  await expect(form.getByRole('switch')).toBeChecked();

  await request.post(fixture + '/__test__/fault', {
    data: { path: '/invite-links', method: 'POST', status: 503 },
  });
  await page
    .getByRole('button', { name: fa.v5Product.createInviteLink, exact: true })
    .filter({ visible: true })
    .click();
  await expect(form.getByRole('alert')).toBeVisible();
  await expect(form.getByLabel(fa.v5Product.inviteLinkMaximumUses, { exact: true })).toHaveValue(
    '2',
  );
  await expect(form.getByLabel(fa.v5Product.inviteLinkMaximumUses, { exact: true })).toBeDisabled();
  await page
    .getByRole('button', { name: 'تلاش مجدد', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator('[data-v5-scene="MK-216"]')).toBeVisible();
  const url = await page.getByLabel('لینک دعوت جدید').inputValue();
  expect(url).toContain('/personal/messages/join#token=');
  const other = await browser.newContext();
  await login(other, 'Parent', false);
  const recipient = await other.newPage();
  await recipient.goto(url);
  await expect(
    recipient.getByRole('button', { name: 'پیوستن به گفتگو', exact: true }),
  ).toBeEnabled();
  await recipient.getByRole('button', { name: 'پیوستن به گفتگو', exact: true }).click();
  await expect(recipient.getByRole('heading', { name: 'درخواست عضویت ارسال شد' })).toBeVisible();
  await expect(recipient.getByRole('link', { name: 'ورود به گفتگو', exact: true })).toHaveCount(0);
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: fa.v5Product.groupJoinRequestsTitle, exact: true })
    .click();
  await page
    .getByRole('button', { name: fa.v5Product.reviewJoinRequest, exact: true })
    .filter({ visible: true })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.locator('.v5-list').getByText('پذیرفته‌شده', { exact: true })).toBeVisible();
  await recipient.goto(base + '/info');
  await expect(
    recipient.getByRole('heading', { name: 'اطلاعات کانال', exact: true }),
  ).toBeVisible();
  await page.getByRole('banner').getByRole('button', { name: fa.v4_more, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: fa.v5Product.inviteLinksTitle, exact: true })
    .click();
  await page.getByRole('button', { name: 'لغو لینک', exact: true }).click();
  await captureExactState(page, ['MK-217']);

  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.locator('.v5-list').getByText('لغوشده', { exact: true })).toBeVisible();
  await recipient.goto(url);
  await recipient.getByRole('button', { name: 'پیوستن به گفتگو', exact: true }).click();
  await expect(recipient.getByRole('main').getByRole('alert')).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const creates = state.requests.filter(
    (r: { method: string; path: string }) =>
      r.method === 'POST' && r.path.endsWith('/invite-links'),
  );
  expect(creates).toHaveLength(2);
  expect(creates[0].body).toEqual(creates[1].body);
  await other.close();
});
test('topic draft survives errors and status changes only after server confirmation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  await login(context, 'Student', false);
  await page.goto(base + '/topics');
  await page.getByLabel('نام موضوع', { exact: true }).fill('پرسش‌های کلاس');
  await captureExactState(page, ['MK-225']);

  await request.post(fixture + '/__test__/fault', {
    data: { path: '/topics', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: 'ایجاد موضوع', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('نام موضوع', { exact: true })).toHaveValue('پرسش‌های کلاس');
  await page.getByRole('button', { name: 'تلاش مجدد', exact: true }).click();
  await expect(page.getByText('پرسش‌های کلاس', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'بستن', exact: true }).click();
  await captureExactState(page, ['MK-226']);

  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.getByRole('button', { name: 'بازکردن', exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const posts = state.requests.filter(
    (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/topics'),
  );
  expect(posts).toHaveLength(2);
  expect(posts[0].body).toEqual(posts[1].body);
});
test('non owners never see invite management and the service rejects a direct mutation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/conversation-details', { data: {} });
  const session = await login(context, 'Teacher', false);
  await page.goto(base + '/invites');
  await expect(page.getByRole('button', { name: 'لینک جدید', exact: true })).toHaveCount(0);
  const response = await context.request.post(
    origin + '/api/client/backend/api/v1/conversations/' + id + '/invite-links',
    {
      headers: { Origin: origin, 'X-Makan-Context': session.revision },
      data: {
        clientLinkId: crypto.randomUUID(),
        expiresAtUtc: new Date(Date.now() + 86400000).toISOString(),
        maximumUses: 1,
        requiresApproval: false,
      },
    },
  );
  expect(response.status()).toBe(403);
});
test('reference group and channel surfaces keep RTL, focus and touch targets in both themes at three sizes', async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(180000);
  await login(context, 'Student', false);
  await mkdir(reviewPath('output/review/telegram-details'), { recursive: true });
  for (const theme of ['light', 'dark']) {
    await page.goto('/personal/messages');
    await page.evaluate((value) => {
      localStorage.setItem('makan-theme', value);
      document.documentElement.dataset.theme = value;
    }, theme);
    for (const kind of ['Group', 'Channel']) {
      await request.post(fixture + '/__test__/conversation-details', { data: { type: kind } });
      for (const section of [
        'info',
        'edit',
        'settings',
        'members',
        'media',
        'invites',
        ...(kind === 'Group' ? ['topics'] : []),
      ]) {
        await page.goto(base + '/' + section);
        const heading = {
          info: kind === 'Channel' ? 'اطلاعات کانال' : 'اطلاعات گروه',
          edit: kind === 'Channel' ? 'ویرایش کانال' : 'ویرایش گروه',
          settings:
            kind === 'Channel'
              ? fa.v5Product.channelSettingsTitle
              : fa.v5Product.groupSettingsTitle,
          members:
            kind === 'Channel' ? fa.v5Product.channelMembersTitle : fa.v5Product.groupMembersTitle,
          media: kind === 'Channel' ? fa.v5Product.channelMediaTitle : fa.v5Product.groupMediaTitle,
          invites: fa.v5Product.inviteLinksTitle,
          topics: fa.text_0de00f83cacf,
        }[section];
        await expect(
          page.getByRole('main').getByRole('heading', { name: heading, exact: true }),
        ).toBeVisible();
        for (const [width, height] of [
          [390, 844],
          [834, 1194],
          [1440, 1000],
        ]) {
          await page.setViewportSize({ width, height });
          await page.evaluate(() => document.fonts.ready);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          expect(await page.locator('html').getAttribute('dir')).toBe('rtl');
          if (section === 'settings') {
            const layout = await page
              .getByRole('radio')
              .first()
              .evaluate((el) => {
                const title = el.closest('label')!.querySelector('strong')!.getBoundingClientRect();
                return {
                  direction: getComputedStyle(el.closest('label')!).flexDirection,
                  offset: Math.abs(el.getBoundingClientRect().top - title.top),
                };
              });
            expect(layout.direction).toBe('row');
            expect(layout.offset).toBeLessThanOrEqual(8);
          }
          await page.screenshot({
            path: reviewPath(
              `output/review/telegram-details/${kind}-${section}-${theme}-${width}.png`,
            ),
          });
        }
        if (section === 'edit') {
          if (kind === 'Group') {
            await page
              .getByRole('banner')
              .getByRole('button', { name: fa.v4_more, exact: true })
              .click();
            await page
              .getByRole('dialog')
              .getByRole('button', { name: /عکس گروه/ })
              .click();
          } else await page.getByRole('button', { name: /عکس کانال/ }).click();
          const action = page.getByLabel('انتخاب تصویر جدید', { exact: true });
          await action.focus();
          await expect(action).toBeFocused();
          const box = await action.locator('..').boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          await page.keyboard.press('Escape');
        }
      }
    }
  }
});
