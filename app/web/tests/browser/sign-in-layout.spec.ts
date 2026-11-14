import { test, expect, login, fixture } from './test';
import { captureExactState } from './exact-state-capture';

test('entry help opens on demand and returns focus when closed with Escape', async ({ page }) => {
  await page.goto('/enter');
  const policy = page.getByRole('button', { name: /شرایط استفاده/ });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await policy.click();
  await expect(page.getByRole('dialog', { name: 'ورود به ماکان', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(policy).toBeFocused();
});

test('phone and OTP enforce exact lengths, normalize Persian digits and reject oversized paste', async ({
  page,
}) => {
  const calls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/client/auth/')) calls.push(request.url());
  });
  await page.goto('/enter');
  const phone = page.getByRole('textbox', { name: 'شماره همراه', exact: true });
  await expect(phone).toHaveAttribute('maxlength', '11');
  for (const value of ['0912000010', '08120000101']) {
    await phone.fill(value);
    await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
    await expect(phone).toHaveAttribute('aria-invalid', 'true');
  }
  await phone.fill('');
  await phone.evaluate((node) => {
    const data = new DataTransfer();
    data.setData('text', '091200001019');
    node.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    );
  });
  await expect(phone).toHaveValue('');
  expect(calls).toHaveLength(0);
  await captureExactState(page, ['MK-332'], 'Incomplete phone validation; no challenge sent.');
  await phone.fill('۰۹۱۲۰۰۰۰۱۰۱');
  await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
  const otp = page.getByRole('textbox', { name: 'کد ورود', exact: true });
  await expect(otp).toBeVisible();
  await expect(otp).toHaveAttribute('maxlength', '6');
  await otp.fill('12345');
  await expect(page.getByRole('button', { name: 'تأیید و ادامه', exact: true })).toBeDisabled();
  await expect(otp).toHaveAttribute('aria-invalid', 'false');
  await otp.fill('');
  await otp.evaluate((node) => {
    const data = new DataTransfer();
    data.setData('text', '1234567');
    node.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    );
  });
  await expect(otp).toHaveValue('');
  expect(calls.filter((url) => url.endsWith('/verify'))).toHaveLength(0);
  await otp.fill('۱۲۳۴۵۶');
  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page).toHaveURL(/\/personal\/workspaces/);
  expect(calls.filter((url) => url.endsWith('/challenge'))).toHaveLength(1);
  expect(calls.filter((url) => url.endsWith('/verify'))).toHaveLength(1);
});

test('an invalid server OTP preserves the challenge and input until a valid explicit retry', async ({
  page,
}) => {
  await page.goto('/enter');
  await page.getByRole('textbox', { name: 'شماره همراه', exact: true }).fill('09120000101');
  await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
  const otp = page.getByRole('textbox', { name: 'کد ورود', exact: true });
  await otp.fill('000000');
  await page.getByRole('button', { name: 'تأیید و ادامه', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(otp).toHaveValue('000000');
  await expect(page).toHaveURL(/\/enter$/);
  await captureExactState(page, ['MK-333']);
  await otp.fill('123456');
  await page.getByRole('button', { name: 'تأیید و ادامه', exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/workspaces/);
});

test('server rate limiting preserves the phone and prevents automatic or Enter-triggered challenge retries', async ({
  page,
  request,
}) => {
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/auth/otp/challenges', method: 'POST', status: 429, retryAfter: 120 },
  });
  await page.goto('/enter');
  const phone = page.getByRole('textbox', { name: 'شماره همراه', exact: true });
  await phone.fill('09120000101');
  const action = page.getByRole('button', { name: 'دریافت کد تأیید', exact: true });
  await action.click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(action).toBeDisabled();
  await expect(phone).toHaveValue('09120000101');
  await captureExactState(page, ['MK-334']);
  await phone.press('Enter');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((row: { path: string }) => row.path === '/api/v1/auth/otp/challenges'),
  ).toHaveLength(1);
});

test('all invitation entry points converge on one inbox', async ({ page, context }) => {
  await login(context);
  await page.goto('/personal/invitations');
  await expect(page).toHaveURL(/\/personal\/education\/invitations$/);
  await expect(page.getByRole('heading', { name: 'دعوت‌های من', exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'دعوت‌ها در آموزشگاه', exact: true })).toHaveCount(0);
  await page.goto('/personal/settings');
  await page.goto('/personal/education');
  const invitationLink = page
    .getByRole('navigation', { name: 'دسترسی سریع', exact: true })
    .getByRole('link', { name: 'دعوت‌ها', exact: true });
  await expect(invitationLink).toHaveAttribute('href', '/personal/education/invitations');
  await invitationLink.click();
  await expect(page.getByRole('region', { name: 'دعوت‌های دریافتی', exact: true })).toHaveCount(1);
});

test('V6 entry action fills mobile and stays compact at the reading edge on larger screens', async ({
  page,
}) => {
  await page.goto('/enter');
  for (const width of [320, 390, 834, 1024, 1440, 1920, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const action = page.getByRole('button', { name: 'دریافت کد تأیید', exact: true });
    await expect(action).toBeInViewport();
    const box = (await action.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(width < 768 ? 890 : 888);
    if (width < 768) {
      const inset = 16;
      expect(box.x).toBe(inset);
      expect(box.width).toBe(width - inset * 2);
    } else {
      expect(box.width).toBeLessThan(220);
      expect(Math.abs(box.x + box.width - (width - 24))).toBeLessThan(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('mobile phone and OTP reading columns cannot collapse through percentage sizing and containment', async ({
  page,
}) => {
  await page.goto('/enter');
  const assertColumn = async (otp = false) => {
    const column = page.locator('[data-auth-layout] .rx-workspace');
    for (const width of [320, 360, 390, 430, 600, 718, 767, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const box = (await column.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(Math.min(width - 32, 440));
      expect(box.x).toBeGreaterThanOrEqual(12);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 12);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (otp) {
        const input = page.getByLabel('کد ورود', { exact: true });
        expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(240);
        await expect(input).toBeEditable();
      } else {
        expect(
          (await page.getByLabel('شماره همراه', { exact: true }).boundingBox())!.width,
        ).toBeGreaterThanOrEqual(240);
      }
    }
  };
  await assertColumn();
  await page.getByLabel('شماره همراه', { exact: true }).fill('09120000102');
  await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await assertColumn(true);
});
