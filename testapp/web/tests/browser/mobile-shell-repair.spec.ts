import { reviewPath } from './review-output';
import { test, expect, login, fixture } from './test';
import { mkdir, writeFile } from 'node:fs/promises';

const destinations = [
  ['/personal/education', 'امروز من'],
  ['/personal/extracurricular', 'کلاس‌های مستقل من'],
  ['/personal/assistant', 'دستیار یادگیری'],
  ['/personal/messages', 'پیام‌ها'],
  ['/personal/profile', 'پروفایل من'],
] as const;

for (const width of [320, 390, 430])
  for (const reading of ['normal', 'large'] as const)
    test(`five real mobile destinations at ${width}px / ${reading} keep navigation and controls reachable`, async ({
      page,
      context,
      request,
    }) => {
      await request.post(fixture + '/__test__/design');
      await request.post(fixture + '/__test__/personal-class');
      await login(context, 'Student');
      await context.addInitScript(
        (reading) => localStorage.setItem('makan-reading', reading),
        reading,
      );
      await page.setViewportSize({ width, height: 844 });
      const records = [];
      for (const [route, title] of destinations) {
        await page.goto(route);
        await expect(
          page.getByRole('main').getByRole('heading', { level: 1, name: title, exact: true }),
        ).toBeVisible();
        await expect(page.locator('.bootstrap:visible,.skeleton-wrap:visible').first()).toHaveCount(
          0,
        );
        const nav = page
          .getByRole('navigation', { name: 'ناوبری حساب شخصی', exact: true })
          .filter({ visible: true });
        await expect(nav).toBeVisible();
        await expect(nav.getByRole('link')).toHaveCount(5);
        const layout = await page.evaluate(() => {
          const visible = (e: Element) =>
            e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
          const bad = [...document.querySelectorAll('.seg > button')]
            .filter(visible)
            .flatMap((e) => {
              const r = e.getBoundingClientRect();
              return r.height < 44 || e.scrollWidth > e.clientWidth + 1
                ? [{ text: e.textContent, width: r.width, height: r.height }]
                : [];
            });
          return {
            theme: document.documentElement.dataset.theme,
            reading: document.documentElement.dataset.reading,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            badSegments: bad,
          };
        });
        expect(layout.overflow, route).toBe(false);
        expect(layout.badSegments, route).toEqual([]);
        if (reading === 'large') expect(layout.reading).toBe('large');
        const image = reviewPath(
          `output/review/assistant-repair-20261110/${route.split('/').pop()}-${width}-${reading}.png`,
        );
        await mkdir(reviewPath('output/review/assistant-repair-20261110'), { recursive: true });
        await page.screenshot({ path: image, animations: 'disabled' });
        records.push({ route, width, height: 844, image, synthetic: true, ...layout });
      }
      await writeFile(
        reviewPath(`output/review/assistant-repair-20261110/mobile-${width}-${reading}.json`),
        JSON.stringify(records, null, 2) + '\n',
      );
    });
