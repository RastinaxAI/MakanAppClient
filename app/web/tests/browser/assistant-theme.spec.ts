import { v6Ui as v6 } from '../../src/content/fa';
import { test, expect, login, fixture, ids } from './test';
import { mkdir } from 'node:fs/promises';
import {
  chooseAssistantPayer,
  returnToAssistantQuestion,
  openAssistantChat,
} from './assistant-controls';
import * as copy from '../../src/content/fa';

test('an appearance storage failure stays on the editable page and never masquerades as a saved preference', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'makan-theme') throw new DOMException('Storage blocked', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await login(context, 'Student', false);
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await expect(page).toHaveURL(/settings\/appearance$/);
  await expect(page.getByRole('main').getByRole('alert')).toContainText(copy.text_d1a91d934e1c);
  await expect(page.getByRole('radio', { name: 'تاریک', exact: true })).toBeChecked();
});

test('dark theme persists across panels and real assistant request and result states', async ({
  page,
  context,
  request,
}) => {
  expect((await request.post(fixture + '/__test__/design')).ok()).toBeTruthy();
  expect(
    (await request.post(fixture + '/__test__/ai-integration', { data: {} })).ok(),
  ).toBeTruthy();
  await login(context, 'Student');
  await mkdir('test-results/assistant-theme', { recursive: true });
  await page.goto('/personal/settings/appearance');
  await page.getByRole('radio', { name: 'تاریک', exact: true }).check();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    for (const [name, url] of [
      ['education', '/personal/education'],
      ['profile', '/personal/profile'],
    ]) {
      await page.goto(url);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      if (name === 'education') {
        await expect(page.locator('[data-v5-scene="MK-04"]')).toBeVisible();
        expect(
          await page.locator('[data-v5-scene]').evaluate((el) => {
            let node: Element | null = el;
            while (node) {
              const color = getComputedStyle(node).backgroundColor;
              if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
              node = node.parentElement;
            }
            return 'transparent';
          }),
        ).toBe('rgb(16, 24, 36)');
      }
      if (name === 'profile')
        await expect(page.getByRole('heading', { name: 'سارا احمدی', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `test-results/assistant-theme/${name}-dark-${width}.png` });
    }
    await page.goto('/personal/assistant/studio');
    await expect(page).toHaveURL(/\/personal\/assistant$/);
    await openAssistantChat(page);
    const field = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
    await expect(field).toBeEnabled();
    await chooseAssistantPayer(page, 'Individual');
    await field.fill('این یک پرسش ایزوله برای بررسی ظاهر پاسخ است.');
    await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
    const answer = page.locator('[data-assistant-result]');
    await expect(answer).toContainText('پاسخ واقعی قرارداد در محیط آزمون');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    expect(await answer.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(
      'rgb(255, 255, 255)',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/assistant-theme/assistant-dark-${width}.png` });
    await returnToAssistantQuestion(page);
    await expect(field).toHaveValue('');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    // Personal messaging no longer changes the selected educational workspace.
    await page.goto('/personal/messages');
    await page.goto('/personal/messages/' + ids.chat);
    await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/assistant-theme/chat-dark-${width}.png` });
    await page.goto('/personal/profile');
    await page.getByRole('button', { name: v6.chooseSchool }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('radio')).toBeChecked();
    await page.keyboard.press('Escape');
    await page.goto('/personal/settings/appearance');
    await expect(page.getByRole('radio', { name: 'تاریک', exact: true })).toBeChecked();
  }
  await page.getByRole('radio', { name: 'روشن', exact: true }).check();
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
