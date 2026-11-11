import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v5Product as t, integration80c, serverAlignedUi as v9 } from '../../src/content/fa';
const path = '/personal/extracurricular/requests/new';

test('V5.1 three-step request validates the registered fields, preserves its draft and requires review before creating anything', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: {} });
  await login(context, 'Personal', false);
  await page.goto(path + '?step=details');
  const name = page.getByLabel(t.requestClassTitle, { exact: true });
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/step=details$/);
  await captureExactState(
    page,
    ['MK-277'],
    'Required contract fields are validated locally before any mutation.',
  );
  await name.fill('کارگاه داستان‌نویسی');
  await page
    .getByLabel(v9.requestPurpose, { exact: true })
    .fill('تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی.');
  await page.getByLabel('ظرفیت پیشنهادی', { exact: true }).fill('۳۰');
  await expect(page.getByLabel(v9.requestDescription, { exact: true })).toHaveValue('');
  await captureExactState(page, ['MK-13']);
  for (const width of [390, 834, 1440]) {
    await page.setViewportSize({ width, height: 1112 });
    await expect(name).toHaveValue('کارگاه داستان‌نویسی');
    const geometry = await page.evaluate(() => {
      const steps = document.querySelector('ol'),
        card = steps?.nextElementSibling;
      const a = steps?.getBoundingClientRect(),
        b = card?.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        stepsWidth: a?.width,
        cardWidth: b?.width,
      };
    });
    expect(geometry.overflow).toBe(false);
    expect(Math.abs(geometry.stepsWidth! - geometry.cardWidth!)).toBeLessThan(2);
  }
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await expect(page).toHaveURL(/step=management$/);
  await expect(
    page.getByRole('radio', { name: t.requestWithoutTeacher, exact: true }),
  ).toBeChecked();
  await expect(page.locator('ol > li')).toHaveCount(3);
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await expect(page).toHaveURL(/step=review$/);
  const save = page.getByRole('button', { name: integration80c.draft, exact: true });
  await expect(save).toBeDisabled();
  await page.getByRole('checkbox', { name: t.requestAcceptRules, exact: true }).check();
  await expect(save).toBeEnabled();
  await captureExactState(page, ['MK-16']);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(/step=management$/);
  await page.getByRole('banner').getByRole('link', { name: 'بازگشت', exact: true }).click();
  await expect(page).toHaveURL(/step=details$/);
  await page.reload();
  await expect(name).toHaveValue('کارگاه داستان‌نویسی');
  await expect(page.getByLabel('ظرفیت پیشنهادی', { exact: true })).toHaveValue('۳۰');
  await expect(page.getByLabel(v9.requestPurpose, { exact: true })).toHaveValue(
    'تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی.',
  );
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await page.evaluate(() => localStorage.setItem('makan-reading', 'large'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-reading', 'large');
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 500 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(save).toBeInViewport();
    await expect(
      page.getByRole('checkbox', { name: t.requestAcceptRules, exact: true }),
    ).toBeChecked();
  }
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    calls.filter(
      (r: { method: string; path: string }) =>
        r.method === 'POST' && r.path === '/api/v1/personal-class-requests',
    ),
  ).toHaveLength(0);
});

test('V5.1 review reconciles a lost Submit acknowledgement without creating a second request', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', { data: {} });
  await login(context, 'Personal', false);
  await page.goto(path + '?step=details');
  await page.getByLabel(t.requestClassTitle, { exact: true }).fill('کارگاه داستان‌نویسی');
  await page
    .getByLabel(v9.requestPurpose, { exact: true })
    .fill('نوشتن داستان کوتاه با بازخورد گروهی');
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await page.getByRole('button', { name: t.requestNext, exact: true }).click();
  await page.getByRole('checkbox', { name: t.requestAcceptRules, exact: true }).check();
  let lost = false;
  await page.route('**/personal-class-requests/*/submit', async (route) => {
    if (!lost) {
      lost = true;
      await route.fetch();
      await route.abort('failed');
    } else await route.continue();
  });
  await page.getByRole('button', { name: t.requestSubmitReview, exact: true }).click();
  await expect(page.getByText(t.requestReconcileDraft, { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert').first()).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: t.requestSubmitReview, exact: true }).click();
  await expect(page).toHaveURL(/requests\/[a-f0-9-]{36}$/);
  await expect(
    page.getByText(integration80c.states.Submitted, { exact: true }).first(),
  ).toBeVisible();
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const creates = calls.filter(
    (r: { path: string; method: string }) =>
      r.method === 'POST' && r.path === '/api/v1/personal-class-requests',
  );
  const submits = calls.filter(
    (r: { path: string; method: string }) =>
      r.method === 'POST' && /personal-class-requests\/[^/]+\/submit$/.test(r.path),
  );
  expect(creates).toHaveLength(1);
  expect(submits).toHaveLength(1);
  expect(Object.keys(creates[0].body.details).sort()).toEqual(
    [
      'title',
      'purpose',
      'description',
      'suggestedCapacity',
      'suggestedManagerUserId',
      'suggestedTeacherUserId',
    ].sort(),
  );
  expect(Object.keys(submits[0].body)).toEqual(['expectedVersion']);
});
