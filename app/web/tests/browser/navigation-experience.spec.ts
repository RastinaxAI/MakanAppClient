import { v6Ui as v6 } from '../../src/content/fa';
import { test, expect, login, origin, fixture } from './test';
import { mkdir } from 'node:fs/promises';
import {
  openAssistantChat,
  assistantOptions,
  assistantTools,
  chooseAssistantPayer,
  returnToAssistantQuestion,
} from './assistant-controls';
import { aiIntegration as ai } from '../../src/content/fa';

for (const role of ['Student', 'Teacher', 'Parent', 'Manager']) {
  test(`${role} keeps the selected role across tabs, reload and another browser tab`, async ({
    page,
    context,
  }) => {
    const original = await login(context, role);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/personal/education');
    const changes: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/workspaces/select'))
        changes.push(request.url());
    });
    for (const name of [
      'دستیار',
      'فوق‌برنامه',
      'پیام‌ها',
      'پروفایل',
      'آموزشگاه',
      'پیام‌ها',
      'آموزشگاه',
    ]) {
      await page
        .getByRole('navigation', { name: 'ناوبری حساب شخصی' })
        .filter({ visible: true })
        .getByRole('link', { name, exact: true })
        .click();
      await expect(page.getByRole('dialog', { name: 'انتخاب فضای کار' })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'کجا ادامه می‌دهید؟' })).toHaveCount(0);
      const current = await (await context.request.get(origin + '/api/client/session')).json();
      expect(current.context).toEqual(original.context);
      expect(current.revision).toBe(original.revision);
    }
    await page.reload();
    const second = await context.newPage();
    await second.goto('/personal/messages');
    await expect(second.getByRole('navigation', { name: 'نوع گفتگوها' })).toBeVisible();
    expect(
      (await (await context.request.get(origin + '/api/client/session')).json()).context,
    ).toEqual(original.context);
    expect(changes).toEqual([]);
    await second.close();
    await page.goto('/personal/profile');
    await page.getByRole('button', { name: v6.chooseSchool }).click();
    const roles = page.getByRole('dialog', { name: v6.schoolPicker, exact: true });
    await expect(roles.getByRole('radio')).toBeChecked();
    await expect(page).toHaveURL(/\/personal\/profile$/);
  });
}

test('connected assistant keeps its composer usable and separates the answer at each reference size', async ({
  page,
  context,
  request,
}) => {
  expect((await request.post(fixture + '/__test__/design')).ok()).toBeTruthy();
  expect(
    (await request.post(fixture + '/__test__/ai-integration', { data: {} })).ok(),
  ).toBeTruthy();
  await login(context, 'Student');
  await mkdir('test-results/navigation-experience', { recursive: true });
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/personal/assistant/studio');
    await expect(page).toHaveURL(/\/personal\/assistant$/);
    await openAssistantChat(page);
    const field = page.getByRole('textbox', { name: 'سؤال از دستیار', exact: true });
    await expect(field).toBeEnabled();
    const composer = (await field.boundingBox())!;
    const form = (await field.locator('..').boundingBox())!;
    const send = (await page
      .getByRole('button', { name: 'ارسال سؤال', exact: true })
      .boundingBox())!;
    expect(form.height).toBeGreaterThanOrEqual(48);
    expect(send.width).toBeGreaterThanOrEqual(44);
    expect(send.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(composer.y + composer.height - send.y - send.height)).toBeLessThanOrEqual(2);
    expect(form.y + form.height).toBeLessThanOrEqual(height);
    if (width < 768)
      await expect(page.getByRole('navigation', { name: 'ناوبری حساب شخصی' })).toBeVisible();
    await chooseAssistantPayer(page, 'Individual');
    await field.fill('سؤال ایزوله برای بررسی چیدمان واقعی پاسخ');
    await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
    await expect(page.locator('[data-assistant-result]')).toContainText(
      'پاسخ واقعی قرارداد در محیط آزمون',
    );
    await expect(field).toBeEnabled();
    await expect(field).toHaveValue('');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/navigation-experience/assistant-${width}.png` });
    await returnToAssistantQuestion(page);
    const tools = await assistantTools(page);
    await expect(tools).toBeVisible();
    await expect(tools).toContainText(ai.tools);
    const box = (await tools.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    expect(box.y).toBeGreaterThanOrEqual(0);
    await page.getByRole('tab', { name: 'گفتگو', exact: true }).click();
    await expect(tools).toBeHidden();
    await expect(field).toBeVisible();
    await page.goto('/personal/messages');
    await expect(page.getByRole('navigation', { name: 'نوع گفتگوها' })).toBeVisible();
  }
});

test('V9 never covers assistant, chat, forms or payment with an automatic install offer', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/ai-integration', { data: {} });
  await login(context, 'Student');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    '/personal/assistant',
    '/personal/messages',
    '/personal/extracurricular/requests/new',
    '/personal/subscription',
    '/personal/profile',
  ]) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByLabel('پیشنهاد نصب ماکان', { exact: true })).toHaveCount(0);
  }
  await page.goto('/personal/assistant');
  const options = await assistantOptions(page);
  await options.getByLabel(ai.payer, { exact: true }).selectOption('FreeTrial');
  await expect(options.locator('[data-assistant-quota-preview]')).toContainText(ai.creditRemaining);
  await page.keyboard.press('Escape');
  await expect(options).toHaveCount(0);
  await expect(
    page.getByRole('banner').getByRole('button', { name: ai.normalQuota, exact: true }),
  ).toBeFocused();
});

test('installation help is reachable explicitly from profile without any floating offer', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/profile');
  await page.getByRole('link', { name: /^تنظیمات/ }).click();
  await page.getByRole('link', { name: /^نصب ماکان/ }).click();
  await expect(page).toHaveURL(/\/personal\/settings\/install$/);
  await page.getByRole('button', { name: 'نصب ماکان', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'نصب برنامهٔ ماکان', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Safari');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('پیشنهاد نصب ماکان', { exact: true })).toHaveCount(0);
});

test('manual PWA installation invokes the browser only after a deliberate click and keeps the page', async ({
  page,
  context,
}) => {
  await login(context, 'Student');
  await page.goto('/personal/settings/install');
  await page.getByRole('button', { name: 'نصب ماکان', exact: true }).waitFor();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(window, { testInstallCalls: 0 });
    Object.assign(event, {
      prompt: async () => {
        (window as unknown as { testInstallCalls: number }).testInstallCalls++;
      },
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    window.dispatchEvent(event);
  });
  expect(
    await page.evaluate(() => (window as unknown as { testInstallCalls: number }).testInstallCalls),
  ).toBe(0);
  await page.getByRole('button', { name: 'نصب ماکان', exact: true }).click();
  expect(
    await page.evaluate(() => (window as unknown as { testInstallCalls: number }).testInstallCalls),
  ).toBe(1);
  await expect(page).toHaveURL(/\/personal\/settings\/install$/);
});
