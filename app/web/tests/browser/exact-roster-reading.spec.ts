import { test, expect, fixture, login, ids } from './test';
import { captureExactState } from './exact-state-capture';
import { v5Product as t, v4Text, v4_more } from '../../src/content/fa';

test('a class response from another organization cannot appear in the list or context or trigger roster reads', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', { data: { exactV5: true } });
  await login(context, 'Manager');
  await page.route(
    /\/api\/client\/backend\/api\/v1\/academic\/classes(?:\?.*)?$/,
    async (route) => {
      const response = await route.fetch();
      const rows = await response.json();
      await route.fulfill({
        response,
        json: rows.map((row: Record<string, unknown>, index: number) =>
          index === 0
            ? {
                ...row,
                title: 'اطلاعات خصوصی آموزشگاه دیگر',
                organizationId: '00000000-0000-4000-8000-000000009999',
              }
            : row,
        ),
      });
    },
  );
  await page.goto('/personal/education/classes');
  await expect(page.getByRole('main').getByRole('alert').first()).toBeVisible();
  await expect(page.getByText('اطلاعات خصوصی آموزشگاه دیگر', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-class-summary]')).toHaveCount(0);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter((row: { path: string }) =>
      /\/academic\/classes\/[^/]+\/(learners|teachers)$/.test(row.path),
    ),
  ).toHaveLength(0);
});

test('class member lists use real totals and preserve server search while the teacher view stays a distinct state', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', { data: { exactV5: true } });
  await login(context, 'Manager');
  const route = '/personal/education/classes/' + ids.class + '/members';
  await page.goto(route);
  await expect(page.getByRole('heading', { name: t.classLearners, exact: true })).toBeVisible();
  const statistics = page.locator('[data-roster-statistics]');
  await expect(statistics).toContainText('۲۴');
  await expect(statistics).toContainText('۶');
  await expect(statistics).toContainText('۳۰');
  await captureExactState(page, ['MK-98']);
  const search = page.getByRole('textbox', { name: 'جستجو در اعضای کلاس', exact: true });
  await search.fill('عبارت بی‌نتیجه');
  await page.getByRole('button', { name: 'جستجو', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'عضوی در این فهرست نیست', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(search).toHaveValue('عبارت بی‌نتیجه');
  await page.getByRole('button', { name: v4_more, exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: t.classTeachers, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /^مدرسان /, level: 1 })).toContainText(
    'ریاضی دهم',
  );
  await expect(page.locator('.v5-row').first()).toBeVisible();
  await captureExactState(page, ['MK-101']);
  await expect(page.getByRole('link', { name: t.assignTeacher, exact: true })).toBeVisible();
});

test('a failed class refresh keeps the dated cache and explicit retry restores the current list', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', { data: { exactV5: true } });
  await login(context, 'Manager');
  await page.goto('/personal/education/classes');
  await expect(page.locator('[data-class-summary][data-enrolled]')).toBeVisible();
  await page.locator('nav a[href="/personal/profile"]:visible').first().click();
  await expect(page.getByRole('heading', { name: 'پروفایل', exact: true })).toBeVisible();
  await page.waitForTimeout(16000);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/academic/classes', method: 'GET', status: 503 },
  });
  await page.goBack();
  const warning = page.locator('.v5-stale-notice');
  await expect(warning).toContainText(t.staleData);
  await expect(warning).toContainText(t.lastSuccessfulRead);
  await expect(page.locator('[data-class-summary]')).toContainText('۲۴');
  await captureExactState(page, ['MK-426']);
  await warning.getByRole('button').click();
  await expect(warning).toHaveCount(0);
  await expect(page.locator('[data-class-summary]')).toContainText('۲۴');
});

test('reading preferences apply to a real preview and persist after an explicit local save', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/settings/reading');
  await expect(page.getByRole('heading', { name: t.readingPreview, exact: true })).toBeVisible();
  await captureExactState(page, ['MK-340']);
  await page.getByRole('switch', { name: new RegExp(v4Text.largerText) }).check();
  await page.getByRole('switch', { name: new RegExp(v4Text.reduceMotion) }).check();
  for (const width of [320, 390, 430, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('button', { name: t.saveReading, exact: true }).click();
  await expect(page.getByRole('status')).toContainText(t.readingSaved);
  await page.reload();
  await expect(page.getByRole('switch', { name: new RegExp(v4Text.largerText) })).toBeChecked();
  await expect(page.getByRole('switch', { name: new RegExp(v4Text.reduceMotion) })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'large');
});

test('a denied local preference write keeps the prior setting and exposes the storage failure', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'makan-reading')
        throw new DOMException('Fixture storage denial', 'QuotaExceededError');
      return write.call(this, key, value);
    };
  });
  await login(context, 'Student', false);
  await page.goto('/personal/settings/reading');
  const large = page.getByRole('switch', { name: new RegExp(v4Text.largerText) });
  await large.click();
  await expect(large).not.toBeChecked();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.readingStorageError);
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'standard');
  await expect(page.getByText(t.readingSaved, { exact: true })).toHaveCount(0);
});
