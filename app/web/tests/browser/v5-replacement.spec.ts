import { test, expect, login } from './test';
test('V5 profile uses the compact account list and real workspace chooser', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/personal/profile');
  await expect(page.locator('[data-v5-scene="MK-47"]')).toBeVisible();
  await expect(page.locator('.mk-ui')).toHaveCount(0);
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(5);
  await page.getByRole('button', { name: /فضاها و نقش‌های من/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('V5 settings fills its reading area and preserves appearance navigation', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/personal/settings');
  await expect(page.locator('[data-v5-scene="MK-338"]')).toBeVisible();
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(6);
  await expect(page.locator('.rx-context-panel')).toBeVisible();
  await page.getByRole('link', { name: /ظاهر و خوانایی/ }).click();
  await expect(page.getByRole('radio', { name: /تاریک/ })).toBeVisible();
});
test('V5 form moves its single visible action from header to bottom without losing data', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/profile/edit');
  await page.getByLabel('نام نمایشی', { exact: true }).fill('نام جدید');
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const visible = page.getByRole('button', { name: 'ذخیره پروفایل', exact: true });
    await expect(visible).toBeVisible();
    expect(await visible.count()).toBe(1);
    await expect(page.getByLabel('نام نمایشی', { exact: true })).toHaveValue('نام جدید');
    await expect(page.locator('.head-action')).toBeVisible({ visible: width >= 1200 });
    await expect(page.locator('.rx-bottom-actions')).toBeVisible({ visible: width < 1200 });
  }
});
test('V5 login keeps a readable centered form and numeric input on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/enter');
  await expect(page.locator('.rx-root.auth')).toBeVisible();
  const input = page.getByLabel('شماره همراه', { exact: true });
  await input.fill('abc۰۹۱۲34');
  await expect(input).toHaveValue('091234');
  const box = (await input.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(440);
  await expect(page.locator('[data-auth-intro]')).toHaveCount(0);
});
