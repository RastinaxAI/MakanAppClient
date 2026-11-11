import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('ordinary runtime sends the development studio to the real assistant and never mounts sample sources or answers', async ({
  page,
  context,
  request,
}, info) => {
  await context.route('**/*', (route) =>
    ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
  await request.post('http://127.0.0.1:3459/__test__/reset');
  const headers = { Origin: 'http://127.0.0.1:3159' };
  const phoneNumber = '09120000101';
  const challenge = await context.request.post('/api/client/auth/challenge', {
    headers,
    data: { phoneNumber },
  });
  expect(challenge.status()).toBe(202);
  const verified = await context.request.post('/api/client/auth/verify', {
    headers,
    data: {
      phoneNumber,
      challengeId: (await challenge.json()).challengeId,
      code: '123456',
      deviceName: 'Isolated ordinary-runtime check',
    },
  });
  expect(verified.status()).toBe(200);
  await page.goto('/personal/assistant/studio?demo=1#samples');
  await expect(page).toHaveURL((url) => url.pathname === '/personal/assistant' && !url.search);
  await expect(page.locator('[data-v5-scene="MK-38"]')).toBeVisible();
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
  await expect(page.locator('a[href="/personal/assistant/studio"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'دیدن منابع نمونه', exact: true })).toHaveCount(0);
  await expect(page.locator('[data-assistant-response],[data-app-render-error]')).toHaveCount(0);
  await info.attach('ordinary-runtime-evidence', {
    contentType: 'application/json',
    body: Buffer.from(
      JSON.stringify({
        productBuildId: (await readFile('.next/BUILD_ID', 'utf8')).trim(),
        runtime: 'production without MAKAN_TEST_MODE; isolated fixture backend only',
        route: new URL(page.url()).pathname,
        developmentSamplesMounted: false,
        liveServiceCalls: false,
      }),
    ),
  });
  await page.screenshot({
    path: info.outputPath('ordinary-assistant.png'),
    animations: 'disabled',
  });
});
