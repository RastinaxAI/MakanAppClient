import { test, expect, login, fixture } from './test';
import { captureExactState } from './exact-state-capture';
import { privacySettings as t, text_b0806e32d30f } from '../../src/content/fa';

test('privacy audience selection cancels without a write, preserves all six fields after failure, and saves only with the current version', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', {
    data: { privacy: { isExplicit: true } },
  });
  await login(context, 'Teacher', false);
  await page.goto('/personal/settings/privacy');
  await expect(page.getByRole('heading', { name: t.title, exact: true })).toBeVisible();
  const form = page.locator('[data-privacy-form]');
  await expect(form.locator('.v5-row')).toHaveCount(5);
  const direct = form.getByRole('button', { name: /^پیام مستقیم/ });
  const save = page.getByRole('button', { name: t.save, exact: true });
  await expect(save).toBeDisabled();
  await direct.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: t.directDialog, exact: true });
  await expect(
    dialog.getByRole('radio', { name: t.audiences.Contacts, exact: true }),
  ).toBeChecked();
  await dialog.getByRole('radio', { name: t.audiences.Everyone, exact: true }).check();
  await captureExactState(
    page,
    ['MK-342'],
    'Audience choice is local until the outer versioned privacy form is explicitly saved.',
    {
      prepareViewport: async (current) => {
        if ((current.viewportSize()?.width ?? 0) >= 768) return;
        const primary = await dialog
          .getByRole('button', { name: t.applyDirect, exact: true })
          .boundingBox();
        const cancel = await dialog
          .getByRole('button', { name: 'انصراف', exact: true })
          .boundingBox();
        expect(primary).not.toBeNull();
        expect(cancel).not.toBeNull();
        expect(Math.abs(primary!.x - cancel!.x)).toBeLessThan(4);
        expect(Math.abs(primary!.width - cancel!.width)).toBeLessThan(4);
        expect(cancel!.y).toBeGreaterThanOrEqual(primary!.y + primary!.height + 7);
      },
    },
  );
  await page.keyboard.press('Escape');
  await expect(direct).toBeFocused();
  await expect(direct).toContainText(t.audiences.Contacts);
  await expect(save).toBeDisabled();
  let calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) => r.method === 'PUT' && r.path.endsWith('/privacy'),
    ),
  ).toHaveLength(0);
  await direct.click();
  await dialog.getByRole('radio', { name: t.audiences.Nobody, exact: true }).check();
  await dialog.getByRole('button', { name: t.applyDirect, exact: true }).click();
  await expect(direct).toContainText(t.audiences.Nobody);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/messaging/privacy', method: 'PUT', status: 503 },
  });
  await save.click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByText(text_b0806e32d30f, { exact: true })).toHaveCount(0);
  await expect(direct).toContainText(t.audiences.Nobody);
  await save.click();
  await expect(page.getByRole('status')).toContainText(text_b0806e32d30f);
  await expect(save).toBeDisabled();
  await page.reload();
  await expect(direct).toContainText(t.audiences.Nobody);
  calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const writes = calls.filter(
    (r: { method: string; path: string }) => r.method === 'PUT' && r.path.endsWith('/privacy'),
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toEqual({
    directMessagesAudience: 'Nobody',
    phoneNumberVisibilityAudience: 'Nobody',
    phoneNumberDiscoveryAudience: 'Nobody',
    groupInvitesAudience: 'Contacts',
    onlineAudience: 'Contacts',
    lastSeenAudience: 'Contacts',
    expectedVersion: '1',
  });
});

test('unblocking uses the selected account, keeps both rows after a denied mutation, and removes a row only after confirmation', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/messaging-repair', { data: { blocked: true } });
  await login(context, 'Teacher', false);
  await page.goto('/personal/settings/blocked');
  await expect(page.getByRole('heading', { name: t.blockedTitle, exact: true })).toBeVisible();
  const rows = page.locator('.rx-body-grid .v5-list .v5-row');
  await expect(rows).toHaveCount(2);
  const search = page.getByLabel(t.blockedSearch, { exact: true });
  await search.fill('حساب');
  await expect(rows).toHaveCount(1);
  await page.reload();
  await expect(search).toHaveValue('حساب');
  await expect(rows).toHaveCount(1);
  await search.fill('');
  await expect(rows).toHaveCount(2);
  const second = rows.filter({ hasText: 'حساب نمونه' });
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await captureExactState(
    page,
    ['MK-343'],
    'Two authorized block identities; selected account is the only mutation target.',
  );
  const target = '00000000-0000-4000-8000-000000000101';
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/blocks/' + target, method: 'DELETE', status: 403 },
  });
  const action = page.getByRole('button', { name: t.unblockSelected, exact: true });
  await action.click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(rows).toHaveCount(2);
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await action.click();
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('امیر نادری');
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const writes = calls.filter(
    (r: { method: string; path: string }) =>
      r.method === 'DELETE' && r.path.includes('/messaging/blocks/'),
  );
  expect(writes).toHaveLength(2);
  expect(writes.every((r: { path: string }) => r.path.endsWith('/' + target))).toBe(true);
});
