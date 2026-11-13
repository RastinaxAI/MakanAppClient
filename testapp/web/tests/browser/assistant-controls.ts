import { expect, type Page } from '@playwright/test';
import { aiIntegration as t, v6Ui, v7Ui } from '../../src/content/fa';
export async function openAssistantChat(page: Page) {
  if (new URL(page.url()).searchParams.get('view') !== 'chat')
    await page.getByRole('button', { name: new RegExp('^' + v6Ui.assistantReview) }).click();
  await expect(page).toHaveURL(/view=chat/);
  await expect(page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true })).toBeVisible();
}
export async function assistantOptions(page: Page) {
  await page
    .getByRole('banner')
    .getByRole('button', { name: /^(انتخاب سهمیه|سهمیه عادی|سهمیه آموزشگاه)$/ })
    .click();
  return page.getByRole('dialog', { name: t.chooseQuota, exact: true });
}
export async function chooseAssistantPayer(page: Page, value: string) {
  await openAssistantChat(page);
  const options = await assistantOptions(page);
  await options.getByLabel(t.payer, { exact: true }).selectOption(value);
  await options.getByRole('button', { name: t.done, exact: true }).click();
}
export async function assistantTools(page: Page) {
  await page.getByRole('tab', { name: v7Ui.outputs, exact: true }).click();
  return page.locator('#assistant-panel-outputs');
}
export async function returnToAssistantQuestion(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: 'بازگشت', exact: true }).click();
}
