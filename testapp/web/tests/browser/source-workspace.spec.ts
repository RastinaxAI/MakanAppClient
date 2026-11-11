import { test, expect, login, fixture } from './test';
import * as text from '../../src/content/fa';

const id = '00000000-0000-4000-8000-000000001500';
const detail = '/personal/resources/' + id;

test('source overview exposes separate authorized destinations and preserves the selected version', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(detail);
  await expect(page.locator('[data-source-readiness]')).toHaveCount(3);
  await expect(page.getByLabel(text.text_4aed2158ed57, { exact: true })).toHaveCount(0);
  for (const [name, view] of [
    [text.text_c861d4a9c39f, 'content'],
    [text.text_e8300534d21f, 'versions'],
    [text.text_d90a435157c3, 'visibility'],
  ]) {
    await page.getByRole('link', { name: new RegExp('^' + name) }).click();
    await expect(page).toHaveURL(new RegExp('view=' + view + '$'));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    if (view === 'content')
      await expect(
        page.getByRole('button', { name: text.text_195904575930, exact: true }),
      ).toBeVisible();
    if (view === 'visibility') {
      await expect(page.getByLabel(text.text_4aed2158ed57, { exact: true })).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: text.text_113ab0e555a2, exact: true }),
      ).toBeDisabled();
    }
    await page
      .getByRole('banner')
      .getByRole('link', { name: text.common_back, exact: true })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(new RegExp('/' + id + '$'));
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  }
  await page.getByRole('banner').getByRole('button', { name: text.v4_more, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: text.aiIntegration.knowledge, exact: true })
    .click();
  await expect(page).toHaveURL(/view=knowledge$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

for (const view of ['versions', 'visibility']) {
  test(`read-only source cannot acquire ${view} controls through a direct URL`, async ({
    page,
    context,
    request,
  }) => {
    await login(context, 'Student');
    await page.goto('/personal/resources/00000000-0000-4000-8000-000000001501?view=' + view);
    await expect(page.getByRole('main').getByRole('alert')).toContainText('دسترسی محدود است');
    await expect(page.getByLabel(text.text_3e94e3d48de6, { exact: true })).toHaveCount(0);
    const state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter(
        (r: { path: string; method: string }) => r.path.includes('/sources/') && r.method !== 'GET',
      ),
    ).toHaveLength(0);
  });
}

for (const invalid of ['owner', 'publication', 'accepted-status']) {
  test(`source save rejects a ${invalid} acknowledgment without declaring success`, async ({
    page,
    context,
  }) => {
    await login(context, 'Student', false);
    await page.goto(detail + '?view=versions');
    await page.getByLabel(text.text_4aed2158ed57, { exact: true }).fill('پیش‌نویس بازبینی‌شده');
    await page.getByLabel(text.text_3e94e3d48de6, { exact: true }).fill('آزمون پاسخ نامرتبط');
    await page.route('**/api/client/backend/api/v1/sources/' + id + '/draft', async (route) => {
      const response = await route.fetch();
      const value = await response.json();
      if (invalid === 'owner') value.ownerUserId = '00000000-0000-4000-8000-000000009999';
      if (invalid === 'publication') value.publicationStatus = 'Published';
      await route.fulfill({
        response,
        json: value,
        status: invalid === 'accepted-status' ? 202 : 200,
      });
    });
    await page.getByRole('button', { name: text.text_c7be60663550, exact: true }).click();
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(page.getByText(text.text_a1b4ad75b5a1, { exact: true })).toHaveCount(0);
    await expect(page.getByLabel(text.text_4aed2158ed57, { exact: true })).toHaveValue(
      'پیش‌نویس بازبینی‌شده',
    );
  });
}
