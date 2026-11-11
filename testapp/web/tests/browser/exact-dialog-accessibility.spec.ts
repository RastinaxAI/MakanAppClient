import { test, expect, login, fixture, ids } from './test';
import * as copy from '../../src/content/fa';

test('a long dialog title at200percent keeps the primary action reachable and the focus loop inside without a mutation', async ({
  page,
  context,
  request,
}) => {
  const name = 'نام بسیار طولانی برای بررسی دسترس‌پذیری '.repeat(3).trim();
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await request.post(fixture + '/__test__/manager-case', { data: { exactV5: true } });
  await login(context, 'Manager');
  await page.route(
    '**/api/client/backend/api/v1/academic/classes/' + ids.class + '/learners?*',
    async (route) => {
      const response = await route.fetch(),
        data = await response.json();
      expect(response.ok()).toBeTruthy();
      data.items = data.items.map((row: { displayName: string }, index: number) =>
        index === 0 ? { ...row, displayName: name } : row,
      );
      await route.fulfill({ response, json: data });
    },
  );
  await page.goto('/personal/education/classes/' + ids.class + '/members');
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'large');
  const trigger = page.getByRole('button', { name: copy.text_276cb596ac92 + name, exact: true });
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await trigger.click();
    const dialog = page.getByRole('dialog', {
      name: copy.text_454d4aebcf48 + name + copy.text_e09a66220579,
      exact: true,
    });
    const primary = dialog.getByRole('button', { name: copy.text_329f02ad417c, exact: true });
    await primary.focus();
    const visible = await primary.evaluate((button) => {
      button.scrollIntoView({ block: 'center' });
      const bounds = button.getBoundingClientRect();
      let top = Math.max(0, bounds.top),
        bottom = Math.min(innerHeight, bounds.bottom);
      for (let parent = button.parentElement; parent; parent = parent.parentElement) {
        if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowY)) {
          const clip = parent.getBoundingClientRect();
          top = Math.max(top, clip.top + parent.clientTop);
          bottom = Math.min(bottom, clip.top + parent.clientTop + parent.clientHeight);
        }
      }
      return Math.max(0, bottom - top);
    });
    expect(visible).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Tab');
    await expect(
      dialog.getByRole('button', { name: copy.text_313cbecb4dd3, exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { method: string; path: string }) => row.method === 'POST' && row.path.endsWith('/end'),
    ),
  ).toHaveLength(0);
});
