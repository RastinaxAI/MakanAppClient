import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const id = '00000000-0000-4000-8000-000000000001';
const orderPath = '/api/admin/v1/finance/orders/' + id;
const screenshots = 'maintenance/generated/integration-e5bd3ea';
const attempt = {
  paymentAttemptId: id,
  provider: 'Zibal',
  status: 'Succeeded',
  amount: 250000,
  currency: 'Irr',
  maskedProviderReference: '***track-1234',
  maskedSettlementReference: '***ref-9876',
  createdAtUtc: '2026-11-10T10:00:00Z',
  callbackReceivedAtUtc: '2026-11-10T10:01:00Z',
  verifiedAtUtc: '2026-11-10T10:02:00Z',
  completedAtUtc: '2026-11-10T10:02:00Z',
  failureCode: null,
};
const payment = {
  paymentId: id,
  paymentAttemptId: id,
  provider: 'Zibal',
  maskedProviderReference: '***track-1234',
  maskedSettlementReference: '***ref-9876',
  amount: 250000,
  currency: 'Irr',
  paidAtUtc: '2026-11-10T10:02:00Z',
  providerPaidAtUtc: '2026-11-10T10:01:30Z',
};
const order = {
  orderId: id,
  purchaserUserId: id,
  organization: null,
  planVersionId: id,
  status: 'Paid',
  fulfillmentState: 'SubscriptionActivationPending',
  amount: 250000,
  currency: 'Irr',
  createdAtUtc: '2026-11-10T10:00:00Z',
  paidAtUtc: '2026-11-10T10:02:00Z',
  cancelledAtUtc: null,
  paymentAttempts: [attempt],
  payment,
};

async function control(body: Record<string, unknown>) {
  const response = await fetch('http://127.0.0.1:4100/__control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.ok).toBe(true);
}

async function inspect() {
  return (await (await fetch('http://127.0.0.1:4100/__inspect')).json()) as {
    events: { method: string; path: string }[];
    reads: string[];
  };
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('شماره همراه', { exact: true }).fill('09120000000');
  await page.getByRole('button', { name: 'دریافت کد ورود', exact: true }).click();
  await page.getByLabel('کد ورود', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'تأیید و ورود', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('نمای کلی');
}

async function headers(page: Page) {
  const session = await (await page.request.get('/api/session')).json();
  return { 'X-Makan-Context': session.revision, Origin: new URL(page.url()).origin };
}

function panel(page: Page, title: string) {
  return page.locator('.panel').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });
}

test.beforeEach(async () => {
  await control({ reset: true });
});

test('paid order keeps activation pending, distinct masked references, provider time and exact rial amounts', async ({
  page,
}) => {
  await control({
    financeOrder: {
      ...order,
      payment: {
        ...payment,
        merchant: 'MERCHANT_SECRET',
        providerReference: 'RAW_TRACK_SECRET',
        settlementReference: 'RAW_REF_SECRET',
      },
      paymentAttempts: [{ ...attempt, providerResponse: 'RAW_PROVIDER_BODY' }],
    },
  });
  await login(page);
  await page.goto('/admin/finance');
  const row = page.locator('tbody tr').first();
  await expect(row).toContainText('پرداخت‌شده');
  await expect(row).toContainText('در انتظار فعال‌سازی اشتراک');
  await row.getByRole('link').click();
  await expect(page.locator('main .notice[role="status"]')).toContainText('دوباره پرداخت نکنید');
  const paid = panel(page, 'پرداخت ثبت‌شده');
  await expect(paid.getByText('***track-1234', { exact: true })).toHaveAttribute('dir', 'ltr');
  await expect(paid.getByText('***ref-9876', { exact: true })).toHaveAttribute('dir', 'ltr');
  await expect(paid).toContainText('۲۵۰٬۰۰۰ ریال');
  await expect(paid.getByText('زمان پرداخت اعلام‌شده درگاه', { exact: true })).toBeVisible();
  const attempts = panel(page, 'تلاش‌های پرداخت');
  for (const label of ['زمان دریافت بازگشت از درگاه', 'زمان تأیید پرداخت', 'مرجع تسویه (پوشیده)'])
    await expect(attempts.getByText(label, { exact: true })).toBeVisible();
  const response = await page.request.get('/api/backend' + orderPath, {
    headers: await headers(page),
  });
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toMatch(/RAW_|MERCHANT_SECRET/);
  await fs.mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: screenshots + '/finance-desktop.png', fullPage: true });
  for (const width of [320, 390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: screenshots + '/finance-mobile.png', fullPage: true });
  expect(
    (await inspect()).events.filter(
      (event) => event.path.includes('/commerce/') || event.path.includes('/finance/'),
    ),
  ).toHaveLength(0);
});

