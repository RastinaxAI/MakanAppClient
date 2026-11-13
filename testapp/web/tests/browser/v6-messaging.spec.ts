import { test, expect, login, fixture, ids, origin } from './test';
import * as copy from '../../src/content/fa';
import type { Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const t = copy.v6Ui;

async function voiceCapture(page: Page, name: string) {
  const out =
    process.env.MAKAN_MESSENGER_EVIDENCE || '/tmp/makan-messenger-pdf-20261113/browser-evidence';
  await mkdir(out, { recursive: true });
  await page.screenshot({ path: `${out}/${name}.png`, animations: 'disabled' });
  await writeFile(
    `${out}/${name}.json`,
    JSON.stringify(
      {
        synthetic: true,
        source: 'real Next.js client; explicit fake MediaRecorder and silent WAV fixture',
        reference: 'Light/Dark 52-56',
        build: (await readFile('.next/BUILD_ID', 'utf8')).trim(),
        ...(await page.evaluate(() => ({
          route: location.pathname,
          width: innerWidth,
          height: innerHeight,
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }))),
      },
      null,
      2,
    ),
  );
}

// The PDF uses send instead of microphone when a text draft exists.
async function openVoice(page: Page) {
  const microphone = page.getByRole('button', { name: t.voiceRecord, exact: true });
  if (await microphone.isVisible()) {
    await microphone.click();
    return microphone;
  }
  const attachment = page.getByRole('button', { name: copy.text_01eac8227680, exact: true });
  await attachment.click();
  await page.getByRole('menuitem', { name: t.voiceRecord, exact: true }).click();
  return attachment;
}

test('main messenger search discovers permitted usernames and starts the same personal conversation without changing school', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/design');
  const before = await login(context);
  await page.goto('/personal/messages');
  await page.getByRole('textbox', { name: 'جستجوی گفتگوها', exact: true }).fill('@maryam');
  await page.getByRole('button', { name: 'انجام جستجوی گفتگو', exact: true }).click();
  const results = page.locator('[data-main-people-results]');
  await results.getByRole('link', { name: t.showContact('مریم رضایی'), exact: true }).click();
  const dialog = page.locator('[data-v5-scene="MSG-03"]');
  await expect(dialog.getByText(t.phonePrivate, { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: t.startPersonalConversation, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(ids.chat));
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  const after = await (await context.request.get('/api/client/session')).json();
  expect(after.context).toEqual(before.context);
  expect(after.revision).toBe(before.revision);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.some(
      (r: { path: string; query: { q?: string } }) =>
        r.path === '/api/v1/people/search' && r.query.q === 'maryam',
    ),
  ).toBe(true);
  expect(
    state.requests.find(
      (r: { path: string; method: string }) =>
        r.path === '/api/v1/conversations/direct' && r.method === 'POST',
    ).body,
  ).toEqual({ targetUserId: '00000000-0000-4000-8000-000000000102', scope: 'Personal' });
});

test('an official view retains the server cursor and does not claim an empty result before later pages', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/inbox-pages', {
    data: { personal: 31, organization: 31, officialLast: true },
  });
  await login(context, 'Teacher');
  await page.goto('/personal/messages');
  await page.getByRole('button', { name: t.officialFilter, exact: true }).click();
  await expect(page.getByText(t.moreFiltered, { exact: true })).toBeVisible();
  const more = page.getByRole('button', { name: 'گفتگوهای بیشتر', exact: true });
  const nextPage = page.waitForResponse(
    (r) => r.url().includes('conversations/account') && r.url().includes('Cursor'),
  );
  await more.click();
  await nextPage;
  await expect(page.getByText(t.moreFiltered, { exact: true })).toBeVisible();
  await expect(more).toBeEnabled();
  const lastPage = page.waitForResponse(
    (r) => r.url().includes('conversations/account') && r.url().includes('Cursor'),
  );
  await more.click();
  await lastPage;
  await expect(page.getByText('گفتگوی رسمی 31', { exact: true })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const reads = state.requests.filter(
    (r: { path: string }) => r.path === '/api/v1/conversations/account',
  );
  expect(reads[0].query.Filter).toBe('All');
  const officialReads = reads.filter(
    (r: { query: { Filter: string } }) => r.query.Filter === 'All',
  );
  expect(officialReads.length).toBeGreaterThanOrEqual(3);
  for (const read of reads) {
    expect(['Direct', 'All']).toContain(read.query.Filter);
    expect(read.query.view).toBeUndefined();
    if (read.query.Cursor) expect(read.query.Filter).toBe('All');
  }
  expect(state.requests.some((r: { query: { Cursor?: string } }) => !!r.query.Cursor)).toBe(true);
});

