import { test, expect, fixture, login } from './test';
import type { Page, APIRequestContext } from '@playwright/test';
import { mockPushBrowser } from '../fixtures/push-browser.mjs';
import { captureExactState } from './exact-state-capture';
import {
  v5NotificationDevices as t,
  v4_more,
  text_940319dcd7db as settingsTitle,
  text_313cbecb4dd3 as closeTitle,
  text_ab3c684df5df as personalWorkspace,
} from '../../src/content/fa';
const root = '/personal/settings/notifications';
const api = '/api/v1/notifications/devices';
const pattern = '**/api/client/backend' + api;
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const row = (n: number, platform = 'Web') => ({
  id: id(n),
  platform,
  createdAtUtc: '2026-11-05T10:00:00Z',
  lastSeenAtUtc: '2026-11-05T10:00:00Z',
  revokedAtUtc: null,
  isActive: true,
  version: '1',
});
async function seed(request: APIRequestContext, data: object = {}) {
  await request.post(fixture + '/__test__/notification-devices', { data });
}
async function writes(request: APIRequestContext, method = 'POST') {
  const state = await (await request.get(fixture + '/__test__/state')).json();
  return state.requests.filter(
    (r: { path: string; method: string }) => r.path.startsWith(api) && r.method === method,
  );
}
async function browserState(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('makan:test-push-browser:v1') || 'null'),
  );
}
async function enable(page: Page) {
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByText(t.registered, { exact: true })).toBeVisible();
}

test('an invalid service key cannot open a native permission prompt', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.route(pattern + '/web-push/configuration', (route) =>
    route.fulfill({ json: { isConfigured: true, vapidPublicKey: 'invalid-key' } }),
  );
  await page.goto(root + '/device');
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByText(t.key, { exact: true })).toBeVisible();
  expect((await browserState(page))?.requests || 0).toBe(0);
  expect(await writes(request)).toHaveLength(0);
});

test('a different existing application key is neither replaced nor unsubscribed silently', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context, { permission: 'granted' });
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await expect(page.getByRole('button', { name: t.enable, exact: true })).toBeEnabled();
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('makan:test-push-browser:v1') || 'null') || {
      permission: 'granted',
      requests: 0,
      subscribes: 0,
      messages: [],
    };
    value.applicationKey = [4, ...Array(64).fill(0)];
    localStorage.setItem('makan:test-push-browser:v1', JSON.stringify(value));
  });
  await page.reload();
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByText(t.key, { exact: true })).toBeVisible();
  const state = await browserState(page);
  expect(state.subscribes).toBe(0);
  expect(state.unsubscribes || 0).toBe(0);
  expect(await writes(request)).toHaveLength(0);
});

test('failed local intent storage prevents a registration write and permits an explicit attempt after storage recovery', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as Window & { __restorePushStorage?: () => void }).__restorePushStorage = () => {
      Storage.prototype.setItem = original;
    };
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('makan:notification-registration:'))
        throw new DOMException('Declared storage fault', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByText(t.storage, { exact: true })).toBeVisible();
  expect(await writes(request)).toHaveLength(0);
  await page.evaluate(() =>
    (window as Window & { __restorePushStorage?: () => void }).__restorePushStorage?.(),
  );
  await enable(page);
  expect(await writes(request)).toHaveLength(1);
  expect((await browserState(page)).subscribes).toBe(1);
});

test('another account cannot inherit this browser label or silently take over its subscription', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await login(context, 'Parent', false);
  await page.goto(root + '/devices');
  await expect(page.getByText(t.empty, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: t.current, exact: true })).toHaveCount(0);
  await page.goto(root + '/device');
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.locator('[data-push-uncertain]')).toBeVisible();
  await expect(page.getByText(t.registered, { exact: true })).toHaveCount(0);
  expect(
    (await browserState(page)).messages.some(
      (message: { type: string; userId?: string }) =>
        message.type === 'PUSH_ENABLED' && message.userId === id(103),
    ),
  ).toBe(false);
  expect((await browserState(page)).unsubscribes || 0).toBe(0);
});

