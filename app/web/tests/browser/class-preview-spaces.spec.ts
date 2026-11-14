import { test, expect, login, fixture } from './test';

async function setup(request: import('@playwright/test').APIRequestContext) {
  expect((await request.post(fixture + '/__test__/personal-class')).ok()).toBe(true);
}

test('the first independent-class card uses its real bound group and keeps the pending channel noninteractive', async ({
  page,
  context,
  request,
}) => {
  await setup(request);
  await login(context, 'Personal', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/extracurricular');
  const pair = page.locator('.link-pair[aria-label="گروه و کانال کلاس"]');
  await expect(pair.getByRole('link', { name: /^گروه کلاس/ })).toHaveAttribute(
    'href',
    '/personal/messages/00000000-0000-4000-8000-000000000950',
  );
  await expect(pair.getByRole('link', { name: /^کانال کلاس/ })).toHaveCount(0);
  await expect(pair).toContainText('در انتظار');
  await expect(page.getByRole('button', { name: 'بعدی', exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('link', { name: /درخواست‌های تشکیل من/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /دعوت‌های دریافتی/ })).toBeVisible();
});

for (const mismatch of ['pair', 'endpoint'])
  test(`a ${mismatch} from a different class cannot create an independent-class conversation link`, async ({
    page,
    context,
    request,
  }) => {
    await setup(request);
    await login(context, 'Personal', false);
    let inspected = false;
    await page.route('**/api/client/backend/api/v1/personal-classes/*/spaces', async (route) => {
      const response = await route.fetch();
      const pair = await response.json();
      if (mismatch === 'pair') pair.sourceId = '00000000-0000-4000-8000-000000000001';
      else pair.group.official.sourceId = '00000000-0000-4000-8000-000000000001';
      await route.fulfill({ response, json: pair });
      inspected = true;
    });
    try {
      await page.goto('/personal/extracurricular');
      await expect.poll(() => inspected).toBe(true);
      if (mismatch === 'pair')
        await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      else await expect(page.locator('.link-pair[aria-label="گروه و کانال کلاس"]')).toBeVisible();
      await expect(page.locator('.link-pair').getByRole('link')).toHaveCount(0);
    } finally {
      // A background query may still be entering the override after the final assertion.
      // Remove it before context teardown; only teardown errors are ignored.
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
  });
