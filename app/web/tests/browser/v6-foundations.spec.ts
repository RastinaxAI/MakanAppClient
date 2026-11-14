import { test, expect, login, fixture, ids } from './test';
import { v6Ui as t } from '../../src/content/fa';
import { mkdir } from 'node:fs/promises';

const evidence = 'test-results/v6-foundations';

test('phone contact validates before resolving, keeps the draft after rejection and saves only the resolved user ID', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/contacts');
  await page.getByRole('button', { name: 'مخاطب جدید', exact: true }).click();
  await expect(page.locator('[data-app-navigation]:visible')).toHaveCount(0);
  await page.getByLabel(t.contactName, { exact: true }).fill('مخاطب تست شماره');
  const phone = page.getByLabel(t.contactPhone, { exact: true });
  await phone.fill('۱۲۳');
  await page.getByRole('button', { name: t.saveContact, exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: t.invalidPhone })).toBeVisible();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { path: string }) => r.path === '/api/v1/people/resolve'),
  ).toHaveLength(0);
  await phone.fill('۰۹۱۲۰۰۰۰۱۰۲');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/contacts', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: t.saveContact, exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'اطلاعات دریافت نشد' })).toBeVisible();
  await expect(phone).toHaveValue('۰۹۱۲۰۰۰۰۱۰۲');
  await expect(page.getByLabel(t.contactName, { exact: true })).toHaveValue('مخاطب تست شماره');
  await page.getByRole('button', { name: t.saveContact, exact: true }).click();
  await expect(page.getByText('مخاطب تست شماره', { exact: true })).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  const saves = state.requests.filter(
    (r: { path: string; method: string }) => r.path === '/api/v1/contacts' && r.method === 'POST',
  );
  expect(saves).toHaveLength(2);
  for (const save of saves)
    expect(save.body).toEqual({
      contactUserId: '00000000-0000-4000-8000-000000000102',
      savedName: 'مخاطب تست شماره',
    });
});

test('contact form stays usable at 200% text, reduced height and each foundation breakpoint without discarding its values', async ({
  page,
  context,
}) => {
  await login(context);
  await page.goto('/personal/contacts');
  await page.getByRole('button', { name: 'مخاطب جدید', exact: true }).click();
  await page
    .getByLabel(t.contactName, { exact: true })
    .fill('نام بلند مخاطب برای آزمون چیدمان فارسی Latin 2026');
  await page.getByLabel(t.contactPhone, { exact: true }).fill('09120000102');
  await mkdir(evidence, { recursive: true });
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 768, 834, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 540 : 900 });
      await page.evaluate((theme) => {
        localStorage.setItem('makan-theme', theme);
        window.dispatchEvent(new Event('makan-theme-changed'));
        document.documentElement.dataset.reading = 'large';
      }, theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByLabel(t.contactName, { exact: true })).toHaveValue(
        'نام بلند مخاطب برای آزمون چیدمان فارسی Latin 2026',
      );
      await expect(page.getByLabel(t.contactPhone, { exact: true })).toHaveValue('09120000102');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2),
      ).toBe(true);
      for (const control of await page
        .locator('form[data-contact-phone-form] input,form[data-contact-phone-form] select')
        .all()) {
        const rect = (await control.boundingBox())!;
        expect(rect.height).toBeGreaterThanOrEqual(48);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(width + 2);
      }
      const save = page.getByRole('button', { name: t.saveContact, exact: true });
      await expect(save).toBeInViewport();
      expect((await save.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: `${evidence}/contact-${theme}-${width}-large.png` });
    }
});

test('chat keeps its draft while reflowing and its composer remains outside the scrollable history', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context);
  await page.goto('/personal/messages/' + ids.chat);
  const composer = page.getByRole('textbox', { name: 'متن پیام', exact: true });
  await composer.fill('پیش‌نویس گفتگو با نام فایل example-long-file.pdf');
  for (const width of [320, 390, 768, 834, 1024, 1440]) {
    await page.setViewportSize({ width, height: 540 });
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.dataset.reading = 'large';
    });
    const inbox = page.locator('[data-chat-list]');
    if (width < 768) await expect(inbox).toBeHidden();
    else {
      await expect(inbox).toBeVisible();
      expect((await inbox.boundingBox())!.width).toBe(width >= 1200 ? 312 : 280);
      if (width < 1200) {
        const destinations = page
          .getByRole('navigation', { name: 'ناوبری حساب شخصی', exact: true })
          .getByRole('link');
        const first = (await destinations.first().boundingBox())!;
        const last = (await destinations.last().boundingBox())!;
        expect(Math.abs(last.y - first.y - 224)).toBeLessThan(2);
      }
    }
    await expect(composer).toHaveValue('پیش‌نویس گفتگو با نام فایل example-long-file.pdf');
    await expect(composer).toBeInViewport();
    const box = (await composer.boundingBox())!;
    const minimumLine = await composer.evaluate((e) => {
      const style = getComputedStyle(e);
      return (
        parseFloat(style.lineHeight) +
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom)
      );
    });
    expect(box.height).toBeGreaterThanOrEqual(minimumLine - 1);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 2);
    expect(box.y + box.height).toBeLessThanOrEqual(542);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(
      true,
    );
  }
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.method === 'POST' && r.path.endsWith('/messages'),
    ),
  ).toHaveLength(0);
});

test('profile exposes only authorized roles in a keyboard dialog and restores focus on Escape', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/profile-roles');
  await login(context, 'Manager');
  await page.goto('/personal/profile');
  const trigger = page.getByRole('button', { name: t.chooseSchool, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: t.schoolPicker, exact: true });
  await expect(dialog.getByRole('radio')).toHaveCount(2);
  await expect(dialog.getByRole('radio', { name: /والد/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path.endsWith('/workspaces/select') && r.method === 'POST',
    ),
  ).toHaveLength(1);
});
