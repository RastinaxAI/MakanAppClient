import { reviewPath } from './review-output';
import { test, expect, login, fixture, ids } from './test';
import { mkdir, writeFile } from 'node:fs/promises';

test('manager class rows read real active roster totals and defer offscreen reads without granting another role access', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', { data: { exactV5: true } });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(context, 'Manager');
  await page.goto('/personal/education/classes');
  const table = page.getByRole('table');
  const first = table.getByRole('row').filter({
    has: page.getByRole('button', { name: 'انتخاب کلاس ریاضی دهم · گروه الف', exact: true }),
  });
  await expect(first.getByRole('cell').filter({ hasText: 'مریم رضایی' })).toBeVisible();
  await expect(first.getByRole('cell').filter({ hasText: '۲۴ / ۳۰' })).toBeVisible();
  await expect(page.locator('[data-class-summary]')).toHaveAttribute('data-enrolled', '24');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const rosterRead = (row: { method: string; path: string }) =>
    row.method === 'GET' && /\/academic\/classes\/.+\/(teachers|learners)$/.test(row.path);
  expect(state.requests.filter(rosterRead).length).toBeGreaterThan(0);
  expect(state.requests.filter(rosterRead).length).toBeLessThan(24);
  const last = table.getByRole('row').last();
  await last.scrollIntoViewIfNeeded();
  await expect(last.getByRole('cell').filter({ hasText: '۲۰ / ۳۰' })).toBeVisible();
  await last.getByRole('button').click();
  await expect(page.locator('[data-class-summary]')).toHaveAttribute('data-enrolled', '20');
  const marker = (await (await request.get(fixture + '/__test__/state')).json()).requests.length;
  await login(context, 'Student');
  await page.goto('/personal/education/classes');
  await expect(page.getByRole('heading', { name: 'کلاس‌های من', exact: true })).toBeVisible();
  const after = await (await request.get(fixture + '/__test__/state')).json();
  expect(after.requests.slice(marker).filter(rosterRead)).toHaveLength(0);
});

test('200 percent text and a reduced viewport keep the form action and scrolled input above the safe area', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await login(context, 'Student', false);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 34 } });
  const out = reviewPath('output/review/exact-v1/reduced-height');
  await mkdir(out, { recursive: true });
  const records = [];
  for (const theme of ['light', 'dark']) {
    await page.goto('/personal/profile/edit');
    await page.evaluate((theme) => {
      localStorage.setItem('makan-theme', theme);
      window.dispatchEvent(new Event('makan-theme-changed'));
    }, theme);
    const name = page.getByLabel('نام نمایشی', { exact: true });
    await name.fill('نام بلند فارسی و Latin 123');
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 500 });
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 34 } });
      await name.scrollIntoViewIfNeeded();
      await name.focus();
      await expect(name).toHaveValue('نام بلند فارسی و Latin 123');
      await expect(name).toBeInViewport({ ratio: 1 });
      const action = page.getByRole('button', { name: 'ذخیره پروفایل', exact: true });
      const a = (await action.boundingBox())!,
        input = (await name.boundingBox())!;
      expect(a.y + a.height).toBeLessThanOrEqual(500 - 34);
      expect(input.y + input.height).toBeLessThanOrEqual(a.y);
      const dock = page.locator('[data-navigation-presentation="dock"]');
      await expect(dock).toBeVisible();
      expect(a.y + a.height).toBeLessThanOrEqual((await dock.boundingBox())!.y);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow).toBe(false);
      const image = `${out}/profile-${width}-${theme}.png`;
      await page.screenshot({ path: image, animations: 'disabled' });
      records.push({
        width,
        height: 500,
        theme,
        reading: 'large',
        safeArea: 34,
        action: a,
        input,
        overflow,
        image,
        synthetic: true,
        physicalKeyboard: false,
      });
    }
  }
  await cdp.detach();
  await writeFile(out + '/results.json', JSON.stringify(records, null, 2) + '\n');
});

