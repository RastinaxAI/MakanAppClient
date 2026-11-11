import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v5Product as t } from '../../src/content/fa';
import { integration80c, v4_more } from '../../src/content/fa';
const route = '/personal/extracurricular/requests/00000000-0000-4000-8000-000000001801';

for (const state of [
  {
    name: 'pending',
    channelState: 'Pending',
    ready: false,
    title: t.formationProgress,
    scenarios: ['MK-20', 'MK-290'],
  },
  {
    name: 'failed',
    channelState: 'Failed',
    ready: false,
    title: t.formationFailed,
    scenarios: ['MK-21', 'MK-291'],
  },
  {
    name: 'ready',
    channelState: 'Ready',
    ready: true,
    title: t.formationReady,
    scenarios: ['MK-22'],
  },
])
  test(`formation ${state.name} follows all returned preparation steps and cannot claim success from approval alone`, async ({
    page,
    context,
    request,
  }) => {
    await request.post(fixture + '/__test__/personal-class', {
      data: {
        formationProgress: {
          classState: 'Active',
          managerAccepted: true,
          groupState: 'Ready',
          channelState: state.channelState,
        },
      },
    });
    await login(context, 'Personal', false);
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: state.title, level: 1, exact: true }),
    ).toBeVisible();
    const progress = page.getByRole('progressbar', { name: t.formationProgress, exact: true });
    await expect(progress).toHaveAttribute('value', state.ready ? '4' : '3');
    await expect(page.locator('[data-formation-progress]')).toHaveAttribute(
      'data-formation-progress',
      state.ready ? 'Ready' : state.name === 'failed' ? 'Failed' : 'Pending',
    );
    await captureExactState(page, state.scenarios);
    await page.getByRole('button', { name: v4_more, exact: true }).click();
    const menu = page.getByRole('dialog');
    await expect(
      menu.getByRole('heading', { name: integration80c.history, exact: true }),
    ).toBeVisible();
    await captureExactState(
      page,
      ['MK-317'],
      'Existing authorized request history inside preparation view.',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: v4_more, exact: true })).toBeFocused();
    if (!state.ready)
      await expect(page.getByRole('link', { name: t.openClass, exact: true })).toHaveCount(0);
    const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
    expect(
      calls.filter(
        (row: { method: string; path: string }) =>
          row.method !== 'GET' && /\/(personal-classes|personal-class-requests)\//.test(row.path),
      ),
    ).toHaveLength(0);
  });

test('ready spaces cannot complete preparation before the designated manager accepts', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/personal-class', {
    data: {
      formationProgress: {
        classState: 'Active',
        managerAccepted: false,
        groupState: 'Ready',
        channelState: 'Ready',
      },
    },
  });
  await login(context, 'Personal', false);
  await page.goto(route);
  await expect(
    page.getByRole('heading', { name: t.formationProgress, level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: t.openClass, exact: true })).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '3');
});

test('a failed polled request cannot silently keep announcing a ready class and explicit retry restores authoritative progress', async ({
  page,
  context,
  request,
}) => {
  const start = new Date('2026-11-08T10:00:00Z');
  await page.clock.install({ time: start });
  await request.post(fixture + '/__test__/personal-class', {
    data: {
      formationProgress: {
        classState: 'Active',
        managerAccepted: true,
        groupState: 'Ready',
        channelState: 'Ready',
      },
    },
  });
  await login(context, 'Personal', false);
  let unavailable = false;
  await page.route(
    /\/api\/client\/backend\/api\/v1\/personal-class-requests\/00000000-0000-4000-8000-000000001801$/,
    (route) =>
      unavailable
        ? route.fulfill({
            status: 503,
            json: {
              code: 'FIXTURE_UNAVAILABLE',
              status: 503,
              traceId: 'fixture-only',
              correlationId: 'fixture-only',
            },
          })
        : route.continue(),
  );
  await page.goto(route);
  await expect(
    page.getByRole('heading', { name: t.formationReady, level: 1, exact: true }),
  ).toBeVisible();
  await page.clock.pauseAt(new Date(start.getTime() + 60000));
  await page.waitForLoadState('networkidle');
  await page.clock.runFor(100);
  unavailable = true;
  const failedRead = page.waitForResponse(
    (response) =>
      response.url().endsWith('/personal-class-requests/00000000-0000-4000-8000-000000001801') &&
      response.status() === 503,
  );
  await page.clock.runFor(11000);
  await failedRead;
  await page.clock.runFor(100);
  const error = page.getByRole('main').getByRole('alert');
  await expect(error).toBeVisible();
  await expect(
    page.getByRole('heading', { name: t.formationReady, level: 1, exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  unavailable = false;
  await page.clock.resume();
  await error.getByRole('button').click();
  await expect(
    page.getByRole('heading', { name: t.formationReady, level: 1, exact: true }),
  ).toBeVisible();
});