test('device deletion remains keyboard reachable with200percent text at320390430x400 without submitting on Escape', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 400 });
    await page.goto(root + '/devices');
    await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
    const trigger = page.getByRole('button', { name: t.android, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: t.deleteTitle });
    const confirm = dialog.getByRole('button', { name: t.delete, exact: true });
    await confirm.scrollIntoViewIfNeeded();
    await confirm.focus();
    const target = await confirm.evaluate((button) => {
      const r = button.getBoundingClientRect();
      return { height: r.height, visible: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) };
    });
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.visible).toBeGreaterThanOrEqual(44);
    for (let step = 0; step < 7; step++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  expect(await writes(request, 'DELETE')).toHaveLength(0);
});

test('explicit permission and a bound200 plus own active list are required before this browser is registered', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await expect(page.getByText(t.defaultPermission, { exact: true })).toBeVisible();
  expect((await browserState(page))?.requests || 0).toBe(0);
  expect(await writes(request)).toHaveLength(0);
  await captureExactState(
    page,
    ['MK-347'],
    'Declared mock browser permission default; real native device component and isolated service. No physical permission or delivery.',
  );
  await enable(page);
  expect((await browserState(page)).requests).toBe(1);
  expect((await writes(request))[0].body).toMatchObject({ expectedVersion: null });
  const association = await page.evaluate(
    () =>
      Object.entries(localStorage).find(([key]) =>
        key.startsWith('makan:notification-registration:v1:'),
      )?.[1],
  );
  expect(association).not.toContain('endpoint');
  expect(association).not.toContain('p256dh');
  expect(association).not.toContain('auth');
  await page.reload();
  await expect(page.getByText(t.registered, { exact: true })).toBeVisible();
  expect(await writes(request)).toHaveLength(1);
  await page.goto(root + '/devices');
  await expect(page.getByRole('button', { name: t.current, exact: true })).toBeVisible();
  await captureExactState(
    page,
    ['MK-348'],
    'Current browser correlation comes from this actual fixture registration acknowledgment, never the first Web item. Platform label is generic because the list has no device name.',
  );
});

for (const permission of ['denied', 'unsupported', 'not-configured'] as const)
  test(
    'device permission state ' + permission + ' neither prompts nor registers implicitly',
    async ({ page, context, request }) => {
      await seed(request, { configured: permission !== 'not-configured' });
      await mockPushBrowser(context, {
        permission: permission === 'denied' ? 'denied' : 'default',
        unsupported: permission === 'unsupported',
      });
      await login(context, 'Student', false);
      await page.goto(root + '/device');
      if (permission === 'denied') {
        await expect(page.getByText(t.denied, { exact: true })).toBeVisible();
        await captureExactState(
          page,
          ['MK-435'],
          'Browser API double explicitly denies notification permission; account preference is unchanged.',
        );
        const guide = page.getByRole('button', { name: t.guide, exact: true });
        await guide.click();
        const dialog = page.getByRole('dialog', { name: t.guideTitle });
        await expect(dialog.getByRole('link', { name: t.chromeHelp })).toHaveAttribute(
          'href',
          'https://support.google.com/chrome/answer/3220216',
        );
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(guide).toBeFocused();
      } else await expect(page.getByRole('button', { name: t.enable, exact: true })).toBeDisabled();
      expect((await browserState(page))?.requests || 0).toBe(0);
      expect(await writes(request)).toHaveLength(0);
    },
  );

test('dismissing the native permission leaves account preferences and registration unchanged', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context, { nextPermission: 'default' });
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toBeEnabled();
  await expect(page.getByText(t.defaultPermission, { exact: true })).toBeVisible();
  expect(await writes(request)).toHaveLength(0);
  expect((await browserState(page)).subscribes).toBe(0);
});

