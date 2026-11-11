import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v5Product, v4_more } from '../../src/content/fa';

const id = '00000000-0000-4000-8000-000000000950';
const base = '/personal/messages/' + id;

test('member media displays the returned local role, keeps authorized media available after a failed optional metadata read, and exposes no management form', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, readOnly: true },
  });
  await login(context, 'Student', false);
  await page.goto(base + '/media');
  const caption = page.getByRole('banner').locator('.grow > p');
  await expect(caption).toHaveText(v5Product.conversationMemberRoles.Member);
  const file = page.getByRole('button', { name: /جزوه-50\.pdf/ });
  await expect(file).toBeVisible();
  await captureExactState(
    page,
    ['MK-239'],
    'Active local Member; media read and optional role metadata use existing endpoints with the same context revision.',
  );
  await page.route('**/api/client/backend/api/v1/conversations/' + id, async (route) => {
    await route.fulfill({ status: 403, json: { code: 'FORBIDDEN' } });
  });
  await page.reload();
  await expect(file).toBeVisible();
  await expect(
    page.getByRole('banner').getByText(v5Product.conversationMemberRoles.Member, { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: v5Product.saveGroupInfo, exact: true }),
  ).toHaveCount(0);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) =>
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(r.method) &&
        r.path.startsWith('/api/v1/conversations/'),
    ),
  ).toHaveLength(0);
});

test('conversation creation tools show the returned participant role and keep the actual conversation context', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: { canPublish: true } },
  });
  await login(context, 'Teacher', false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [section, scenario] of [
    ['poll-new', 'MK-242'],
    ['quiz-new', 'MK-245'],
    ['checklist-new', 'MK-248'],
    ['scheduled', 'MK-252'],
  ]) {
    await page.goto(base + '/' + section);
    await expect(page.getByRole('banner').locator('.grow > p')).toHaveText(
      v5Product.conversationMemberRoles.Admin,
    );
    await expect(page.locator('.rx-context-panel h3')).toHaveText('باشگاه کتاب‌خوانی');
    await captureExactState(
      page,
      [scenario],
      'Active local Admin with explicit server canPublish; account Teacher is not used as a conversation permission.',
    );
  }
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) =>
        r.method !== 'GET' && /\/(polls|checklists|scheduled-messages)$/.test(r.path),
    ),
  ).toHaveLength(0);
});

test('capabilities for a different conversation never open a creation form or send a command', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: { canPublish: true } },
  });
  await login(context, 'Teacher', false);
  await page.route('**/api/client/backend/api/v1/conversations/' + id, async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({
      response,
      json: { ...body, conversationId: '00000000-0000-4000-8000-000000009999' },
    });
  });
  await page.goto(base + '/poll-new');
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.locator('#v4-poll')).toHaveCount(0);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/polls'),
    ),
  ).toHaveLength(0);
});

test('a delegated invitation capability uses the same frozen command after failure and never recovers a token from an existing link id', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: { canManageInvites: true } },
  });
  await login(context, 'Teacher', false);
  await page.goto(base + '/invites');
  await expect(
    page.getByRole('heading', { name: v5Product.inviteLinksTitle, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'لینک جدید', exact: true }).click();
  const form = page.locator('form.v5-native-form');
  await expect(page.locator('[data-v5-scene="MK-215"]')).toBeVisible();
  await form.getByLabel(v5Product.inviteLinkMaximumUses, { exact: true }).fill('2');
  await form.getByRole('switch').check();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/invite-links', method: 'POST', status: 503 },
  });
  await page
    .getByRole('button', { name: v5Product.createInviteLink, exact: true })
    .filter({ visible: true })
    .click();
  await expect(form.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'لینک دعوت جدید', exact: true })).toHaveCount(0);
  await page
    .getByRole('button', { name: 'تلاش مجدد', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator('[data-v5-scene="MK-216"]')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'لینک دعوت جدید', exact: true })).toBeVisible();
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'لینک جدید', exact: true }).click();
  await form.getByLabel(v5Product.inviteLinkMaximumUses, { exact: true }).fill('3');
  await page
    .getByRole('button', { name: v5Product.createInviteLink, exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator('[data-v5-scene="MK-216"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'لغو لینک', exact: true })).toHaveCount(2);
  await expect(page.getByRole('textbox', { name: 'لینک دعوت جدید', exact: true })).toHaveCount(0);
  await captureExactState(
    page,
    ['MK-216'],
    'Local Admin with explicit canManageInvites; two acknowledged fixture links. Tokens were creation-only and are absent after reload.',
  );
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const creates = calls.filter(
    (r: { method: string; path: string }) =>
      r.method === 'POST' && r.path.endsWith('/invite-links'),
  );
  expect(creates).toHaveLength(3);
  expect(creates[0].body).toEqual(creates[1].body);
  expect(creates[2].body.clientLinkId).not.toBe(creates[1].body.clientLinkId);
});
