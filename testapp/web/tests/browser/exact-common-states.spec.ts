import { test, expect, login, fixture, origin } from './test';
import { captureExactState } from './exact-state-capture';
import * as text from '../../src/content/fa';

test('pending school classes expose one loading announcement and no fabricated records before the authorized response arrives', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student');
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/client/backend/api/v1/academic/classes', async (route) => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  const loader = page.locator('.v5-loading-cards');
  try {
    await page.goto('/personal/education/classes');
    await expect(loader).toBeVisible();
    await expect(loader).toHaveAttribute('role', 'status');
    await expect(loader.locator('.card')).toHaveCount(3);
    await expect(loader.locator('button,a,input')).toHaveCount(0);
    await captureExactState(
      page,
      ['MK-419'],
      'Student class fetch deliberately held at its existing endpoint; skeletons are aria-hidden and are not DTO records.',
      { allowLoading: true },
    );
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(loader).toHaveCount(0);
  await expect(page.locator('.v5-list .v5-row').first()).toBeVisible();
});

test('an empty authorized class list presents the invitation route and never presents a sample class', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.route('**/api/client/backend/api/v1/academic/classes', (route) =>
    route.fulfill({ status: 200, json: [] }),
  );
  await page.goto('/personal/education/classes');
  await expect(
    page.getByRole('heading', { name: text.text_da4ec17decdd, exact: true }),
  ).toBeVisible();
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(0);
  const invitation = page.getByRole('link', { name: text.text_b70ec4ed1525, exact: true });
  await expect(invitation).toHaveAttribute('href', '/personal/education/invitations');
  await captureExactState(
    page,
    ['MK-422'],
    'The existing academic classes endpoint returned an empty array for Student; no atlas records or inferred membership are inserted.',
  );
  await invitation.click();
  await expect(page).toHaveURL(/\/personal\/education\/invitations$/);
});

test('an empty account inbox and an extracurricular search with no match keep their domains and do not imply lost membership', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class');
  await login(context, 'Personal', false);
  await page.route(/\/api\/client\/backend\/api\/v1\/conversations\/account\?/, (route) =>
    route.fulfill({ status: 200, json: { items: [], nextCursor: null, hasMore: false } }),
  );
  await page.goto('/personal/messages');
  await expect(
    page.getByRole('heading', { name: text.text_b82a78a5d594, exact: true }),
  ).toBeVisible();
  await captureExactState(
    page,
    ['MK-423'],
    'Actual AccountInboxPageResult has no items; other account and class data remain separate.',
  );
  await page.goto('/personal/extracurricular');
  const search = page.getByRole('textbox', { name: text.text_74c3aeacf724, exact: true });
  await search.fill('باشگاه قدیمی');
  await expect(
    page.getByRole('heading', { name: text.text_4a9ad5d23452, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(search).toHaveValue('باشگاه قدیمی');
  await captureExactState(
    page,
    ['MK-424'],
    'No match in the authorized extracurricular response; the local search is preserved after reload and can be cleared.',
  );
  await page.getByRole('button', { name: text.text_35c84a68f506, exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(
    page.locator('.rx-body-grid a[href^="/personal/extracurricular/classes/"]').first(),
  ).toBeVisible();
});

test('expiry confirmation preserves the safe destination through Escape and an invalid OTP, then returns only after valid verification', async ({
  page,
  context,
}) => {
  await login(context, 'Personal', false);
  const target = '/personal/settings/reading?from=resume#preferences';
  await page.goto(target);
  await expect(page.getByRole('heading', { name: text.v4Text.reading, exact: true })).toBeVisible();
  expect(
    (await context.request.post('/api/client/auth/logout', { headers: { Origin: origin } })).ok(),
  ).toBe(true);
  const unauthorized = page.waitForResponse(
    (response) => response.url().endsWith('/api/client/session') && response.status() === 401,
  );
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await unauthorized;
  await expect(page).toHaveURL(/\/enter$/);
  const dialog = page.getByRole('dialog', { name: text.text_b5e55332516d, exact: true });
  await expect(dialog).toBeVisible();
  await captureExactState(
    page,
    ['MK-437'],
    'The existing provider received 401 after the isolated BFF session ended; the safe destination is preserved without exposing private content.',
  );
  await page.keyboard.press('Escape');
  const phone = page.getByLabel(text.auth_phoneLabel, { exact: true });
  await expect(phone).toBeFocused();
  expect(await page.evaluate(() => sessionStorage.getItem('makan:auth:return-to'))).toBe(target);
  await phone.fill('09120000199');
  await page.getByRole('button', { name: text.auth_requestCode, exact: true }).click();
  const code = page.getByLabel(text.auth_codeLabel, { exact: true });
  await code.fill('000000');
  await page.getByRole('button', { name: text.auth_verify, exact: true }).click();
  await expect(page).toHaveURL(/\/enter$/);
  await expect(code).toHaveValue('000000');
  expect(await page.evaluate(() => sessionStorage.getItem('makan:auth:return-to'))).toBe(target);
  await code.fill('123456');
  await page.getByRole('button', { name: text.auth_verify, exact: true }).click();
  await expect(page).toHaveURL(origin + target);
  expect(await page.evaluate(() => sessionStorage.getItem('makan:auth:return-to'))).toBeNull();
});
