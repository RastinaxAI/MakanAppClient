import type { Page } from '@playwright/test';
import { aiIntegration as t, v4_more } from '../../src/content/fa';
export async function assistantOptions(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  return page.getByRole('dialog', { name: t.context, exact: true });
}
export async function chooseAssistantPayer(page: Page, value: string) {
  const options = await assistantOptions(page);
  await options.getByLabel(t.payer, { exact: true }).selectOption(value);
  await options.getByRole('button', { name: t.done, exact: true }).click();
}
export async function assistantTools(page: Page) {
  const options = await assistantOptions(page);
  await options.getByRole('button', { name: t.tools, exact: true }).click();
  return page.getByRole('dialog', { name: t.tools, exact: true });
}
export async function returnToAssistantQuestion(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: 'بازگشت', exact: true }).click();
}
