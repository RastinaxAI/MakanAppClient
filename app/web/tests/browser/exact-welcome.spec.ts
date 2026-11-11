import { test, expect } from './test';
import { captureExactState } from './exact-state-capture';

test('the public introduction keeps its approved logo, all reading content and the login action reachable at narrow widths, large text and reduced height', async ({
  page,
}) => {
  await page.goto('/welcome');
  const action = page.getByRole('link', { name: 'ورود یا ساخت حساب', exact: true });
  await expect(action).toHaveAttribute('href', '/enter');
  await expect(page.locator('.brand-mark')).toHaveAttribute('src', '/brand/makan-logo-v2.webp');
  await captureExactState(
    page,
    ['MK-01'],
    'Public introduction; the approved product logo is retained and no authenticated-account caption is fabricated.',
  );
  for (const theme of ['light', 'dark']) {
    for (const reading of ['standard', 'large']) {
      await page.evaluate(
        ({ theme, reading }) => {
          localStorage.setItem('makan-theme', theme);
          localStorage.setItem('makan-reading', reading);
        },
        { theme, reading },
      );
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-reading', reading);
      for (const width of [320, 360, 390, 430, 768, 834, 1024, 1194, 1280, 1440, 1920]) {
        await page.setViewportSize({
          width,
          height: width < 768 ? 844 : width < 1200 ? 1112 : 1000,
        });
        await expect(action).toBeInViewport();
        const bounds = await page.locator('.rx-content').evaluate((element) => {
          element.scrollTop = 0;
          const region = element.getBoundingClientRect();
          const first = element.querySelector('.banner-title')!.getBoundingClientRect();
          element.scrollTop = element.scrollHeight;
          const last = element.querySelector('.tagline')!.getBoundingClientRect();
          return {
            first: first.top,
            last: last.bottom,
            start: region.top,
            end: region.bottom,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        expect(bounds.overflow).toBe(false);
        expect(bounds.first).toBeGreaterThanOrEqual(bounds.start - 1);
        expect(bounds.last).toBeLessThanOrEqual(bounds.end + 1);
      }
      await page.setViewportSize({ width: 390, height: 500 });
      await expect(action).toBeInViewport();
      await page.locator('.rx-content').evaluate((element) => {
        element.scrollTop = 0;
      });
      await expect(page.locator('.banner-title')).toBeInViewport();
    }
  }
});
