import { test, expect, login, fixture } from './test';
import { captureExactState } from './exact-state-capture';
import {
  v5Product as t,
  messengerPdf as pdf,
  v4_more,
  text_9d2a510784b3,
} from '../../src/content/fa';

const base = '/personal/messages/00000000-0000-4000-8000-000000000950';

test('member search and administrator filter preserve their authorized page through reload, width and theme; Escape sends no role change', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', { data: { exactV5: true } });
  await login(context, 'Student', false);
  await page.goto(base + '/info');
  await expect(page.getByRole('heading', { name: 'باشگاه کتاب‌خوانی', exact: true })).toBeVisible();
  await page
    .getByRole('tablist', { name: pdf.conversationLibrary })
    .getByRole('tab', { name: 'اعضا', exact: true })
    .click();
  const rows = page.locator('.v5-list .v5-row');
  await expect(rows).toHaveCount(3);
  await page.getByRole('button', { name: t.conversationAdmins, exact: true }).click();
  await expect(rows).toHaveCount(2);
  await page.getByLabel(t.memberNameOrId, { exact: true }).fill('maryam.rezaei');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('مریم رضایی');
  await page.reload();
  await expect(page.getByLabel(t.memberNameOrId, { exact: true })).toHaveValue('maryam.rezaei');
  await expect(
    page.getByRole('button', { name: t.conversationAdmins, exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await captureExactState(
    page,
    ['MK-206'],
    'Authorized current-page administrator filter and username search; no new server search parameter.',
  );
  const manage = page.getByRole('button', { name: 'مدیریت مریم رضایی', exact: true });
  await manage.click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: text_9d2a510784b3, exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(manage).toBeFocused();
  await expect(page.getByLabel(t.memberNameOrId, { exact: true })).toHaveValue('maryam.rezaei');
  for (const width of [320, 390, 430, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(manage).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) =>
        ['PUT', 'DELETE'].includes(r.method) && r.path.includes('/members/'),
    ),
  ).toHaveLength(0);
  const memberReads = calls.filter(
    (r: { method: string; path: string }) =>
      r.method === 'GET' && /\/conversations\/[^/]+\/members$/.test(r.path),
  );
  expect(memberReads.length).toBeGreaterThan(0);
});

test('a channel member keeps mute failure truthful, respects a denied member read, and cannot open management fields', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, type: 'Channel', readOnly: true },
  });
  await login(context, 'Student', false);
  await page.goto(base + '/info');
  await expect(page.getByRole('heading', { name: 'اطلاعات کانال', exact: true })).toBeVisible();
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(3);
  const notification = page.getByRole('banner').getByRole('button', { name: v4_more, exact: true });
  await notification.click();
  const dialog = page.getByRole('dialog', { name: v4_more, exact: true });
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/mute', method: 'PUT', status: 503 },
  });
  await dialog.getByRole('button', { name: 'بی‌صدا', exact: true }).click();
  const duration = page.getByRole('dialog', { name: pdf.muteTitle, exact: true });
  await duration.getByRole('button', { name: pdf.mute60, exact: true }).click();
  await expect(duration.getByRole('alert')).toBeVisible();
  await expect(duration.getByRole('button', { name: pdf.mute60, exact: true })).toBeEnabled();
  await duration.getByRole('button', { name: pdf.mute60, exact: true }).click();
  await expect(duration).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'فعال‌کردن صدا', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(notification).toBeFocused();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/members', method: 'GET', status: 403 },
  });
  await page
    .getByRole('tablist', { name: pdf.conversationLibrary })
    .getByRole('tab', { name: 'اعضا', exact: true })
    .click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: t.invitePerson, exact: true })).toHaveCount(0);
  await page.goto(base + '/edit');
  await expect(page.getByLabel(t.channelEditorTitle, { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: t.saveChannelInfo, exact: true })).toHaveCount(0);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) => r.method === 'PATCH' && r.path.endsWith('/info'),
    ),
  ).toHaveLength(0);
});
