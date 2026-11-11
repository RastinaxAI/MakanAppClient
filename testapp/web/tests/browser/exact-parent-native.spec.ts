import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { openParentChildren, selectParentChild, parentChildButton } from './parent-controls';
import { v4_more, v5Parent as t } from '../../src/content/fa';
const root = '/personal/education';
const first = '00000000-0000-4000-8000-000000000501';
const second = '00000000-0000-4000-8000-000000000502';
const foreign = '00000000-0000-4000-8000-000000000503';

test('native child rows preserve the acknowledged child after a failed switch, hide foreign organizations and keep program navigation deep', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/parent-case', { data: { foreignChild: true } });
  await login(context, 'Parent');
  await page.goto(root);
  await expect(page.locator('[data-v5-scene="MK-116"]')).toBeVisible();
  await expect(page.getByTestId('child-' + foreign)).toHaveCount(0);
  await selectParentChild(page, first);
  await expect(page.locator('[data-v5-scene="MK-117"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'نازنین موسوی', exact: true })).toBeVisible();
  await captureExactState(page, ['MK-117']);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.rx-tabbar:visible')).toHaveCount(0);
  await openParentChildren(page);
  const selected = parentChildButton(page, first);
  const target = parentChildButton(page, second);
  await expect(selected).toHaveAttribute('aria-pressed', 'true');
  await captureExactState(
    page,
    ['MK-116'],
    'Two active authorized children in the same organization; a foreign child requires a separate workspace and is excluded.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/children/' + second + '/select', method: 'POST', delay: 1200, status: 503 },
  });
  await target.click();
  await expect(target).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'نازنین موسوی', exact: true })).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(selected).toHaveAttribute('aria-pressed', 'true');
  const session = await (await context.request.get('/api/client/session')).json();
  expect(session.context.subjectOrganizationPersonId).toBe(first);
  await target.click();
  await expect(page.getByRole('heading', { name: 'امیر موسوی', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'نازنین موسوی', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'امیر موسوی', exact: true })).toBeVisible();
});