test('deleting a saved contact is private to its account and does not delete the existing conversation', async ({
  page,
  context,
  request,
  browser,
}) => {
  await request.post(fixture + '/__test__/design');
  await login(context);
  await page.goto('/personal/contacts');
  await page.getByRole('button', { name: t.showContact('مریم رضایی'), exact: true }).click();
  const detail = page.locator('[data-v5-scene="CON-08"]');
  await detail.getByRole('button', { name: copy.text_dae770ce3334, exact: true }).click();
  const edit = page.getByRole('dialog', { name: copy.text_dae770ce3334, exact: true });
  await edit.getByRole('button', { name: copy.text_539f52498828, exact: true }).click();
  await expect(
    page.getByRole('button', { name: t.showContact('مریم رضایی'), exact: true }),
  ).toHaveCount(0);
  await page.goto('/personal/messages/' + ids.chat);
  await expect(page.getByRole('textbox', { name: 'متن پیام', exact: true })).toBeVisible();
  const other = await browser.newContext();
  try {
    await login(other, 'Parent');
    const s = await (await other.request.get(origin + '/api/client/session')).json();
    const list = await (
      await other.request.get(
        origin + '/api/client/backend/api/v1/contacts?page=1&pageSize=20&favoritesOnly=false&q=',
        { headers: { 'X-Makan-Context': s.revision } },
      )
    ).json();
    expect(
      list.items.some(
        (r: { contactUserId: string }) =>
          r.contactUserId === '00000000-0000-4000-8000-000000000102',
      ),
    ).toBe(true);
  } finally {
    await other.close();
  }
});

test('country-specific phone normalization never invents a member for an undiscoverable number', async ({
  page,
  context,
  request,
}) => {
  await login(context);
  await page.goto('/personal/contacts');
  await page.getByRole('button', { name: 'مخاطب جدید', exact: true }).click();
  await page.getByLabel(t.contactName, { exact: true }).fill('شمارهٔ خارجی');
  await page.getByLabel(t.country, { exact: true }).selectOption('GB');
  await page.getByLabel(t.contactPhone, { exact: true }).fill('۰۲۰ ۷۹۴۶ ۰۰۱۸');
  await page.getByRole('button', { name: t.saveContact, exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: t.contactNotFound })).toBeVisible();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.find((r: { path: string }) => r.path === '/api/v1/people/resolve').body,
  ).toEqual({ phoneNumber: '+442079460018', username: null });
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === '/api/v1/contacts' && r.method === 'POST',
    ),
  ).toHaveLength(0);
});

test('microphone permission is requested only on start and denial preserves the text draft without uploads', async ({
  page,
  context,
  request,
}) => {
  await page.addInitScript(() => {
    Object.assign(window, { voicePermissionRequests: 0 });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          (window as unknown as { voicePermissionRequests: number }).voicePermissionRequests++;
          throw new DOMException('Test permission denial', 'NotAllowedError');
        },
      },
    });
  });
  await login(context, 'Student', false);
  await page.goto('/personal/messages/' + ids.chat);
  const input = page.getByRole('textbox', { name: 'متن پیام', exact: true });
  await input.fill('پیش‌نویس بدون دسترسی میکروفن');
  const microphone = await openVoice(page);
  expect(
    await page.evaluate(
      () => (window as unknown as { voicePermissionRequests: number }).voicePermissionRequests,
    ),
  ).toBe(0);
  const dialog = page.getByRole('dialog', { name: t.voiceTitle, exact: true });
  await dialog.getByRole('button', { name: t.voiceStart, exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText(t.voiceDenied);
  await page.keyboard.press('Escape');
  await expect(microphone).toBeFocused();
  await expect(input).toHaveValue('پیش‌نویس بدون دسترسی میکروفن');
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.method === 'POST' && (r.path === '/api/v1/files' || r.path.endsWith('/messages')),
    ),
  ).toHaveLength(0);
});