for (const mismatch of [
  'platform',
  'accepted202',
  'missing-active-row',
  'wrong-id',
  'changed-created-at',
  'lost-first-ack',
] as const)
  test(
    'a ' + mismatch + ' response cannot claim browser registration or automatically repeat it',
    async ({ page, context, request }) => {
      await seed(request);
      await mockPushBrowser(context);
      await login(context, 'Student', false);
      await page.route(pattern + '/web-push', async (route) => {
        const response = await route.fetch();
        const data = await response.json();
        if (mismatch === 'lost-first-ack') return route.abort('failed');
        await route.fulfill({
          response,
          status: mismatch === 'accepted202' ? 202 : 200,
          json: {
            ...data,
            ...(mismatch === 'platform' ? { platform: 'Android' } : {}),
            ...(mismatch === 'wrong-id' ? { id: id(39999) } : {}),
            ...(mismatch === 'changed-created-at' ? { createdAtUtc: '2026-11-05T10:30:00Z' } : {}),
          },
        });
      });
      if (mismatch === 'missing-active-row')
        await page.route(pattern + '?**', async (route) => {
          const response = await route.fetch(),
            data = await response.json();
          await route.fulfill({
            response,
            json: {
              ...data,
              items: data.items.map((item: object) => ({ ...item, isActive: false })),
            },
          });
        });
      await page.goto(root + '/device');
      const button = page.getByRole('button', { name: t.enable, exact: true });
      await expect(button).toBeEnabled();
      await button.click();
      await expect(page.getByText(t.registered, { exact: true })).toHaveCount(0);
      if (['platform', 'accepted202', 'lost-first-ack'].includes(mismatch)) {
        await expect(page.locator('[data-push-uncertain]')).toBeVisible();
        await expect(button).toBeDisabled();
        await page.reload();
        await expect(page.locator('[data-push-uncertain]')).toBeVisible();
        await page.getByRole('button', { name: t.refresh, exact: true }).click();
        await expect(page.locator('[data-push-uncertain]')).toBeVisible();
      } else {
        await expect(page.getByText(t.unconfirmed, { exact: true })).toBeVisible();
        if (mismatch === 'changed-created-at') {
          await page.reload();
          await expect(page.getByText(t.unconfirmed, { exact: true })).toBeVisible();
          await page.getByRole('button', { name: t.refresh, exact: true }).click();
          await expect(page.getByText(t.unconfirmed, { exact: true })).toBeVisible();
          await expect(page.getByText(t.registered, { exact: true })).toHaveCount(0);
        }
      }
      expect(await writes(request)).toHaveLength(1);
      expect(
        (await browserState(page)).messages.some(
          (message: { type: string }) => message.type === 'PUSH_ENABLED',
        ),
      ).toBe(false);
    },
  );

test('a nullable acknowledgment version is valid once the matching active own row is read', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.route(pattern + '/web-push', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...(await response.json()), version: null } });
  });
  await page.goto(root + '/device');
  await enable(page);
  expect(await writes(request)).toHaveLength(1);
});

test('an existing Web row is never called this browser without its acknowledged subscription association', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { rows: [row(39001)] });
  await mockPushBrowser(context, { permission: 'granted' });
  await login(context, 'Student', false);
  await page.goto(root + '/devices');
  await expect(page.getByRole('button', { name: t.browser, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: t.current, exact: true })).toHaveCount(0);
  expect(await writes(request)).toHaveLength(0);
});

test('own registration lookup crosses list pages, survives responsive changes, and never treats count shrink as a permission grant', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { rows: Array.from({ length: 31 }, (_, i) => row(39000 + i)) });
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  // Put the confirmed registration beyond the first page without inventing another association.
  const session = await (await context.request.get('/api/client/session')).json();
  const response = await context.request.get(
    '/api/client/backend' + api + '?page=1&pageSize=100&includeRevoked=true',
    { headers: { 'X-Makan-Context': session.revision } },
  );
  expect(response.status()).toBe(200);
  const all = await response.json();
  await seed(request, { rows: [...all.items.slice(1), all.items[0]] });
  await page.reload();
  await expect(page.getByText(t.registered, { exact: true })).toBeVisible();
  await page.goto(root + '/devices');
  await page.getByRole('button', { name: 'بعدی', exact: true }).click();
  await expect(page.getByRole('button', { name: t.current, exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 400 });
  await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
  await seed(request, { rows: [] });
  await page.reload();
  await expect(page.getByText(t.empty, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'قبلی', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'قبلی', exact: true }).click();
  expect(await writes(request)).toHaveLength(1);
});

test('a native permission resolved after leaving the device view cannot register from an unmounted controller', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context, { deferPermission: true });
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  const button = page.getByRole('button', { name: t.enable, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect.poll(async () => (await browserState(page)).requests).toBe(1);
  await page.locator('.rx-head a[href="' + root + '"]:visible').click();
  await expect(
    page.getByRole('heading', { name: settingsTitle, exact: true }).first(),
  ).toBeVisible();
  await page.evaluate(() =>
    (
      window as Window & { __makanPushPermission?: (value: string) => void }
    ).__makanPushPermission?.('granted'),
  );
  expect(await writes(request)).toHaveLength(0);
  expect((await browserState(page)).subscribes).toBe(0);
});