test('V9 auth keeps its 480px reading column and its policy dialog restores focus', async ({
  page,
}) => {
  await page.goto('/enter');
  await page.getByLabel('شماره همراه', { exact: true }).fill('09120000101');
  for (const width of [320, 360, 390, 430, 768, 834, 1024, 1194, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const action = (await page
      .getByRole('button', { name: 'دریافت کد تأیید', exact: true })
      .boundingBox())!;
    expect(action.width).toBeLessThanOrEqual(Math.min(480, width - 24));
    expect(action.width).toBeGreaterThanOrEqual(Math.min(480, width - 48));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  for (const width of [390, 834]) {
    await page.setViewportSize({ width, height: 844 });
    const policy = page.locator('[data-auth-policy]');
    expect((await policy.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await policy.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(policy).toBeFocused();
  }
});

test('V9 200 percent text uses three plus two navigation rows and keeps form navigation usable', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case');
  await context.addInitScript(() => localStorage.setItem('makan-reading', 'large'));
  await login(context, 'Manager', true);
  await page.goto('/personal/education/classes');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 740 });
    const dock = page.locator('[data-navigation-presentation="dock"]');
    await expect(dock).toBeVisible();
    const links = dock.getByRole('link');
    await expect(links).toHaveCount(5);
    const boxes = await links.evaluateAll((items) =>
      items.map((e) => e.getBoundingClientRect().toJSON()),
    );
    expect(Math.abs(boxes[0].y - boxes[2].y)).toBeLessThan(1);
    expect(boxes[3].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
    expect(Math.abs(boxes[3].y - boxes[4].y)).toBeLessThan(1);
    expect(boxes.every((b) => b.width >= 44 && b.height >= 44)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.goto('/personal/profile/edit');
  await expect(page.locator('[data-navigation-presentation="dock"]')).toBeVisible();
  await expect(page.getByLabel('نام نمایشی', { exact: true })).toBeEditable();
});

test('exact V5 class settings spans its explanation across two columns and preserves the draft during resize', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/vnext');
  await login(context, 'Manager', true);
  await page.goto(`/personal/education/classes/${ids.class}?tab=settings`);
  const title = page.getByLabel('عنوان کلاس', { exact: true });
  const reason = page.getByLabel('دلیل تغییر', { exact: true });
  await title.fill('پیش‌نویس کلاس با عنوان بلند فارسی / Latin 123');
  await reason.fill('افزایش ظرفیت با تأمین فضای کلاس');
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(title).toHaveValue('پیش‌نویس کلاس با عنوان بلند فارسی / Latin 123');
    const a = (await title.boundingBox())!,
      b = (await reason.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(a.width);
    if (width >= 768) expect(b.width).toBeGreaterThan(a.width * 1.9);
    const save = page.getByRole('button', { name: 'ذخیره تنظیمات', exact: true });
    await expect(save).toBeVisible();
    expect((await save.boundingBox())!.y + (await save.boundingBox())!.height).toBeLessThanOrEqual(
      844,
    );
  }
});

test('V9 messenger retains its draft across two panes, mobile and theme changes', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Student', false);
  await page.goto('/personal/messages/' + ids.chat);
  const text = page.getByRole('textbox', { name: 'متن پیام', exact: true });
  await text.fill('پیش‌نویس حفظ‌شده\nخط دوم با Latin و 123');
  for (const width of [1440, 834, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(text).toHaveValue('پیش‌نویس حفظ‌شده\nخط دوم با Latin و 123');
    const inspector = page.locator('[data-chat-context]');
    await expect(inspector).toBeHidden();
    const list = page.locator('[data-chat-list]');
    await expect(list).toBeVisible({ visible: width >= 768 });
    if (width >= 768) expect((await list.boundingBox())!.width).toBe(width >= 1200 ? 304 : 248);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect((await text.boundingBox())!.y + (await text.boundingBox())!.height).toBeLessThanOrEqual(
      844,
    );
  }
  await page.evaluate(() => {
    localStorage.setItem('makan-theme', 'dark');
    window.dispatchEvent(new Event('makan-theme-changed'));
  });
  await expect(text).toHaveValue('پیش‌نویس حفظ‌شده\nخط دوم با Latin و 123');
  await page.getByRole('button', { name: 'گزینه‌های گفتگو', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'نظرسنجی تازه', exact: true })).toBeVisible();
});
