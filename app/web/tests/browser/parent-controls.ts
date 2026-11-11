import type { Page } from '@playwright/test';
import { v4_more, v5Parent } from '../../src/content/fa';
export function parentChildButton(page: Page, id: string) {
  const row = page.getByTestId('child-' + id);
  return row.and(page.getByRole('button')).or(row.getByRole('button')).first();
}

export async function openParentChildren(page: Page) {
  const list = page.locator('[data-parent-children]');
  if (await list.isVisible()) return;
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: v5Parent.children, exact: true })
    .click();
  await list.waitFor({ state: 'visible' });
}

/** Trigger selection only; callers can hold the server acknowledgment themselves. */
export async function selectParentChild(page: Page, id: string) {
  const select = page.getByRole('combobox', { name: 'انتخاب فرزند', exact: true });
  const list = page.locator('[data-parent-children]');
  if (
    !(await select.isVisible()) &&
    !(await list.isVisible()) &&
    (await page
      .locator('[data-v5-scene="MK-09"],[data-v5-scene="MK-117"],[data-v5-scene="MK-118"]')
      .filter({ visible: true })
      .first()
      .isVisible())
  )
    await openParentChildren(page);
  await select.or(list).first().waitFor({ state: 'visible' });
  if (await select.isVisible()) await select.selectOption(id);
  else await parentChildButton(page, id).click();
}