test('callback awaiting verification remains unpaid and does not manufacture a settled payment', async ({
  page,
}) => {
  await control({
    financeOrder: {
      ...order,
      status: 'PendingPayment',
      fulfillmentState: 'NotStarted',
      paidAtUtc: null,
      payment: null,
      paymentAttempts: [
        {
          ...attempt,
          status: 'PendingVerification',
          verifiedAtUtc: null,
          completedAtUtc: null,
          maskedSettlementReference: null,
        },
      ],
    },
  });
  await login(page);
  await page.goto('/admin/finance/' + id);
  await expect(panel(page, 'اطلاعات سفارش')).toContainText('در انتظار پرداخت');
  await expect(panel(page, 'پرداخت ثبت‌شده')).toContainText(
    'پرداخت قطعی برای این سفارش گزارش نشده است',
  );
  await expect(
    panel(page, 'تلاش‌های پرداخت')
      .locator('.badge')
      .filter({ hasText: /^در انتظار تأیید پرداخت$/ }),
  ).toHaveClass(/badge-warning/);
  await expect(page.getByText(/پرداخت ثبت شده است؛ فعال‌سازی/)).toHaveCount(0);
  await expect(
    page.locator('main').getByRole('button', { name: /پرداخت|تأیید|بازپرداخت|تطبیق/ }),
  ).toHaveCount(0);
});

test('missing fulfillment stays unknown and a refresh preserves the historical provider', async ({
  page,
}) => {
  const { fulfillmentState: _, ...olderOrder } = order;
  await control({
    financeOrder: {
      ...olderOrder,
      payment: {
        ...payment,
        provider: 'HistoricalGateway',
        maskedSettlementReference: null,
        providerPaidAtUtc: null,
      },
      paymentAttempts: [
        {
          ...attempt,
          provider: 'HistoricalGateway',
          callbackReceivedAtUtc: null,
          maskedSettlementReference: null,
        },
      ],
    },
  });
  await login(page);
  await page.goto('/admin/finance/' + id);
  const facts = panel(page, 'اطلاعات سفارش');
  await expect(facts.getByText('وضعیت اجرای سفارش', { exact: true }).locator('..')).toContainText(
    '—',
  );
  await expect(page.getByText('اشتراک فعال شده', { exact: true })).toHaveCount(0);
  await expect(panel(page, 'پرداخت ثبت‌شده')).toContainText('HistoricalGateway');
  await control({
    financeOrder: {
      ...olderOrder,
      fulfillmentState: 'SubscriptionActivated',
      payment: { ...payment, provider: 'HistoricalGateway' },
      paymentAttempts: [{ ...attempt, provider: 'HistoricalGateway' }],
    },
  });
  await page.getByRole('button', { name: 'تازه‌سازی سفارش', exact: true }).click();
  await expect(facts.getByText('اشتراک فعال شده', { exact: true })).toHaveClass(/badge-success/);
  await expect(panel(page, 'پرداخت ثبت‌شده')).toContainText('HistoricalGateway');
  expect(
    (await inspect()).events.filter(
      (event) => event.path.includes('/finance/') || event.path.includes('/commerce/'),
    ),
  ).toHaveLength(0);
});

