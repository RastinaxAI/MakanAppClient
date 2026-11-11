import { test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { observedConversationRole } from './exact-evidence';

let sequence = 0;
/** Awaited, native CSS-viewport evidence at a checked point in a real fixture flow. */
export async function captureExactState(
  page: Page,
  scenarios: string[],
  detail = '',
  options: { prepareViewport?: (page: Page) => Promise<void>; allowLoading?: boolean } = {},
) {
  if (process.env.MAKAN_EXACT_UI_EVIDENCE !== 'true') return;
  const run = process.env.MAKAN_EXACT_UI_RUN ?? '';
  if (run && !/^[a-z0-9_-]{1,64}$/.test(run)) throw new Error('Invalid evidence run name');
  const info = test.info();
  const key =
    (run ? run + '-' : '') +
    scenarios[0] +
    '-' +
    createHash('sha256')
      .update(info.testId + detail)
      .digest('hex')
      .slice(0, 10) +
    '-' +
    ++sequence;
  const folder = 'output/review/exact-v1/states-native';
  await mkdir(folder, { recursive: true });
  const viewport = page.viewportSize();
  const preference = await page.evaluate(() => localStorage.getItem('makan-theme'));
  const session = await (await page.context().request.get('/api/client/session'))
    .json()
    .catch(() => ({}));
  const observedRole = session.user
    ? await observedConversationRole(page.context(), page.url(), session.user.id, session.revision)
    : undefined;
  const identity = {
    role: session.user ? session.context?.activeRole || 'Personal' : 'Public',
    workspaceType: session.user ? session.context?.workspaceType : 'Anonymous',
    conversationRole:
      observedRole ||
      (
        { 'مالک گفتگو': 'Owner', 'مدیر گفتگو': 'Admin', 'عضو گفتگو': 'Member' } as Record<
          string,
          string
        >
      )[
        await page.locator('.rx-head .grow > p').evaluateAll((nodes) => nodes[0]?.textContent || '')
      ],
    conversationRoleEvidence: observedRole
      ? 'observed current-context ManagedConversationResult'
      : 'rendered participant caption, if available',
  };
  const records = [];
  const productBuildId = (await readFile('.next/BUILD_ID', 'utf8')).trim();
  const expectedDialogs = await page
    .locator('[role="dialog"]:visible')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.querySelector('h2')?.textContent || '').filter(Boolean),
    );
  const expectedGroups = await page
    .locator('[role="group"][aria-label]:visible')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label') || ''));
  const expectedMenus = await page
    .locator('[role="menu"]:visible')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() || '').filter(Boolean));
  try {
    await page
      .locator('.bootstrap:visible:not([data-app-render-error])')
      .first()
      .waitFor({ state: 'hidden' });
    if (await page.locator('[data-app-render-error]').isVisible())
      throw new Error('The application render boundary cannot verify a design state.');
    if (!options.allowLoading)
      await page.locator('.skeleton-wrap:visible').first().waitFor({ state: 'hidden' });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => {
        localStorage.setItem('makan-theme', theme);
        window.dispatchEvent(new Event('makan-theme-changed'));
      }, theme);
      for (const [width, height] of [
        [390, 844],
        [834, 1112],
        [1440, 1000],
      ]) {
        await page.setViewportSize({ width, height });
        await options.prepareViewport?.(page);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        const state = await page.evaluate(() => {
          const visible = (e: Element) =>
            !!e.getBoundingClientRect().height && getComputedStyle(e).visibility !== 'hidden';
          const rect = (e: Element) => {
            const r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          };
          return {
            renderError: [...document.querySelectorAll('[data-app-render-error]')].some(visible),
            fontReady: document.fonts.check('16px Vazirmatn'),
            route: location.pathname + location.search,
            theme: document.documentElement.dataset.theme,
            reading: document.documentElement.dataset.reading,
            headings: [...document.querySelectorAll('h1,h2,h3')]
              .filter(visible)
              .map((e) => e.textContent),
            dialogs: [...document.querySelectorAll('[role="dialog"],[role="menu"]')]
              .filter(visible)
              .map((e) => ({ text: e.textContent, rect: rect(e) })),
            groups: [...document.querySelectorAll('[role="group"][aria-label]')]
              .filter(visible)
              .map((e) => e.getAttribute('aria-label')),
            fields: [
              ...document.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              >('input:not([type="hidden"]),textarea,select'),
            ]
              .filter(visible)
              .map((e) => ({
                label: e.getAttribute('aria-label') || e.labels?.[0]?.textContent,
                rect: rect(e),
              })),
            buttons: [...document.querySelectorAll<HTMLButtonElement>('button')]
              .filter(visible)
              .slice(0, 50)
              .map((button) => ({
                name: button.getAttribute('aria-label') || button.textContent?.trim(),
                rect: rect(button),
                disabled: button.disabled,
                busy: button.getAttribute('aria-busy'),
                focus: button === document.activeElement,
                outlineWidth: getComputedStyle(button).outlineWidth,
              })),
            focus:
              document.activeElement?.getAttribute('aria-label') ||
              document.activeElement?.id ||
              document.activeElement?.tagName,
            documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            horizontalOverflow: [
              ...document.querySelectorAll(
                'main,form,fieldset,header,footer,nav,section,aside,input,textarea,select',
              ),
            ]
              .filter(visible)
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return r.width && (r.left < -1 || r.right > innerWidth + 1);
              })
              .map((e) => ({ tag: e.tagName, rect: rect(e) }))
              .slice(0, 20),
          };
        });
        if (state.renderError)
          throw new Error('The application render boundary cannot verify a design state.');
        const image = `${folder}/${key}-${width}-${theme}.png`;
        await page.screenshot({ path: image, animations: 'disabled' });
        records.push({
          test: info.title,
          testFile: info.file.split('/tests/')[1],
          scenarios,
          detail,
          width,
          height,
          image,
          synthetic: true,
          intentionalLoading: !!options.allowLoading,
          productBuildId,
          capturedAt: new Date().toISOString(),
          stateVerified:
            !state.renderError &&
            state.fontReady &&
            expectedDialogs.every((title) =>
              state.dialogs.some((dialog) => dialog.text?.includes(title)),
            ) &&
            expectedGroups.every((title) => state.groups.includes(title)) &&
            expectedMenus.every((text) =>
              state.dialogs.some((dialog) => dialog.text?.trim() === text),
            ),
          ...identity,
          source: 'actual product components at an asserted browser-test checkpoint',
          ...state,
        });
      }
    }
  } finally {
    if (!page.isClosed()) {
      if (viewport) await page.setViewportSize(viewport);
      await page.evaluate((preference) => {
        if (preference === null) localStorage.removeItem('makan-theme');
        else localStorage.setItem('makan-theme', preference);
        window.dispatchEvent(new Event('makan-theme-changed'));
      }, preference);
      await options.prepareViewport?.(page);
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const transitions = document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime));
        await Promise.race([
          Promise.allSettled(transitions.map((animation) => animation.finished)),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
      });
    }
    await writeFile(`${folder}/${key}.json`, JSON.stringify(records, null, 2) + '\n');
  }
}
