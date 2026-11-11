import { expect, type Page } from '@playwright/test';
import { privacySettings as t } from '../../src/content/fa';

export async function choosePrivacyAudience(
  page: Page,
  field:
    | 'directMessagesAudience'
    | 'phoneNumberVisibilityAudience'
    | 'phoneNumberDiscoveryAudience'
    | 'groupInvitesAudience',
  audience: keyof typeof t.audiences,
) {
  const row = page.getByTestId('privacy-' + field);
  await row.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: t.audiences[audience], exact: true }).check();
  await dialog
    .getByRole('button', {
      name: field === 'directMessagesAudience' ? t.applyDirect : t.apply,
      exact: true,
    })
    .click();
  await expect(row).toContainText(t.audiences[audience]);
}
