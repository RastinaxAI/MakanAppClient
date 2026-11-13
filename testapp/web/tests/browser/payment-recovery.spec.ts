import { test, expect, login, fixture } from './test';
import { paymentCopy as t } from '../../src/content/fa';
import * as copy from '../../src/content/fa';
import { mkdir, writeFile } from 'node:fs/promises';
import { reviewPath } from './review-output';
const orderId = '00000000-0000-4000-8000-000000009701',
  attemptId = '00000000-0000-4000-8000-000000009702';
const destination = `/personal/subscription?orderId=${orderId}&paymentAttemptId=${attemptId}`;
test.beforeEach(async ({ context }) => {
  await login(context, 'Personal', false);
});
test('profile opens its account payment history without loading the sales catalog or creating a payment', async ({
  page,
  request,
}) => {
  await page.goto('/personal/profile');
  await page.getByRole('link', { name: new RegExp('^' + copy.v6Ui.plansPayments) }).click();
  await page.getByRole('link', { name: new RegExp(copy.serverAlignedUi.payments) }).click();
  await expect(page).toHaveURL(/\/personal\/subscription\?view=payments$/);
  await expect(
    page.getByRole('heading', { name: copy.serverAlignedUi.payments, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: copy.serverAlignedUi.planUsage, exact: true }),
  ).toHaveAttribute('href', '/personal/subscription');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) => r.path === '/api/v1/commerce/catalog'),
  ).toHaveLength(0);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/commerce/') && r.method !== 'GET',
    ),
  ).toHaveLength(0);
});
test('return query success is ignored and Unknown recovery preserves the same attempt without creating a charge', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', { data: { outcome: 'Unknown' } });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(destination + '&success=1&status=100');
  await expect(page.getByRole('heading', { name: t.title, level: 1, exact: true })).toBeVisible();
  await expect(page.getByText(t.statuses.Unknown, { exact: true })).toBeVisible();
  await expect(page.getByText(t.paid, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: t.recover, exact: true }).click();
  await expect(page.getByText(t.verificationPending, { exact: true })).toBeVisible();
  await page.reload();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === `/api/v1/commerce/payment-attempts/${attemptId}/verify` && r.method === 'POST',
    ),
  ).toHaveLength(1);
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path.endsWith('/payments') && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await expect(page.getByRole('button', { name: t.start, exact: true })).toHaveCount(0);
});
test('settlement and delayed subscription activation remain separate, with a server receipt and focus-safe dialog', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', { data: { outcome: 'AlreadySettled' } });
  await page.goto(destination);
  await page.getByRole('button', { name: t.recover, exact: true }).click();
  await expect(
    page.getByText(t.fulfillment.SubscriptionActivationPending, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(t.fulfillment.SubscriptionActivated, { exact: true })).toHaveCount(0);
  const trigger = page.getByRole('button', { name: t.receipt, exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog').getByText('987654321', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
test('HTTP 200 amount mismatch is not a success and leaves the payment available for investigation', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', { data: { outcome: 'AmountMismatch' } });
  await page.goto(destination);
  await page.getByRole('button', { name: t.recover, exact: true }).click();
  await expect(page.getByText(t.mismatch, { exact: true })).toBeVisible();
  await expect(page.getByText(t.paid, { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: t.receipt, exact: true })).toHaveCount(0);
});
test('a response for another attempt cannot expose its link or receipt', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', {
    data: { foreignAttempt: true, status: 'PendingVerification' },
  });
  await page.goto(destination);
  await expect(page.locator('.error-state').last()).toBeVisible();
  await expect(page.getByRole('link', { name: t.openGateway, exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: t.recover, exact: true })).toHaveCount(0);
});
test('new initiation is gated by a fresh available quote and an unknown acknowledgement cannot create another charge', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', {
    data: { noAttempt: true, lostInitAck: true },
  });
  await page.goto(`/personal/subscription?orderId=${orderId}`);
  await expect(page.getByRole('button', { name: t.start, exact: true })).toBeDisabled();
  await page
    .getByRole('combobox', { name: 'پلن', exact: true })
    .selectOption('00000000-0000-4000-8000-000000000981');
  await page.getByRole('button', { name: 'دریافت برآورد هزینه', exact: true }).click();
  await page.getByRole('button', { name: t.start, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: t.start, exact: true }).click();
  await expect(page.getByRole('dialog').locator('.error-state')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: t.recover, exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path.endsWith('/payments') && r.method === 'POST',
    ),
  ).toHaveLength(1);
});
test('provider callback remains outside the authenticated client proxy', async ({ context }) => {
  expect(
    (
      await context.request.get(
        '/api/client/backend/api/integrations/v1/commerce/payments/zibal/callback?success=1',
      )
    ).status(),
  ).toBe(404);
});
test('a lost order acknowledgment is replayed after reload with its frozen body even when the catalog becomes empty', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', {
    data: { noAttempt: true, lostCreateAck: true, emptyCatalogAfterLost: true },
  });
  await page.goto('/personal/subscription?view=plans');
  await page
    .getByRole('button', { name: /^بررسی پلن / })
    .first()
    .click();
  await page
    .getByRole('combobox', { name: 'پلن', exact: true })
    .selectOption('00000000-0000-4000-8000-000000000981');
  await page.getByRole('button', { name: 'دریافت برآورد هزینه', exact: true }).click();
  await page.getByRole('button', { name: copy.text_6ff723ebc69c, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: copy.text_0c2133fae476, exact: true })
    .click();
  await expect(page.getByRole('dialog').locator('.error-state')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.reload();
  await page.getByRole('button', { name: t.retryOrder, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: copy.text_0c2133fae476, exact: true })
    .click();
  await expect(page.getByRole('region', { name: t.title, exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path === '/api/v1/commerce/personal/orders' && r.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
});

test('organization settlement is scoped to its Manager and uses the organization receipt', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Manager');
  await request.post(fixture + '/__test__/payments', {
    data: { organization: true, outcome: 'Settled' },
  });
  await page.goto(destination + '&scope=organization');
  await page.getByRole('button', { name: t.recover, exact: true }).click();
  await page.getByRole('button', { name: t.receipt, exact: true }).click();
  await expect(page.getByRole('dialog').getByText('987654321', { exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some(
      (r: { path: string }) => r.path === `/api/v1/commerce/orders/${orderId}/receipt`,
    ),
  ).toBe(true);
  expect(
    state.requests.some(
      (r: { path: string }) => r.path === `/api/v1/commerce/personal/orders/${orderId}/receipt`,
    ),
  ).toBe(false);
});
test('an ordinary account cannot read or recover an organization attempt', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', { data: { organization: true } });
  await page.goto(destination + '&scope=organization');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: t.recover, exact: true })).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.startsWith('/api/v1/commerce/payment-attempts/') && r.method === 'POST',
    ),
  ).toHaveLength(0);
});
test('a rate-limited initiation stays in the confirmation dialog and retries only the original intent on an explicit click', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', { data: { noAttempt: true } });
  await request.post(fixture + '/__test__/fault', {
    data: {
      path: `/personal/orders/${orderId}/payments`,
      method: 'POST',
      status: 429,
      code: 'PAYMENT_RATE_LIMITED',
      retryAfter: 2,
    },
  });
  await page.goto(`/personal/subscription?orderId=${orderId}`);
  await page
    .getByRole('combobox', { name: 'پلن', exact: true })
    .selectOption('00000000-0000-4000-8000-000000000981');
  await page.getByRole('button', { name: 'دریافت برآورد هزینه', exact: true }).click();
  await page.getByRole('button', { name: t.start, exact: true }).click();
  const confirm = page.getByRole('dialog').getByRole('button', { name: t.start, exact: true });
  await confirm.click();
  await expect(page.getByRole('dialog').locator('.error-state')).toBeVisible();
  await expect(confirm).toBeDisabled();
  await expect(confirm).toBeEnabled({ timeout: 6000 });
  let state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = (s: { requests: { path: string; method: string; body: unknown }[] }) =>
    s.requests.filter(
      (r) =>
        r.path === `/api/v1/commerce/personal/orders/${orderId}/payments` && r.method === 'POST',
    );
  expect(writes(state)).toHaveLength(1);
  await confirm.click();
  await expect(page.getByRole('button', { name: t.recover, exact: true })).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  expect(writes(state)).toHaveLength(2);
  expect(writes(state)[0].body).toEqual(writes(state)[1].body);
});
test('paid status and receipt stay usable at native mobile tablet desktop sizes and 200 percent text', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/payments', {
    data: {
      orderStatus: 'Paid',
      status: 'Succeeded',
      fulfillment: 'SubscriptionActivationPending',
    },
  });
  const output = reviewPath('output/review/integration-e5bd3ea');
  await mkdir(output, { recursive: true });
  const records = [];
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 834, 1440]) {
      await page.addInitScript(
        ({ theme, width }) => {
          localStorage.setItem('makan-theme', theme);
          localStorage.setItem('makan-reading', width === 320 ? 'large' : 'normal');
        },
        { theme, width },
      );
      await page.setViewportSize({
        width,
        height: width === 834 ? 1112 : width === 1440 ? 1000 : 844,
      });
      await page.goto(destination);
      const trigger = page.getByRole('button', { name: t.receipt, exact: true });
      await trigger.click();
      await expect(page.getByRole('dialog').getByText('987654321', { exact: true })).toBeVisible();
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        theme: document.documentElement.dataset.theme,
        reading: document.documentElement.dataset.reading,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      expect(geometry.overflow).toBe(false);
      const image = `${output}/receipt-${width}-${theme}.png`;
      await page.screenshot({ path: image, animations: 'disabled' });
      records.push({ ...geometry, image, synthetic: true });
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  await writeFile(output + '/receipt-results.json', JSON.stringify(records, null, 2) + '\n');
});