test('frozen device deletion accepts only204, changes no session or account preference, and disables display only for this browser', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await page.goto(root + '/devices');
  await page.getByRole('button', { name: t.android, exact: true }).click();
  let dialog = page.getByRole('dialog', { name: t.deleteTitle });
  await captureExactState(
    page,
    ['MK-349'],
    'Frozen actual Android registration; deletion has not been submitted.',
  );
  await dialog.getByRole('button', { name: t.delete, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    (await browserState(page)).messages.filter(
      (message: { type: string }) => message.type === 'PUSH_DISABLED',
    ),
  ).toHaveLength(0);
  await page.getByRole('button', { name: t.current, exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: t.delete, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(t.empty, { exact: true })).toBeVisible();
  await expect(page.locator('.v5-scene .rx-head h1')).toBeFocused();
  expect(
    (await browserState(page)).messages.filter(
      (message: { type: string }) => message.type === 'PUSH_DISABLED',
    ),
  ).toHaveLength(1);
  expect((await browserState(page)).unsubscribes || 0).toBe(0);
  const deletes = await writes(request, 'DELETE');
  expect(deletes).toHaveLength(2);
  expect(deletes.every((r: { body: object }) => Object.keys(r.body).length === 0)).toBe(true);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.method !== 'GET' &&
        (r.path.includes('/notification-preferences') || r.path.includes('/sessions')),
    ),
  ).toHaveLength(0);
  await page.goto(root + '/device');
  await enable(page);
  expect((await writes(request)).at(-1).body.expectedVersion).toBe('2');
});

for (const mode of ['identity-changed', 'last-seen-only', 'accepted202'] as const)
  test(
    'delete review handles ' +
      mode +
      ' without guessing a version parameter or repeating an uncertain mutation',
    async ({ page, context, request }) => {
      await seed(request);
      await mockPushBrowser(context);
      await login(context, 'Student', false);
      await page.goto(root + '/devices');
      await page.getByRole('button', { name: t.android, exact: true }).click();
      const dialog = page.getByRole('dialog');
      if (mode !== 'accepted202')
        await page.route(pattern + '?**', async (route) => {
          const response = await route.fetch(),
            data = await response.json();
          await route.fulfill({
            response,
            json: {
              ...data,
              items: data.items.map((item: object) => ({
                ...item,
                ...(mode === 'identity-changed'
                  ? { platform: 'Ios' }
                  : { version: '8', lastSeenAtUtc: '2026-11-05T15:00:00Z' }),
              })),
            },
          });
        });
      else
        await page.route(pattern + '/' + id(39000), async (route) => {
          await route.fetch();
          await route.fulfill({ status: 202, body: '' });
        });
      await dialog.getByRole('button', { name: t.delete, exact: true }).click();
      if (mode === 'identity-changed') {
        await expect(dialog.getByText(t.changed)).toBeVisible();
        expect(await writes(request, 'DELETE')).toHaveLength(0);
      } else if (mode === 'last-seen-only') {
        await expect(dialog).toHaveCount(0);
        expect(await writes(request, 'DELETE')).toHaveLength(1);
      } else {
        await expect(dialog.getByRole('alert')).toBeVisible();
        await expect(page.getByText(t.removed, { exact: true })).toHaveCount(0);
        await dialog.getByRole('button', { name: t.refresh, exact: true }).click();
        await expect(dialog.getByText(t.noLongerActive)).toBeVisible();
        await expect(dialog.getByRole('button', { name: t.delete, exact: true })).toHaveCount(0);
        expect(await writes(request, 'DELETE')).toHaveLength(1);
      }
    },
  );

test('permission comparison uses actual account preferences, versioned saves and explicit read after a lost acknowledgment', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context, { permission: 'denied' });
  await login(context, 'Student', false);
  await page.goto(root + '/device?view=preferences');
  const messages = page.getByRole('switch', { name: 'اعلان پیام‌ها', exact: true });
  await expect(messages).toBeChecked();
  await captureExactState(
    page,
    ['RX-040'],
    'Actual personal Messages and Assignments preferences enabled; denied browser API double. Account and device are independent.',
  );
  const preferencePattern = '**/api/client/backend/api/v1/notification-preferences/Messages';
  await page.route(preferencePattern, async (route) => {
    await route.fetch();
    await route.abort('failed');
  });
  await messages.uncheck();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(messages).toBeDisabled();
  await expect(messages).not.toBeChecked();
  await page.unroute(preferencePattern);
  await page.getByRole('button', { name: t.reviewPreference, exact: true }).click();
  await expect(messages).toBeEnabled();
  await expect(messages).not.toBeChecked();
  await messages.check();
  await expect(messages).toBeEnabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const saves = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path.endsWith('/notification-preferences/Messages') && r.method === 'PUT',
  );
  expect(saves).toHaveLength(2);
  expect(saves[1].body.expectedRowVersion).toBe('2');
  expect((await browserState(page))?.requests || 0).toBe(0);
  expect(await writes(request)).toHaveLength(0);
  await page.getByRole('banner').getByRole('button', { name: v4_more, exact: true }).click();
  await page.getByRole('link', { name: t.devices, exact: true }).click();
  await expect(page.getByRole('heading', { name: t.devices, exact: true }).first()).toBeVisible();
});

