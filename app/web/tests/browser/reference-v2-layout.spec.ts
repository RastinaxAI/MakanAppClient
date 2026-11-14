import { test, expect, login, schoolSections, fixture } from './test';
import { v6Ui as v6 } from '../../src/content/fa';
import type { Page } from '@playwright/test';
async function roles(page: Page) {
  const dialog = page.getByRole('dialog', { name: v6.schoolPicker, exact: true });
  if (!(await dialog.isVisible()))
    await page.getByRole('button', { name: v6.chooseSchool }).click();
  await expect(dialog).toBeVisible();
  return dialog;
}
test('V6 desktop entry keeps phone and code in the same centered reading column', async ({
  page,
}) => {
  for (const width of [834, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/enter');
    const phone = page.getByLabel('شماره همراه', { exact: true });
    const box = (await phone.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(780);
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
    await phone.fill('09120000199');
    await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
    await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /ویرایش شماره/ }).click();
    await expect(phone).toHaveValue('09120000199');
  }
});
test('V5 education destinations preserve contextual navigation and use the full reading area', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context, 'Manager');
  for (const width of [390, 834, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['', '/classes', '/members', '/guardians', '/invitations', '/reports']) {
      await page.goto('/personal/education' + path);
      await expect(page.getByRole('banner')).toBeVisible();
      const nav = await schoolSections(page);
      await expect(nav).toBeVisible();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (path === '/invitations') {
        const inbox = page.getByRole('region', { name: 'دعوت‌های دریافتی', exact: true });
        await expect(inbox).toBeVisible();
        const body = page.locator('.rx-body-grid');
        expect((await inbox.boundingBox())!.width).toBeGreaterThan(
          (await body.boundingBox())!.width * 0.85,
        );
      }
    }
  }
});
test('V6 settings lists its nine account destinations and applies the selected theme', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/personal/settings');
  await expect(page.locator('.v5-list .v5-row')).toHaveCount(9);
  // V6 keeps this account page full-width; context is reachable only where the page supplies it.
  await expect(page.locator('.rx-context-panel')).toBeHidden();
  await page.getByRole('link', { name: /ظاهر برنامه/ }).click();
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('profile switches only authorized workspaces in place and reloads the authoritative context', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/profile-roles');
  await login(context, 'Manager');
  await page.goto('/personal/profile');
  let chooser = await roles(page);
  await expect(chooser.getByRole('radio')).toHaveCount(2);
  await chooser.getByRole('radio', { name: /مدرس/ }).check();
  await chooser.getByRole('button', { name: v6.enterRole, exact: true }).click();
  await expect
    .poll(
      async () =>
        (await (await context.request.get('/api/client/session')).json()).context.activeRole,
    )
    .toBe('Teacher');
  await expect(page).toHaveURL(/\/personal\/education$/);
  await page.goto('/personal/profile');
  chooser = await roles(page);
  await expect(chooser.getByRole('radio', { name: /مدرس/ })).toBeChecked();
  await page.reload();
  await expect((await roles(page)).getByRole('radio', { name: /مدرس/ })).toBeChecked();
});
test('a rejected profile role switch preserves the previous server context', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/profile-roles');
  await login(context, 'Manager');
  await page.goto('/personal/profile');
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/workspaces/select', method: 'POST', status: 503 },
  });
  const dialog = await roles(page);
  await dialog.getByRole('radio', { name: /مدرس/ }).check();
  await dialog.getByRole('button', { name: v6.enterRole, exact: true }).click();
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  expect((await (await context.request.get('/api/client/session')).json()).context.activeRole).toBe(
    'Manager',
  );
  await page.reload();
  await expect((await roles(page)).getByRole('radio', { name: /مدیر آموزشگاه/ })).toBeChecked();
});