test('parent result tabs retain delivery status while unpublished scores and private notes remain absent from rows, context and details', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/parent-case', { data: {} });
  await login(context, 'Parent');
  await page.goto(root);
  await selectParentChild(page, first);
  await expect(page.locator('[data-v5-scene="MK-117"]')).toBeVisible();
  await page.route('**/api/client/backend/api/v1/reports/parent/assignments?**', async (route) => {
    const response = await route.fetch(),
      data = await response.json();
    await route.fulfill({
      response,
      json: {
        ...data,
        items: data.items.map((item: Record<string, unknown>, index: number) =>
          index
            ? {
                ...item,
                releasedScore: 19,
                releasedAtUtc: null,
                guardianVisibleFeedback: 'بازخورد پیش از انتشار نباید دیده شود',
              }
            : { ...item, privateTeacherNote: 'یادداشت خصوصی نباید دیده شود' },
        ),
      },
    });
  });
  await page.goto(root + '/assignments');
  await expect(page.locator('[data-v5-scene="MK-118"]')).toBeVisible();
  await expect(page.locator('.v5-row').first()).toContainText('۱۸');
  await expect(page.locator('.v5-row').nth(1)).toContainText(t.unreleasedResult);
  await expect(page.getByText('بازخورد پیش از انتشار نباید دیده شود', { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText('یادداشت خصوصی نباید دیده شود', { exact: true })).toHaveCount(0);
  await captureExactState(
    page,
    ['MK-118'],
    'Actual selected Parent context; released date/score required. Adversarial unpublished numeric score and feedback are not rendered.',
  );
  await page.locator('.v5-row').nth(1).getByRole('button').click();
  let dialog = page.getByRole('dialog', { name: 'مرور معادله', exact: true });
  await expect(dialog).toContainText('نازنین موسوی');
  await expect(dialog).toContainText(t.unreleasedResult);
  await expect(dialog).not.toContainText('۱۹');
  await expect(dialog).not.toContainText('بازخورد پیش از انتشار');
  await page.keyboard.press('Escape');
  await page.locator('.v5-row').first().click();
  dialog = page.getByRole('dialog', { name: 'تمرین فصل دوم', exact: true });
  await expect(dialog).toContainText('راه‌حل منظم است.');
  await page.keyboard.press('Escape');
  const tabs = page.getByRole('navigation', { name: t.resultTypes, exact: true });
  await tabs.getByRole('link', { name: t.exams, exact: true }).click();
  await expect(tabs.getByRole('link', { name: t.exams, exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.locator('.v5-row').first()).toContainText('۱۷٫۵');
  await page.reload();
  await expect(tabs.getByRole('link', { name: t.exams, exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('an ended guardian relation removes open results, blocks fresh reads and returns focus to the authorized child list', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/parent-case', { data: {} });
  await login(context, 'Parent');
  await page.goto(root);
  await selectParentChild(page, first);
  await expect(page.locator('[data-v5-scene="MK-117"]')).toBeVisible();
  await page.goto(root + '/assignments');
  await page.locator('.v5-row').first().click();
  await expect(page.getByRole('dialog', { name: 'تمرین فصل دوم', exact: true })).toBeVisible();
  await request.post(fixture + '/__test__/parent-children', {
    data: {
      children: [
        {
          learnerOrganizationPersonId: first,
          displayName: 'نازنین موسوی',
          relationStatus: 'Ended',
        },
        {
          learnerOrganizationPersonId: second,
          displayName: 'امیر موسوی',
          relationStatus: 'Active',
        },
      ],
    },
  });
  const dialog = page.getByRole('dialog', { name: t.changedAccess, exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'تمرین فصل دوم', exact: true })).toHaveCount(0);
  await expect(page.getByText('راه‌حل منظم است.', { exact: true })).toHaveCount(0);
  const session = await (await context.request.get('/api/client/session')).json();
  expect(
    (
      await context.request.get('/api/client/backend/api/v1/reports/parent/assignments', {
        headers: { 'X-Makan-Context': session.revision },
      })
    ).status(),
  ).toBe(403);
  await captureExactState(
    page,
    ['RX-018'],
    'Actual Parent role; the inventory Teacher label is inconsistent with the guardian content and remains a reference-role ambiguity.',
  );
  await dialog.getByRole('button', { name: t.backToChildren, exact: true }).click();
  await expect(page).toHaveURL(/\/personal\/education\?view=children#parent-children$/);
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-parent-children]')).toBeFocused();
  await expect(parentChildButton(page, first)).toBeDisabled();
  await selectParentChild(page, second);
  await expect(page.getByRole('heading', { name: 'امیر موسوی', exact: true })).toBeVisible();
});

for (const mismatch of ['organization', 'learner'])
  test(
    'a parent dashboard from another ' + mismatch + ' cannot populate program rows or context',
    async ({ page, context, request }) => {
      await request.post(fixture + '/__test__/parent-case', { data: {} });
      await login(context, 'Parent');
      await page.route('**/api/client/backend/api/v1/dashboards/parent', async (route) => {
        const response = await route.fetch(),
          data = await response.json();
        await route.fulfill({
          response,
          json: {
            ...data,
            ...(mismatch === 'organization'
              ? { organizationId: '00000000-0000-4000-8000-000000009999' }
              : {
                  selectedLearner: {
                    learnerOrganizationPersonId: second,
                    displayName: 'فرزند دیگر',
                  },
                }),
            upcomingSessions: data.upcomingSessions.map((item: Record<string, unknown>) => ({
              ...item,
              title: 'برنامه خصوصی فرزند دیگر',
            })),
          },
        });
      });
      await page.goto(root);
      await selectParentChild(page, first);
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(page.getByText('برنامه خصوصی فرزند دیگر', { exact: true })).toHaveCount(0);
      await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
      await expect(page.getByRole('dialog')).not.toContainText('برنامه خصوصی فرزند دیگر');
    },
  );
