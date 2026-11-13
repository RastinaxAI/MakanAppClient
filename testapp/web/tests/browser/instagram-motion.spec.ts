import { reviewPath } from './review-output';
import { test, expect, login, fixture, origin } from './test';
import { mkdir } from 'node:fs/promises';
import {
  chooseAssistantPayer,
  assistantTools,
  returnToAssistantQuestion,
} from './assistant-controls';
import { aiIntegration as ai } from '../../src/content/fa';

test.use({
  viewport: { width: 390, height: 844 },
  video: { mode: 'on', size: { width: 390, height: 844 } },
  contextOptions: { reducedMotion: 'reduce' },
});
for (const theme of ['light', 'dark']) {
  test(`recorded ${theme}: chat, profile, assistant, dialogs and back remain coherent`, async ({
    page,
    context,
    request,
  }) => {
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    await request.post(fixture + '/__test__/design');
    await request.post(fixture + '/__test__/ai-integration', { data: {} });
    const initial = await login(context);
    await page.goto('/personal/education');
    const nav = page.getByRole('navigation', { name: 'ناوبری حساب شخصی', exact: true });
    expect(
      await nav
        .getByRole('link')
        .first()
        .evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
    await nav.getByRole('link').first().focus();
    await page.keyboard.press('Tab');
    expect(
      await page.locator(':focus').evaluate((el) => ({
        width: getComputedStyle(el).outlineWidth,
        color: getComputedStyle(el).outlineColor,
      })),
    ).toEqual({
      width: '3px',
      color: theme === 'dark' ? 'rgb(141, 185, 255)' : 'rgb(13, 94, 204)',
    });
    await nav.getByRole('link', { name: 'پیام‌ها', exact: true }).click();
    await page.getByRole('link', { name: 'پیام جدید', exact: true }).click();
    await expect(page.locator('[data-recipient-picker]')).toBeVisible();
    await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
    await expect(page.getByRole('link', { name: 'پیام جدید', exact: true })).toBeVisible();
    await page.getByRole('link').filter({ hasText: 'مریم رضایی' }).click();
    const field = page.getByRole('textbox', { name: 'متن پیام', exact: true });
    await field.fill('پیام نمونهٔ بررسی جریان مرجع تلگرام');
    await field.press('Enter');
    await expect(
      page
        .getByLabel('پیام‌های گفتگو', { exact: true })
        .locator('[data-message-state="history"]')
        .filter({ hasText: 'پیام نمونهٔ بررسی جریان مرجع تلگرام' }),
    ).toHaveCount(1);
    await page.getByRole('link', { name: 'بازگشت', exact: true }).click();
    await nav.getByRole('link', { name: 'پروفایل', exact: true }).click();
    await page.getByRole('link', { name: 'تنظیمات', exact: true }).click();
    await page.getByRole('link', { name: /^حریم خصوصی/ }).click();
    await expect(page).toHaveURL(/\/settings\/privacy$/);
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/profile$/);
    await nav.getByRole('link', { name: 'دستیار', exact: true }).click();
    await chooseAssistantPayer(page, 'Individual');
    const question = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
    await question.fill('نقش هسته چیست؟');
    await question.focus();
    expect(
      await question.evaluate((el) => ({
        width: getComputedStyle(el).outlineWidth,
        color: getComputedStyle(el).outlineColor,
      })),
    ).toEqual({
      width: '3px',
      color: theme === 'dark' ? 'rgb(141, 185, 255)' : 'rgb(13, 94, 204)',
    });
    await question.press('Enter');
    await expect(page.locator('[data-assistant-result]')).toContainText(
      'پاسخ واقعی قرارداد در محیط آزمون',
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await mkdir(reviewPath('output/review/telegram-reference'), { recursive: true });
    await page.screenshot({
      path: reviewPath(`output/review/telegram-reference/assistant-focused-${theme}-390.png`),
    });
    await returnToAssistantQuestion(page);
    await expect(question).toHaveValue('');
    const tools = await assistantTools(page);
    await expect(tools).toBeVisible();
    await expect(tools).toContainText(ai.tools);
    await page.getByRole('tab', { name: 'گفتگو', exact: true }).click();
    await expect(tools).toBeHidden();
    await expect(question).toBeVisible();
    await nav.getByRole('link', { name: 'آموزشگاه', exact: true }).click();
    const after = await (await context.request.get(origin + '/api/client/session')).json();
    expect(after.context).toEqual(initial.context);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
