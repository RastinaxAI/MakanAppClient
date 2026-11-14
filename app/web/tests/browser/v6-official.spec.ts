import { test, expect, login, fixture, ids } from './test';
import { v6Ui as t, integration80c as c, text_fe721ecda2f5 } from '../../src/content/fa';
const base = '/personal/extracurricular/classes/00000000-0000-4000-8000-000000001800';
const group = '00000000-0000-4000-8000-000000001950';
const channel = '00000000-0000-4000-8000-000000001951';
test.beforeEach(async ({ request }) => {
  await request.post(fixture + '/__test__/personal-class', {
    data: { exactV5Members: true, v6Spaces: true },
  });
});

test('local view changes only presentation, preserves its choice on resize and never enables proposed education', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Personal');
  await page.goto(base);
  await page.getByRole('button', { name: t.myClassView, exact: true }).click();
  const d = page.getByRole('dialog', { name: t.myClassView, exact: true });
  await d.getByRole('radio', { name: t.membershipView, exact: true }).check();
  await page.setViewportSize({ width: 320, height: 540 });
  await expect(d.getByRole('radio', { name: t.membershipView, exact: true })).toBeChecked();
  await expect(d.getByRole('radio', { name: new RegExp(t.teachingView) })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(new RegExp(base + '$'));
  await page.getByRole('button', { name: t.myClassView, exact: true }).click();
  await d.getByRole('radio', { name: t.membershipView, exact: true }).check();
  await d.getByRole('button', { name: t.enterClassView, exact: true }).click();
  await expect(page).toHaveURL(/view=member/);
  await expect(page.getByRole('link', { name: c.settings, exact: true })).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { method: string; path: string }) =>
        r.method !== 'GET' && r.path.startsWith('/api/v1/personal-classes/'),
    ),
  ).toHaveLength(0);
});

test('a local Teacher opens the official independent group without switching the school and loses access on revocation', async ({
  page,
  context,
  request,
}) => {
  const before = await login(context, 'Teacher');
  await page.goto(base);
  await page.getByRole('link', { name: t.enterGroup, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(group));
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  await expect(page.getByText('پیام رسمی مجاز همین کلاس مستقل', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'اطلاعات گفتگو', exact: true }).click();
  await expect(page.locator('[data-v6-official-identity]')).toContainText(t.independentTag);
  await expect(page.getByRole('link', { name: t.viewOfficialSource, exact: true })).toHaveAttribute(
    'href',
    base,
  );
  await page.goto('/personal/messages/' + group);
  const after = await (await context.request.get('/api/client/session')).json();
  expect(after.context).toEqual(before.context);
  expect(after.revision).toBe(before.revision);
  await request.post(fixture + '/__test__/personal-class-revoke');
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(0);
  await expect(page.getByText('پیام رسمی مجاز همین کلاس مستقل', { exact: true })).toHaveCount(0);
});

test('an organization Manager who is not a local member cannot enter an independent official conversation', async ({
  page,
  context,
}) => {
  await login(context, 'Manager');
  const denied = page.waitForResponse((response) =>
    response.url().endsWith('/api/v1/conversations/' + group + '/summary'),
  );
  await page.goto('/personal/messages/' + group);
  expect((await denied).status()).toBe(404);
  await expect(page.getByRole('alert').filter({ hasText: text_fe721ecda2f5 })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(0);
  await expect(page.getByText('پیام رسمی مجاز همین کلاس مستقل', { exact: true })).toHaveCount(0);
});

test('partial provisioning keeps the healthy group reachable and a duplicate ready pair never produces links', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/v6-class-spaces', {
    data: { channelState: 'RepairRequired' },
  });
  await login(context, 'Personal');
  await page.goto(base);
  await expect(page.getByRole('link', { name: t.enterGroup, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: t.enterChannel, exact: true })).toHaveCount(0);
  await request.post(fixture + '/__test__/v6-class-spaces', {
    data: { channelState: 'Ready', sameConversation: true },
  });
  await page.reload();
  await expect(page.getByRole('link', { name: t.enterGroup, exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: t.enterChannel, exact: true })).toHaveCount(0);
});

test('an ordinary local learner can read the official channel and the server rejects publishing', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.goto('/personal/messages/' + channel);
  await expect(page.getByText('پیام رسمی مجاز همین کلاس مستقل', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toHaveCount(0);
  const s = await (await context.request.get('/api/client/session')).json();
  const r = await context.request.post(
    '/api/client/backend/api/v1/conversations/' + channel + '/messages',
    {
      headers: { Origin: 'http://127.0.0.1:3132', 'X-Makan-Context': s.revision },
      data: {
        clientMessageId: crypto.randomUUID(),
        kind: 'Text',
        text: 'ارسال غیرمجاز تست',
        replyToMessageId: null,
        attachmentIds: null,
        mentionedUserIds: null,
        contactUserId: null,
        topicId: null,
        isSilent: false,
      },
    },
  );
  expect(r.status()).toBe(403);
  expect(s.context.organizationId).toBe(ids.org);
});