test('a push-only account change preserves the returned inactive quiet-hour values', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context, { permission: 'denied' });
  await login(context, 'Student', false);
  await page.goto(root + '/device?view=preferences');
  await expect(page.getByRole('switch', { name: 'اعلان پیام‌ها', exact: true })).toBeChecked();
  const session = await (await context.request.get('/api/client/session')).json();
  const initialized = await context.request.put(
    '/api/client/backend/api/v1/notification-preferences/Messages',
    {
      headers: { Origin: 'http://127.0.0.1:3132', 'X-Makan-Context': session.revision },
      data: {
        pushEnabled: true,
        smsEnabled: false,
        quietHoursEnabled: false,
        quietHoursStartLocal: '22:00:00',
        quietHoursEndLocal: '08:00:00',
        timeZoneId: 'Asia/Tehran',
        expectedRowVersion: '1',
      },
    },
  );
  expect(initialized.status()).toBe(200);
  await page.reload();
  const messages = page.getByRole('switch', { name: 'اعلان پیام‌ها', exact: true });
  await messages.uncheck();
  await expect(messages).toBeEnabled();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const saves = state.requests.filter(
    (r: { path: string; method: string }) =>
      r.path.endsWith('/notification-preferences/Messages') && r.method === 'PUT',
  );
  expect(saves.at(-1).body).toMatchObject({
    pushEnabled: false,
    quietHoursEnabled: false,
    quietHoursStartLocal: '22:00:00',
    quietHoursEndLocal: '08:00:00',
    timeZoneId: 'Asia/Tehran',
    expectedRowVersion: '2',
  });
});

test('permission comparison retains the already confirmed active-browser state', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await page.goto(root + '/device?view=preferences');
  await expect(page.getByText(t.registered, { exact: true })).toBeVisible();
  await expect(page.getByText(t.granted, { exact: true })).toHaveCount(0);
  expect(await writes(request)).toHaveLength(1);
});

test('fresh confirmed revocation after an uncertain own-device delete stops local display and restores focus when the row is gone', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await page.goto(root + '/devices');
  const current = page.getByRole('button', { name: t.current, exact: true });
  await expect(current).toBeVisible();
  const registrationId = (await current.getAttribute('data-testid'))!.slice('push-device-'.length);
  await page.route(pattern + '/' + registrationId, async (route) => {
    await route.fetch();
    await route.fulfill({ status: 202, body: '' });
  });
  await current.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: t.delete, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(page.getByText(t.removed, { exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: t.refresh, exact: true }).click();
  await expect(dialog.getByText(t.noLongerActive)).toBeVisible();
  await expect
    .poll(
      async () =>
        (await browserState(page)).messages.filter(
          (message: { type: string }) => message.type === 'PUSH_DISABLED',
        ).length,
    )
    .toBe(1);
  await expect(page.locator('[data-testid="push-device-' + registrationId + '"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.v5-scene .rx-head h1')).toBeFocused();
  expect(await writes(request, 'DELETE')).toHaveLength(1);
});