for (const theme of ['light', 'dark'])
  test(`recording stop, discard, preview and send are separate; only confirmation uploads one voice message ${theme}`, async ({
    page,
    context,
    request,
  }) => {
    await context.addInitScript((value) => localStorage.setItem('makan-theme', value), theme);
    // Declared hardware fixture: no physical microphone or live service is used.
    await page.addInitScript(() => {
      Object.assign(window, { voiceTrackStops: 0 });
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => ({
            getTracks: () => [
              {
                stop: () => {
                  (window as unknown as { voiceTrackStops: number }).voiceTrackStops++;
                },
              },
            ],
          }),
        },
      });
      class Recorder {
        static isTypeSupported() {
          return false;
        }
        state = 'inactive';
        mimeType = 'audio/wav';
        onstop: (() => void) | null = null;
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onerror: (() => void) | null = null;
        start() {
          this.state = 'recording';
        }
        stop() {
          this.state = 'inactive';
          const bytes = new ArrayBuffer(1644),
            view = new DataView(bytes);
          const word = (offset: number, value: string) =>
            [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
          word(0, 'RIFF');
          view.setUint32(4, 1636, true);
          word(8, 'WAVE');
          word(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, 8000, true);
          view.setUint32(28, 16000, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          word(36, 'data');
          view.setUint32(40, 1600, true);
          setTimeout(() => {
            this.ondataavailable?.({ data: new Blob([bytes], { type: this.mimeType }) });
            this.onstop?.();
          }, 0);
        }
      }
      Object.defineProperty(window, 'MediaRecorder', { value: Recorder, configurable: true });
    });
    await login(context, 'Student', false);
    await page.setViewportSize({ width: 320, height: 540 });
    await page.goto('/personal/messages/' + ids.chat);
    expect(
      await page.evaluate(() => {
        const policy = (
          document as Document & { featurePolicy?: { allowsFeature(feature: string): boolean } }
        ).featurePolicy;
        return policy?.allowsFeature('microphone');
      }),
    ).toBe(true);
    await page.getByRole('textbox', { name: 'متن پیام', exact: true }).fill('توضیح صوت');
    await openVoice(page);
    const voice = page.getByRole('dialog', { name: t.voiceTitle, exact: true });
    for (let take = 0; take < 2; take++) {
      await voice.getByRole('button', { name: t.voiceStart, exact: true }).click();
      await expect(voice.getByRole('status')).toContainText(t.voiceRecording);
      if (!take) await voiceCapture(page, `voice-recording-${theme}-320`);
      await voice.getByRole('button', { name: t.voiceStop, exact: true }).click();
      await expect(voice.getByRole('slider')).toBeVisible();
      if (!take) await voiceCapture(page, `voice-preview-${theme}-320`);
      await expect(voice.locator('audio')).toHaveAttribute('src', /^blob:/);
      if (!take) await voice.getByRole('button', { name: t.voiceDelete, exact: true }).click();
    }
    let state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter(
        (r: { path: string; method: string }) => r.method === 'POST' && r.path === '/api/v1/files',
      ),
    ).toHaveLength(0);
    await voice.getByRole('button', { name: t.voiceUse, exact: true }).click();
    const sheet = page.getByRole('dialog', { name: copy.text_4314e718c6d3, exact: true });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('textbox')).toHaveValue('توضیح صوت');
    await sheet.getByRole('button', { name: /ارسال.*۱/ }).click();
    await expect(sheet).toHaveCount(0);
    await expect
      .poll(async () => {
        state = await (await request.get(fixture + '/__test__/state')).json();
        return state.requests.filter(
          (r: { path: string; method: string }) =>
            r.method === 'POST' && r.path === '/api/v1/conversations/' + ids.chat + '/messages',
        ).length;
      })
      .toBe(1);
    const sent = state.requests.find(
      (r: { path: string; method: string }) =>
        r.method === 'POST' && r.path === '/api/v1/conversations/' + ids.chat + '/messages',
    );
    expect(sent.body.kind).toBe('Voice');
    expect(sent.body.attachmentIds).toHaveLength(1);
    expect(
      state.requests.filter(
        (r: { path: string; method: string }) => r.method === 'POST' && r.path === '/api/v1/files',
      ),
    ).toHaveLength(1);
    expect(
      await page.evaluate(() => (window as unknown as { voiceTrackStops: number }).voiceTrackStops),
    ).toBe(2);
    await openVoice(page);
    await voice.getByRole('button', { name: t.voiceStart, exact: true }).click();
    await expect(voice.getByRole('status')).toContainText(t.voiceRecording);
    const track = (await voice
      .getByText(copy.messengerPdf.cancelRecording, { exact: true })
      .locator('..')
      .boundingBox())!;
    const start = track.x + track.width / 2;
    const y = track.y + track.height / 2;
    await page.mouse.move(start, y);
    await page.mouse.down();
    await page.mouse.move(start - 50, y);
    await voiceCapture(page, `voice-cancel-${theme}-320`);
    await page.mouse.move(start - 110, y);
    await page.mouse.up();
    await expect(voice).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as unknown as { voiceTrackStops: number }).voiceTrackStops),
    ).toBe(3);
    state = await (await request.get(fixture + '/__test__/state')).json();
    expect(
      state.requests.filter(
        (r: { path: string; method: string }) => r.method === 'POST' && r.path === '/api/v1/files',
      ),
    ).toHaveLength(1);
  });
