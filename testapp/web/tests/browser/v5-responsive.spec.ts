import { test, expect, login } from './test';
import { mkdir, writeFile } from 'node:fs/promises';
test('V5 profile keeps its draft across the full responsive range and short heights', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/profile/edit');
  await page.getByLabel('نام نمایشی', { exact: true }).fill('پیش‌نویس واکنش‌گرا');
  await mkdir('output/review/v5', { recursive: true });
  const evidence = [];
  for (const [width, height] of [
    [320, 640],
    [360, 800],
    [390, 844],
    [430, 900],
    [768, 1112],
    [834, 1112],
    [1024, 768],
    [1194, 834],
    [1280, 900],
    [1440, 1000],
    [1920, 1080],
    [834, 640],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByLabel('نام نمایشی', { exact: true })).toHaveValue('پیش‌نویس واکنش‌گرا');
    const form = page.locator('form[data-profile-form]');
    const cols = await form.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
    );
    if (width >= 768) expect(cols).toBe(2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    const save = page.getByRole('button', { name: 'ذخیره پروفایل', exact: true });
    const box = (await save.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(height - 12);
    await page.screenshot({ path: `output/review/v5/profile-${width}-${height}.png` });
    evidence.push({ width, height, cols, overflow });
  }
  await writeFile('output/review/v5/profile-checks.json', JSON.stringify(evidence, null, 2));
});
test('V5 tablet rail and desktop sidebar use the reference widths', async ({ page, context }) => {
  await login(context, 'Student', false);
  await page.goto('/personal/settings');
  for (const width of [768, 834, 1024, 1194, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const rail = page
      .getByRole('complementary')
      .filter({ has: page.getByRole('navigation', { name: 'ناوبری حساب شخصی', exact: true }) });
    await expect(rail).toBeVisible();
    expect((await rail.boundingBox())!.width).toBe(width < 1200 ? 76 : 208);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
