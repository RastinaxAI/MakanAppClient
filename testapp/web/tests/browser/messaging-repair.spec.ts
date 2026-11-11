import { reviewPath } from './review-output';
import { test, expect, login, fixture, origin } from './test';
import type { BrowserContext, Page } from '@playwright/test';
import {
  messagingInvitations as t,
  messagingPrivacyDefaults as privacyText,
  privacySettings as privacy,
  v4_more,
} from '@/content/fa';
const teacher = '00000000-0000-4000-8000-000000000102';
async function createThroughApi(context: BrowserContext, kind = 'groups') {
  const session = await (await context.request.get(origin + '/api/client/session')).json();
  const response = await context.request.post(
    origin + '/api/client/backend/api/v1/conversations/' + kind,
    {
      headers: { Origin: origin, 'X-Makan-Context': session.revision },
      data: {
        clientOperationId: crypto.randomUUID(),
        scope: 'Personal',
        title: 'گفتگوی پذیرش آزمایشی',
        description: null,
        initialParticipantUserIds: [teacher],
        visibility: 'Private',
      },
    },
  );
  expect(response.ok()).toBe(true);
  return response.json();
}
async function showInvitations(page: Page) {
  const panel = page.locator('[data-messaging-invitations]');
  await panel.locator('summary').click();
  await expect(panel.getByRole('button', { name: t.accept, exact: true }).first()).toBeVisible();
  return panel;
}
for (const kind of ['groups', 'channels'])
  test(`${kind}: selected recipient sees and accepts a pending invitation, then sees the conversation`, async ({
    browser,
    request,
  }) => {
    await request.post(fixture + '/__test__/messaging-repair', { data: { inviteFirst: true } });
    const a = await browser.newContext({ baseURL: origin }),
      b = await browser.newContext({ baseURL: origin });
    try {
      await login(a, 'Student', false);
      await login(b, 'Teacher', false);
      const sender = await a.newPage(),
        receiver = await b.newPage();
      await receiver.goto('/personal/messages');
      await sender.goto('/personal/messages/new?kind=' + kind);
      await sender
        .getByLabel(kind === 'groups' ? 'نام گروه' : 'نام کانال', { exact: true })
        .fill('گفتگوی نیازمند پذیرش');
      await sender.getByRole('button', { name: 'انتخاب افراد', exact: true }).click();
      await sender
        .locator('label')
        .filter({ hasText: 'test.Teacher' })
        .getByRole('checkbox')
        .check();
      await sender
        .getByRole('button', { name: kind === 'groups' ? 'ساخت گروه' : 'ساخت کانال', exact: true })
        .click();
      await expect(sender.getByLabel('نتیجه اعضای اولیه', { exact: true })).toContainText(
        t.pendingCreatorExplanation,
      );
      await expect(
        receiver.getByRole('link').filter({ hasText: 'گفتگوی نیازمند پذیرش' }),
      ).toHaveCount(0);
      const panel = await showInvitations(receiver);
      await panel.getByRole('button', { name: t.accept, exact: true }).click();
      await expect(receiver).toHaveURL(/\/personal\/messages\/[a-f0-9-]{36}$/);
      await expect(
        receiver.getByRole('heading', { name: 'گفتگوی نیازمند پذیرش', exact: true }).first(),
      ).toBeVisible();
      await expect(receiver.getByLabel('نتیجه اعضای اولیه', { exact: true })).not.toContainText(
        'هنوز عضو فعال نیستند',
      );
      await receiver.goto('/personal/messages');
      await expect(
        receiver.getByRole('link').filter({ hasText: 'گفتگوی نیازمند پذیرش' }),
      ).toBeVisible();
      const state = await (await request.get(fixture + '/__test__/state')).json();
      const creates = state.requests.filter(
        (r: { path: string; method: string }) =>
          r.path === '/api/v1/conversations/' + kind && r.method === 'POST',
      );
      expect(creates).toHaveLength(1);
      expect(creates[0].body.initialParticipantUserIds).toEqual([teacher]);
      expect(
        state.requests.filter((r: { path: string }) =>
          /\/messaging\/invitations\/[^/]+\/accept$/.test(r.path),
        ),
      ).toHaveLength(1);
    } finally {
      await a.close();
      await b.close();
    }
  });
for (const kind of ['groups', 'channels'])
  test(`${kind}: an Added member appears in the other account inbox without accepting an invitation`, async ({
    context,
    browser,
  }) => {
    await login(context, 'Student', false);
    const created = await createThroughApi(context, kind);
    const recipient = await browser.newContext({ baseURL: origin });
    try {
      await login(recipient, 'Teacher', false);
      const page = await recipient.newPage();
      await page.goto('/personal/messages');
      await expect(page.getByRole('link').filter({ hasText: created.title })).toBeVisible();
      const state = await (await recipient.request.get(origin + '/api/client/session')).json();
      const response = await recipient.request.get(
        origin + '/api/client/backend/api/v1/messaging/invitations',
        { headers: { 'X-Makan-Context': state.revision } },
      );
      expect(await response.json()).toEqual([]);
    } finally {
      await recipient.close();
    }
  });
