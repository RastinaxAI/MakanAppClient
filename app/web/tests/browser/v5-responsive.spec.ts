import { reviewPath } from './review-output';
import { test, expect, login, fixture } from './test';
import { mkdir, writeFile } from 'node:fs/promises';
import * as copy from '../../src/content/fa';
test('V5 profile keeps its draft across the full responsive range and short heights', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/profile/edit');
  await page.getByLabel('نام نمایشی', { exact: true }).fill('پیش‌نویس واکنش‌گرا');
  await mkdir(reviewPath('output/review/v5'), { recursive: true });
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
    expect(cols).toBe((await form.boundingBox())!.width >= 680 ? 2 : 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    const save = page.getByRole('button', { name: 'ذخیره پروفایل', exact: true });
    const box = (await save.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(height - 12);
    await page.screenshot({ path: reviewPath(`output/review/v5/profile-${width}-${height}.png`) });
    evidence.push({ width, height, cols, overflow });
  }
  await writeFile(
    reviewPath('output/review/v5/profile-checks.json'),
    JSON.stringify(evidence, null, 2),
  );
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

test('V5.2 search remains contained and separate from filters with large text and preserved input', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: {} });
  await login(context, 'Student', true);
  for (const route of ['/personal/extracurricular', '/personal/messages']) {
    await page.goto(route);
    const search = page.locator('main [data-ui="search"]').first();
    await expect(search).toBeVisible();
    const input = search.locator('input');
    await input.fill('جستجوی فارسی و Latin');
    for (const large of [false, true]) {
      await page.evaluate((large) => {
        document.documentElement.dataset.reading = large ? 'large' : 'standard';
      }, large);
      for (const [width, height] of [
        [320, 800],
        [390, 844],
        [768, 1024],
        [834, 1112],
        [1024, 768],
        [1440, 900],
      ]) {
        await page.setViewportSize({ width, height });
        const a = (await search.boundingBox())!,
          b = (await input.boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(a.x - 1);
        expect(b.y).toBeGreaterThanOrEqual(a.y - 1);
        expect(b.x + b.width).toBeLessThanOrEqual(a.x + a.width + 1);
        expect(b.y + b.height).toBeLessThanOrEqual(a.y + a.height + 1);
        const filter = route.includes('extracurricular')
          ? page.getByRole('group').first()
          : page.getByRole('navigation', { name: copy.text_6f9bc91900c3, exact: true });
        if (await filter.count()) {
          const box = await filter.boundingBox();
          if (box) expect(box.y).toBeGreaterThanOrEqual(a.y + a.height + 11);
        }
        await expect(input).toHaveValue('جستجوی فارسی و Latin');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
    await page.evaluate(() => {
      document.documentElement.dataset.reading = 'standard';
    });
  }
});

test('V5.2 portrait tablet gives the useful width to content and keeps related actions reachable', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design', { data: {} });
  await login(context, 'Student', true);
  await page.setViewportSize({ width: 834, height: 1112 });
  for (const route of ['/personal/education', '/personal/assistant', '/personal/messages']) {
    await page.goto(route);
    await expect(page.locator('.rx-body-grid')).toBeVisible();
    const box = (await page.locator('.rx-body-grid').boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(708);
    await expect(page.locator('.rx-context-panel')).toBeHidden();
  }
  await page.goto('/personal/extracurricular/requests/new?step=details');
  const toggle = page
    .getByRole('banner')
    .getByRole('button', { name: copy.v5Product.context, exact: true });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('V5.2 assistant composer stays in the visible viewport without losing a draft', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/assistant');
  const input = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
  await input.fill('پیش‌نویس بدون ارسال و مصرف سهمیه');
  for (const height of [844, 540, 420]) {
    await page.setViewportSize({ width: 390, height });
    await expect(input).toBeInViewport();
    const composer = (await page.locator('[data-ui="composer"]').boundingBox())!;
    expect(composer.y + composer.height).toBeLessThanOrEqual(height + 1);
    await expect(input).toHaveValue('پیش‌نویس بدون ارسال و مصرف سهمیه');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await input.focus();
  // Browser-only model of an occluding visual viewport; this is not a native keyboard test.
  await page.evaluate(() => {
    Object.defineProperty(visualViewport!, 'height', { value: 540, configurable: true });
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => (await page.locator('.v5-product-viewport').boundingBox())!.height)
    .toBe(540);
  await expect(input).toHaveValue('پیش‌نویس بدون ارسال و مصرف سهمیه');
  await page.evaluate(() => {
    delete (visualViewport as unknown as { height?: number }).height;
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => (await page.locator('.v5-product-viewport').boundingBox())!.height)
    .toBe(844);
});

test('V5.2 dashboard week links open the real schedule in the requested week', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design', { data: {} });
  await login(context, 'Student', true);
  await page.goto('/personal/education');
  const week = page.getByRole('navigation', { name: copy.v5Product.weekNavigation, exact: true });
  await expect(week.getByRole('link')).toHaveCount(7);
  const target = week.getByRole('link').last(),
    href = (await target.getAttribute('href'))!;
  const day = new URL(href, 'http://127.0.0.1:3132').searchParams.get('day')!;
  await target.click();
  await expect(page).toHaveURL(new RegExp('/schedule\\?day=' + day + '$'));
  await expect
    .poll(async () => {
      const state = await (await request.get(fixture + '/__test__/state')).json();
      return state.requests.some(
        (r: { method: string; path: string; query: { fromUtc?: string; toUtc?: string } }) =>
          r.method === 'GET' &&
          r.path === '/api/v1/academic/schedule' &&
          !!r.query.fromUtc &&
          !!r.query.toUtc &&
          Date.parse(r.query.fromUtc) <= Date.parse(day + 'T12:00:00Z') &&
          Date.parse(r.query.toUtc) >= Date.parse(day + 'T12:00:00Z'),
      );
    })
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('V5.2 a published lesson keeps readable text and a bounded reading column at wide and enlarged mobile sizes', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design', { data: {} });
  await login(context, 'Student', true);
  await page.goto('/personal/education/lessons/00000000-0000-4000-8000-000000000005');
  const text = page.locator('[data-v5-scene="MK-05"] article p[dir="auto"]');
  await expect(text).toContainText('معادله');
  for (const width of [320, 390, 834, 1440, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate((large) => {
      document.documentElement.dataset.reading = large ? 'large' : 'standard';
      document.documentElement.style.setProperty('--text-scale', large ? '2' : '1');
    }, width < 768);
    const geometry = await text.evaluate((p) => {
      const article = p.closest('article')!;
      return {
        font: parseFloat(getComputedStyle(p).fontSize),
        lineHeight: parseFloat(getComputedStyle(p).lineHeight),
        width: article.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry.font).toBeGreaterThanOrEqual(width < 768 ? 32 : 16);
    expect(geometry.lineHeight).toBeGreaterThanOrEqual(geometry.font * 2);
    expect(geometry.width).toBeLessThanOrEqual(800);
    expect(geometry.overflow).toBe(false);
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.includes('/academic/lessons/') && !['GET', 'HEAD'].includes(r.method),
    ),
  ).toHaveLength(0);
});

test('mobile class cards and the independent-class action remain usable while the tablet and desktop list stay compact', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design', { data: {} });
  await request.post(fixture + '/__test__/personal-class', { data: {} });
  await login(context, 'Student', true);
  for (const width of [320, 390, 430, 718, 767, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/personal/education/classes');
    const card = page.getByRole('link', { name: 'ورود به کلاس ریاضی نهم', exact: true });
    await expect(card).toBeVisible();
    const box = (await card.boundingBox())!;
    if (width < 768) expect(box.height).toBeGreaterThanOrEqual(130);
    else expect(box.height).toBeLessThan(110);
    await page.goto('/personal/extracurricular');
    const create = page.getByRole('link', { name: copy.text_2d5123fde88c, exact: true });
    await expect(create).toHaveCount(1);
    if (width < 768) {
      const nav = page.getByRole('navigation', { name: 'ناوبری حساب شخصی', exact: true });
      const before = (await create.boundingBox())!;
      const dock = (await nav.boundingBox())!;
      expect(before.width).toBeGreaterThanOrEqual(width - 34);
      expect(before.height).toBeGreaterThanOrEqual(44);
      expect(before.y + before.height).toBeLessThanOrEqual(dock.y);
      await page.locator('.rx-content').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      const after = (await create.boundingBox())!;
      expect(Math.abs(after.y - before.y)).toBeLessThan(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
