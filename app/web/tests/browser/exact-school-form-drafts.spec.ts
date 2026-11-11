import { test, expect, fixture, login, ids } from './test';
import type { Page } from '@playwright/test';
import * as copy from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
const t = copy.v5SchoolForms;
const root = '/personal/education/periods/new',
  path = '/api/v1/academic/periods';
async function fill(page: Page) {
  await page.goto(root);
  await page.getByLabel(t.periodTitle, { exact: true }).fill('پاییز ۱۴۰۵');
  await page.getByLabel(t.startDate, { exact: true }).fill('۱۴۰۵/۰۷/۰۱');
  await page.getByLabel(t.startDate, { exact: true }).blur();
  await page.getByLabel(t.endDate, { exact: true }).fill('۱۴۰۵/۰۹/۳۰');
  await page.getByLabel(t.endDate, { exact: true }).blur();
}
test('period dates retain one date-only command across responsive layout, reload and a rejected create; an invalid range never posts', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Manager');
  await fill(page);
  await page.getByLabel(t.endDate, { exact: true }).fill('۱۴۰۵/۰۶/۳۱');
  await page.getByLabel(t.endDate, { exact: true }).blur();
  await expect(page.getByLabel(t.endDate, { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: t.reviewPeriod, exact: true }).click();
  await expect(page).toHaveURL(/\/periods\/new$/);
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await page.getByLabel(t.endDate, { exact: true }).fill('۱۴۰۵/۰۹/۳۰');
  await page.getByLabel(t.endDate, { exact: true }).blur();
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1112 });
    await expect(page.getByLabel(t.startDate, { exact: true })).toHaveValue('۱ مهر ۱۴۰۵');
  }
  await captureExactState(
    page,
    ['MK-90'],
    'The real Manager date-only catalog draft; entered dates and title survive native responsive reflow.',
  );
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel(t.endDate, { exact: true })).toHaveValue('۳۰ آذر ۱۴۰۵');
  await page.getByRole('button', { name: t.reviewPeriod, exact: true }).click();
  await expect(page).toHaveURL(/\?step=review$/);
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  await page.getByRole('button', { name: copy.text_796a59104e57, exact: true }).click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.locator('.v5-summary').getByText('۱ مهر ۱۴۰۵', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: copy.text_796a59104e57, exact: true }).click();
  await expect(page.getByText(copy.text_55dd273e4ada, { exact: true })).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toEqual({
    title: 'پاییز ۱۴۰۵',
    startDate: '2026-09-23',
    endDate: '2026-12-21',
  });
});
test('a catalog create acknowledgment for another organization cannot become a success receipt', async ({
  page,
  context,
}) => {
  await login(context, 'Manager');
  await fill(page);
  await page.getByRole('button', { name: t.reviewPeriod, exact: true }).click();
  await page.route('**/api/client/backend' + path, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: { ...(await response.json()), organizationId: ids.exam },
    });
  });
  await page.getByRole('button', { name: copy.text_796a59104e57, exact: true }).click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByText(copy.text_55dd273e4ada, { exact: true })).toHaveCount(0);
  await expect(page.locator('.v5-summary').getByText('۳۰ آذر ۱۴۰۵', { exact: true })).toBeVisible();
});
