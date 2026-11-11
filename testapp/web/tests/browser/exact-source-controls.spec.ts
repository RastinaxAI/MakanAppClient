import { test, expect, login, fixture } from './test';
import { captureExactState } from './exact-state-capture';
import * as text from '../../src/content/fa';

test('source search clears accessibly and preserves the authorized scope and filter across resize and reload', async ({
  page,
  context,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/resources');
  const scopes = page.getByRole('radiogroup', { name: text.text_be51a88d392d, exact: true });
  await expect(
    scopes.getByRole('radio', { name: text.text_e7b1ccd0bda3, exact: true }),
  ).toHaveCount(0);
  const search = page.getByRole('textbox', { name: text.text_c7ffe2197db2, exact: true });
  await search.fill('عبارت بدون نتیجهٔ آزمایشی');
  await expect(
    page.getByRole('heading', { name: text.text_76263ba743f2, exact: true }),
  ).toBeVisible();
  await captureExactState(
    page,
    ['RX-052'],
    'Source search: entered text, clear action and a real empty result.',
  );
  await page.getByRole('button', { name: text.text_35c84a68f506, exact: true }).click();
  await expect(search).toBeFocused();
  await expect(page.getByRole('link', { name: 'منبع شخصی آزمایشی', exact: true })).toBeVisible();
  await scopes.getByRole('radio', { name: 'کتابخانه', exact: true }).check();
  await expect(
    page.getByRole('link', { name: 'کتابخانهٔ عمومی آزمایشی', exact: true }),
  ).toBeVisible();
  const more = page.getByRole('button', { name: text.v4_more, exact: true });
  await more.click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: text.text_68bfe264e2cf, exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(scopes.getByRole('radio', { name: 'کتابخانه', exact: true })).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.reload();
  await expect(scopes.getByRole('radio', { name: 'کتابخانه', exact: true })).toBeChecked();
  await more.click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: text.text_68bfe264e2cf, exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
});

test('the real source submit control has disabled, normal, focus and pending states and submits the file once', async ({
  page,
  context,
  request,
}) => {
  await login(context, 'Student', false);
  await page.goto('/personal/resources?upload=1&scope=Personal');
  const action = page.getByRole('button', { name: text.text_914c38333ec6, exact: true });
  await expect(action).toBeDisabled();
  await captureExactState(
    page,
    ['RX-050'],
    'Disabled: the actual upload form has no file or required values.',
  );
  const title = 'منبع آزمون اجزای مشترک';
  await page.getByLabel('عنوان منبع', { exact: true }).fill(title);
  await page.getByLabel('دلیل ثبت', { exact: true }).fill('بررسی حالت‌های کنترل در محیط آزمون');
  await page.getByLabel('فایل منبع', { exact: true }).setInputFiles({
    name: 'states.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nfixture-only\n%%EOF'),
  });
  await expect(action).toBeEnabled();
  await captureExactState(
    page,
    ['RX-050'],
    'Normal: a ready local draft enables the same native submit control.',
  );
  await captureExactState(
    page,
    ['RX-050'],
    'Keyboard focus on the visible native submit control.',
    {
      prepareViewport: async (page) => {
        await page.keyboard.press('Tab');
        await page.getByRole('button', { name: text.text_914c38333ec6, exact: true }).focus();
      },
    },
  );
  let releaseUpload!: () => void;
  const held = new Promise<void>((resolve) => {
    releaseUpload = resolve;
  });
  await page.route(/\/api\/client\/source-files\?scope=Personal$/, async (route) => {
    await held;
    await route.continue();
  });
  try {
    await action.click();
    await expect(page.locator('button[aria-busy="true"]:visible')).toBeDisabled();
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    await captureExactState(
      page,
      ['RX-050'],
      'Pending: the real upload is held; a second submit cannot start another operation.',
    );
  } finally {
    releaseUpload();
  }
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) =>
        row.path === '/api/v1/files' && row.method === 'POST',
    ),
  ).toHaveLength(1);
  expect(
    state.requests.filter(
      (row: { path: string; method: string }) =>
        row.path === '/api/v1/sources' && row.method === 'POST',
    ),
  ).toHaveLength(1);
});