test('an empty later device page cannot claim that the account has no registered devices', async ({
  page,
  context,
  request,
}) => {
  await seed(request, { rows: Array.from({ length: 31 }, (_, i) => row(39000 + i)) });
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/devices');
  await page.getByRole('button', { name: 'بعدی', exact: true }).click();
  await expect(page.getByRole('button', { name: 'قبلی', exact: true })).toBeEnabled();
  await seed(request, { rows: Array.from({ length: 10 }, (_, i) => row(39000 + i)) });
  await page.reload();
  await expect(page.getByRole('button', { name: 'قبلی', exact: true })).toBeEnabled();
  await expect(page.getByText(t.empty, { exact: true })).toHaveCount(0);
  await expect(page.getByText(t.emptyPage, { exact: true })).toBeVisible();
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 400 });
    await page.evaluate(() => (document.documentElement.dataset.reading = 'large'));
    const previous = page.getByRole('button', { name: 'قبلی', exact: true });
    await previous.scrollIntoViewIfNeeded();
    expect(
      await previous.evaluate((node) => node.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await captureExactState(
      page,
      ['MK-348'],
      'Declared pagination variant: current page2 is empty but the self-scoped service totalCount is10. No global empty-account claim;320/390/430x400,200percent text.',
    );
  }
});

test('closing a pending own-device delete still refreshes the list after its acknowledgment without another mutation', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await page.goto(root + '/devices');
  const current = page.getByRole('button', { name: t.current, exact: true });
  await expect(current).toBeVisible();
  const registrationId = (await current.getAttribute('data-testid'))!.slice('push-device-'.length);
  let release = () => {},
    arrived = false;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(pattern + '/' + registrationId, async (route) => {
    const response = await route.fetch();
    arrived = true;
    await held;
    await route.fulfill({ response });
  });
  try {
    await current.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: t.delete, exact: true }).click();
    await expect.poll(() => arrived).toBe(true);
    await dialog.getByRole('button', { name: closeTitle, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    release();
    await expect
      .poll(
        async () =>
          (await browserState(page)).messages.filter(
            (message: { type: string }) => message.type === 'PUSH_DISABLED',
          ).length,
      )
      .toBe(1);
    await expect(current).toHaveCount(0);
    await expect(page.getByRole('button', { name: t.android, exact: true })).toBeVisible();
    await expect(page.getByText(t.removed, { exact: true })).toHaveCount(0);
    expect(await writes(request, 'DELETE')).toHaveLength(1);
  } finally {
    release();
  }
});

test('a nullable preference acknowledgment remains a valid successful response', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/Assignments');
  await page.route(
    '**/api/client/backend/api/v1/notification-preferences/Assignments',
    async (route) => {
      if (route.request().method() !== 'PUT') return route.continue();
      const response = await route.fetch();
      await route.fulfill({ response, json: { ...(await response.json()), rowVersion: null } });
    },
  );
  await page.getByRole('switch', { name: 'پیامک', exact: true }).check();
  await page.getByRole('button', { name: 'ذخیره اعلان تکلیف', exact: true }).click();
  await expect(page.getByText('تنظیمات اعلان ثبت شد.', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
});

test('an empty string device version is retained as the recorded contract allows without another registration', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.route(pattern + '/web-push', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...(await response.json()), version: '' } });
  });
  await page.route(pattern + '?**', async (route) => {
    const response = await route.fetch(),
      data = await response.json();
    await route.fulfill({
      response,
      json: {
        ...data,
        items: data.items.map((item: { platform: string }) =>
          item.platform === 'Web' ? { ...item, version: '' } : item,
        ),
      },
    });
  });
  await page.goto(root + '/device');
  await enable(page);
  await page.reload();
  await expect(page.getByText(t.registered, { exact: true })).toBeVisible();
  expect(await writes(request)).toHaveLength(1);
});

test('an active school role retains its workspace while notification devices stay in the personal account scope', async ({
  page,
  context,
  request,
}) => {
  await seed(request);
  await mockPushBrowser(context);
  await login(context, 'Student', false);
  await page.goto(root + '/device');
  await enable(page);
  await login(context, 'Teacher', true);
  const before = await (await context.request.get('/api/client/session')).json();
  expect(before.context.workspaceType).toBe('Organization');
  expect(before.context.activeRole).toBe('Teacher');
  await page.goto(root + '/device');
  await expect(page.getByRole('banner').locator('.rx-crumb')).toHaveText(personalWorkspace);
  await page.goto(root + '/devices');
  await expect(page.getByText(t.empty, { exact: true })).toBeVisible();
  await expect(page.getByRole('banner').locator('.rx-crumb')).toHaveText(personalWorkspace);
  await expect(page.getByRole('button', { name: t.current, exact: true })).toHaveCount(0);
  const after = await (await context.request.get('/api/client/session')).json();
  expect(after.context).toEqual(before.context);
  expect(await writes(request)).toHaveLength(1);
});