test('declining an invitation does not add the recipient to the conversation', async ({
  context,
  browser,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', { data: { inviteFirst: true } });
  await login(context, 'Student', false);
  const created = await createThroughApi(context);
  const recipient = await browser.newContext({ baseURL: origin });
  try {
    await login(recipient, 'Teacher', false);
    const page = await recipient.newPage();
    await page.goto('/personal/messages');
    const panel = await showInvitations(page);
    await panel.getByRole('button', { name: t.decline, exact: true }).click();
    await expect(panel.getByText(t.declined, { exact: true })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: created.title })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'پیام‌ها', exact: true })).toBeVisible();
    // The reference inbox omits its optional invitation panel when no pending invite remains.
    await expect(page.locator('[data-messaging-invitations]')).toHaveCount(0);
    await expect(page.getByRole('link').filter({ hasText: created.title })).toHaveCount(0);
  } finally {
    await recipient.close();
  }
});
test('an expired invitation cannot be accepted by UI or by a different account', async ({
  context,
  browser,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { inviteFirst: true, expired: true },
  });
  const session = await login(context, 'Student', false);
  const created = await createThroughApi(context);
  const invitation = created.initialTargets[0].invitationId;
  expect(
    (
      await context.request.post(
        origin + `/api/client/backend/api/v1/messaging/invitations/${invitation}/accept`,
        { headers: { Origin: origin, 'X-Makan-Context': session.revision } },
      )
    ).status(),
  ).toBe(404);
  const recipient = await browser.newContext({ baseURL: origin });
  try {
    const state = await login(recipient, 'Teacher', false);
    const page = await recipient.newPage();
    await page.goto('/personal/messages');
    await page.locator('[data-messaging-invitations] summary').click();
    await expect(page.getByText(t.expired, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: t.accept, exact: true })).toHaveCount(0);
    expect(
      (
        await recipient.request.post(
          origin + `/api/client/backend/api/v1/messaging/invitations/${invitation}/accept`,
          { headers: { Origin: origin, 'X-Makan-Context': state.revision } },
        )
      ).status(),
    ).toBe(409);
  } finally {
    await recipient.close();
  }
});
test('a receipt for another conversation never navigates the recipient to it', async ({
  context,
  browser,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { inviteFirst: true, badReceipt: true },
  });
  await login(context, 'Student', false);
  await createThroughApi(context);
  const recipient = await browser.newContext({ baseURL: origin });
  try {
    await login(recipient, 'Teacher', false);
    const page = await recipient.newPage();
    await page.goto('/personal/messages');
    const panel = await showInvitations(page);
    await panel.getByRole('button', { name: t.accept, exact: true }).click();
    await expect(panel.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/personal\/messages$/);
  } finally {
    await recipient.close();
  }
});
test('non-explicit privacy offers Everyone but only saves the policy after an explicit submit', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { privacy: { isExplicit: false } },
  });
  await login(context, 'Teacher', false);
  await page.goto('/personal/settings/privacy');
  const form = page.locator('[data-privacy-form]');
  await expect(form.locator('.v5-row')).toHaveCount(5);
  for (const row of await form.locator('.v5-row').all())
    await expect(row).toContainText(privacy.audiences.Everyone);
  await expect(form.getByText(privacyText.unsaved, { exact: true })).toBeVisible();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === '/api/v1/messaging/privacy' && r.method === 'PUT',
    ),
  ).toHaveLength(0);
  await page.getByRole('button', { name: privacy.save, exact: true }).click();
  await expect(form.getByRole('status')).toContainText('تنظیمات');
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/messaging/privacy' && r.method === 'PUT',
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body.expectedVersion).toBe('1');
  for (const field of [
    'directMessagesAudience',
    'phoneNumberVisibilityAudience',
    'phoneNumberDiscoveryAudience',
    'groupInvitesAudience',
    'onlineAudience',
    'lastSeenAudience',
  ])
    expect(writes[0].body[field]).toBe('Everyone');
  await page.reload();
  await expect(page.getByTestId('privacy-groupInvitesAudience')).toContainText(
    privacy.audiences.Everyone,
  );
  await expect(page.getByRole('button', { name: privacy.save, exact: true })).toBeDisabled();
});
test('saved privacy choices remain intact until the user chooses and saves Everyone', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { privacy: { isExplicit: true } },
  });
  await login(context, 'Teacher', false);
  await page.goto('/personal/settings/privacy');
  await expect(page.getByTestId('privacy-groupInvitesAudience')).toContainText(
    privacy.audiences.Contacts,
  );
  await expect(page.getByTestId('privacy-phoneNumberVisibilityAudience')).toContainText(
    privacy.audiences.Nobody,
  );
  const save = page.getByRole('button', { name: privacy.save, exact: true });
  await expect(save).toBeDisabled();
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page.getByRole('button', { name: privacyText.everyone, exact: true }).click();
  await expect(page.getByTestId('privacy-groupInvitesAudience')).toContainText(
    privacy.audiences.Everyone,
  );
  await save.click();
  await expect(save).toBeDisabled();
});
test('invitation controls fit both themes and mobile tablet desktop sizes', async ({
  context,
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', { data: { inviteFirst: true } });
  await login(context, 'Student', false);
  await createThroughApi(context);
  await login(context, 'Teacher', false);
  const { mkdir } = await import('node:fs/promises');
  await mkdir(reviewPath('output/review/messaging-20261105/fixture'), { recursive: true });
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
      await page.goto('/personal/messages');
      await showInvitations(page);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
        .toBe(theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: reviewPath(
          `output/review/messaging-20261105/fixture/invitations-${theme}-${width}.png`,
        ),
      });
    }
});