test('finance manage without finance read cannot read orders or reveal financial navigation', async ({
  page,
}) => {
  await control({ platformPermissions: ['platform.access', 'platform.finance.manage'] });
  await login(page);
  await expect(
    page.locator('.sidebar').getByRole('link', { name: 'مالی', exact: true }),
  ).toHaveCount(0);
  const response = await page.request.get('/api/backend' + orderPath, {
    headers: await headers(page),
  });
  expect(response.status()).toBe(403);
  expect((await inspect()).reads).not.toContain(orderPath);
  await page.goto('/admin/finance/' + id);
  await expect(page.getByRole('main').getByRole('alert')).toContainText('دسترسی محدود است');
});

test('public verification, receipts, callback, refund and manual success never reach the backend through admin BFF', async ({
  page,
}) => {
  await control({
    platformPermissions: ['platform.access', 'platform.finance.read', 'platform.finance.manage'],
  });
  await login(page);
  const requestHeaders = await headers(page);
  const cases = [
    ['GET', `/api/v1/commerce/orders/${id}/receipt`],
    ['GET', `/api/v1/commerce/personal/orders/${id}/receipt`],
    ['GET', `/api/v1/commerce/payment-attempts/${id}`],
    ['POST', `/api/v1/commerce/payment-attempts/${id}/verify`],
    ['GET', '/api/integrations/v1/commerce/payments/zibal/callback'],
    ...['mark-paid', 'refund', 'reconcile', 'verify'].map((suffix) => [
      'POST',
      orderPath + '/' + suffix,
    ]),
  ];
  for (const [method, path] of cases) {
    const response = await page.request.fetch('/api/backend' + path, {
      method,
      headers: requestHeaders,
      ...(method === 'POST' ? { data: {} } : {}),
    });
    expect(response.status(), method + ' ' + path).toBe(404);
  }
  const state = await inspect();
  for (const [, path] of cases) {
    expect(state.reads).not.toContain(path);
    expect(state.events.some((event) => event.path === path)).toBe(false);
  }
});

test('health keeps structured status while physical storage paths and free-form details stay server-side', async ({
  page,
}) => {
  await control({
    operationDependencies: [
      { name: 'Storage', status: 'Unhealthy', detail: '/srv/private/makan-test/files' },
      { name: 'StorageProduction', status: 'Healthy', detail: 'C:\\private\\production\\storage' },
    ],
  });
  await login(page);
  const response = await page.request.get('/api/backend/api/admin/v1/operations/health', {
    headers: await headers(page),
  });
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.dependencies).toEqual([
    { name: 'Storage', status: 'Unhealthy', detail: '' },
    { name: 'StorageProduction', status: 'Healthy', detail: '' },
  ]);
  expect(JSON.stringify(data)).not.toContain('private');
  await page.goto('/admin/operations');
  const health = panel(page, 'سلامت سامانه');
  await expect(health.getByText('اختلال', { exact: true })).toBeVisible();
  await expect(health.getByText(/private|production\\storage|srv\//)).toHaveCount(0);
});

test('Published Public library metadata never enables downloads against the resource capability', async ({
  page,
}) => {
  await control({ sourcePublished: true, sourceVisibility: 'Public', sourceCanDownload: false });
  await login(page);
  await page.goto('/admin/library');
  await expect(page.getByText(/دانلود عمومی کتابخانه فعال نیست/)).toBeVisible();
  await page.goto('/admin/library/' + id);
  await expect(page.getByRole('heading', { name: 'راهنمای کتابخانه', exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'دریافت فایل این بازبینی', exact: true }),
  ).toHaveCount(0);
  const response = await page.request.get(
    '/api/backend/api/v1/sources/' + id + '/content?revision=1',
    { headers: await headers(page) },
  );
  expect(response.status()).toBe(403);
  expect((await inspect()).reads).not.toContain('/api/v1/sources/' + id + '/content');
});
