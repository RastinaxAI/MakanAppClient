import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const sourceId = '00000000-0000-4000-8000-000000000001';
const healthPath = '/api/admin/v1/operations/health';
const notificationsPath = '/api/admin/v1/operations/notifications';
const jobsPath = '/api/admin/v1/operations/jobs';
const screenshots = 'maintenance/generated/integration-6f8edf8';

async function control(body: Record<string, unknown>) {
  const response = await fetch('http://127.0.0.1:4100/__control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.ok).toBe(true);
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('شماره همراه', { exact: true }).fill('09120000000');
  await page.getByRole('button', { name: 'دریافت کد ورود', exact: true }).click();
  await page.getByLabel('کد ورود', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'تأیید و ورود', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('نمای کلی');
}

test.beforeEach(async () => {
  await control({ reset: true });
});

test('health preserves dependency failures inside HTTP 200 and refreshes actual AI configuration', async ({
  page,
}) => {
  await control({
    operationDependencies: [
      { name: 'SQL', status: 'Unhealthy', detail: 'پاسخ وابستگی دریافت نشد' },
    ],
  });
  await login(page);
  await page.goto('/admin/operations');
  const panel = page.locator('.panel');
  await expect(panel.getByText('اختلال', { exact: true })).toBeVisible();
  await expect(panel.getByText('پاسخ وابستگی دریافت نشد', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('پیکربندی‌شده', { exact: true })).toHaveClass(/badge-neutral/);
  await expect(
    panel.getByText(/تأیید اجرای موفق درخواست‌های هوش مصنوعی یا بازیابی منابع نیست/),
  ).toBeVisible();
  await control({ aiIntegrationStatus: 'Unavailable', operationDependencies: [] });
  await panel.getByRole('button', { name: 'تازه‌سازی وضعیت', exact: true }).click();
  await expect(panel.getByText('پیکربندی‌شده', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('در دسترس نیست', { exact: true })).toHaveClass(/badge-danger/);
  await expect(panel.getByText('اختلال', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('سالم', { exact: true })).toHaveCount(0);
  await control({ failPath: '/operations/health', status: 503 });
  await panel.getByRole('button', { name: 'تازه‌سازی وضعیت', exact: true }).click();
  await expect(panel.getByRole('alert')).toContainText('سرویس موقتاً در دسترس نیست');
  await expect(panel.getByRole('button', { name: 'تازه‌سازی وضعیت', exact: true })).toHaveCount(0);
  await expect(panel.getByText('در دسترس نیست', { exact: true })).toHaveCount(0);
  await control({ failPath: null, status: 0 });
  await panel.getByRole('button', { name: 'دریافت دوباره', exact: true }).click();
  await expect(panel.getByText('در دسترس نیست', { exact: true })).toBeVisible();
});

test('operations and notification permissions remain independent in navigation and BFF', async ({
  page,
}) => {
  await control({ platformPermissions: ['platform.access', 'platform.notifications.read'] });
  await login(page);
  await page.goto('/admin/operations');
  const tabs = page.getByRole('navigation', { name: 'بخش‌های صفحه', exact: true });
  await expect(tabs.getByRole('link', { name: 'اعلان‌ها', exact: true })).toBeVisible();
  await expect(tabs.getByRole('link', { name: 'سلامت سرویس‌ها', exact: true })).toHaveCount(0);
  await expect(tabs.getByRole('link', { name: 'پردازش‌ها', exact: true })).toHaveCount(0);
  await expect(page.getByText(/آماده‌بودن سرویس ارسال به معنی تحویل اعلان نیست/)).toBeVisible();
  const session = await (await page.request.get('/api/session')).json();
  for (const path of [healthPath, jobsPath]) {
    const response = await page.request.get('/api/backend' + path, {
      headers: { 'X-Makan-Context': session.revision },
    });
    expect(response.status()).toBe(403);
  }
  expect(
    (
      await page.request.get('/api/backend' + notificationsPath, {
        headers: { 'X-Makan-Context': session.revision },
      })
    ).status(),
  ).toBe(200);
  const inspected = await (await fetch('http://127.0.0.1:4100/__inspect')).json();
  expect(inspected.reads).not.toContain(healthPath);
  expect(inspected.reads).not.toContain(jobsPath);
  await page.goto('/admin/operations?tab=health');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('دسترسی محدود است');
});

test('job queue age and failure counts survive the BFF and fit narrow screens', async ({
  page,
}) => {
  await control({
    jobOperations: {
      counts: [{ jobType: 'KnowledgeIngest', status: 'Failed', count: 3 }],
      oldestPendingAtUtc: null,
      queues: [
        {
          jobType: 'KnowledgeIngest',
          pendingCount: 2,
          processingCount: 1,
          failedCount: 3,
          oldestPendingAtUtc: '2026-11-10T06:00:00Z',
          oldestPendingAgeSeconds: 120,
        },
      ],
    },
  });
  await login(page);
  await page.goto('/admin/operations?tab=jobs');
  const age = page
    .getByText('عمر قدیمی‌ترین مورد در انتظار (ثانیه)', { exact: true })
    .locator('..');
  await expect(age).toContainText('۱۲۰');
  await expect(page.locator('.badge').filter({ hasText: /^ناموفق$/ })).toHaveClass(/badge-danger/);
  await expect(page.getByRole('button', { name: /تلاش مجدد|بازپردازش|پاکسازی/ })).toHaveCount(0);
  await fs.mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: screenshots + '/jobs-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    .toBe(true);
  await page.screenshot({ path: screenshots + '/jobs-mobile.png', fullPage: true });
  await control({ jobOperations: { counts: [], oldestPendingAtUtc: null } });
  await page.getByRole('button', { name: 'تازه‌سازی وضعیت', exact: true }).click();
  await expect(
    page.getByText('عمر قدیمی‌ترین مورد در انتظار (ثانیه)', { exact: true }),
  ).toHaveCount(0);
});

test('library reads independent readiness and permission and leaves null metadata unknown', async ({
  page,
}) => {
  await control({
    sourceAiReady: true,
    sourceAiReadiness: 'Ready',
    sourceCanUseForAi: false,
    sourceAiUnavailableReason: 'SOURCE_AI_NOT_ALLOWED',
  });
  await login(page);
  await page.goto('/admin/library');
  await expect(page.getByText(/استفاده هوش مصنوعی از منابع در این نسخه فعال نیست/)).toHaveCount(0);
  await page.goto('/admin/library/' + sourceId);
  const panel = page.locator('.panel').filter({
    has: page.getByRole('heading', { name: 'آمادگی استفاده هوش مصنوعی', exact: true }),
  });
  const ready = panel.getByText('منبع برای هوش مصنوعی آماده است', { exact: true }).locator('..');
  const permission = panel
    .getByText('اجازه استفاده از منبع برای هوش مصنوعی', { exact: true })
    .locator('..');
  await expect(ready).toContainText('بله');
  await expect(permission).toContainText('خیر');
  await expect(panel.getByText('SOURCE_AI_NOT_ALLOWED', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /فعال‌سازی هوش|ایندکس|پاکسازی|RAG/ })).toHaveCount(
    0,
  );
  await fs.mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: screenshots + '/library-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    .toBe(true);
  await page.screenshot({ path: screenshots + '/library-mobile.png', fullPage: true });
  await control({
    sourceAiReady: false,
    sourceAiReadiness: null,
    sourceAiUnavailableReason: null,
  });
  await page.getByRole('button', { name: 'به‌روزرسانی منبع', exact: true }).click();
  await expect(ready).toContainText('خیر');
  await expect(panel.getByText('SOURCE_AI_NOT_ALLOWED', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('آماده', { exact: true })).toHaveCount(0);
  await expect(
    panel.getByText('وضعیت آمادگی هوش مصنوعی', { exact: true }).locator('..'),
  ).toContainText('—');
});
