import { reviewPath } from './review-output';
import type { BrowserContext, TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { observeConversationRoles } from '../../scripts/exact-conversation-evidence.mjs';

const conversationEvidence = new WeakMap<
  BrowserContext,
  ReturnType<typeof observeConversationRoles>
>();
export async function observedConversationRole(
  context: BrowserContext,
  route: string,
  userId: string,
  revision: string,
) {
  const id = new URL(route).pathname.match(/^\/personal\/messages\/([a-f0-9-]{36})/i)?.[1];
  return id ? conversationEvidence.get(context)?.role(id, userId, revision) : undefined;
}

/** Observe actual test transitions; this never supplies UI or substitutes a response. */
export async function recordExactStates(context: BrowserContext, info: TestInfo) {
  if (process.env.MAKAN_EXACT_UI_EVIDENCE !== 'true') return async () => {};
  const roles = observeConversationRoles(context);
  conversationEvidence.set(context, roles);
  const folder = reviewPath('output/review/exact-v1/states');
  await mkdir(folder, { recursive: true });
  const key = createHash('sha256').update(info.testId).digest('hex').slice(0, 16);
  let sequence = 0;
  const pending = new Set<Promise<unknown>>();
  await context.exposeBinding('__makanExactState', ({ page }, state) => {
    if (page.isClosed()) return;
    const file = `${folder}/${key}-${String(++sequence).padStart(3, '0')}`;
    const task = (async () => {
      // Read-only metadata may be recorded during a resize. Screenshots are taken
      // by Playwright's compositor trace and afterEach, never concurrently here:
      // screenshot's viewport restoration can race the test's setViewportSize.
      const current = await page.evaluate(
        () => (window as unknown as { __makanExactSignature?: string }).__makanExactSignature,
      );
      if (current !== state.signature) return;
      await writeFile(
        file + '.json',
        JSON.stringify(
          {
            test: info.title,
            file: info.file.split('/tests/')[1],
            synthetic: true,
            trace: info.outputDir + '/trace.zip',
            ...state,
          },
          null,
          2,
        ) + '\n',
      );
    })().catch(() => {});
    pending.add(task);
    void task.finally(() => pending.delete(task));
  });
  await context.addInitScript(() => {
    let timer: ReturnType<typeof setTimeout>;
    let previous = '';
    const visible = (e: Element) =>
      !!e.getBoundingClientRect().height && getComputedStyle(e).visibility !== 'hidden';
    const text = (selector: string) =>
      [...document.querySelectorAll(selector)]
        .filter(visible)
        .map((e) => e.textContent?.trim())
        .filter(Boolean);
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!document.body || !location.pathname.startsWith('/personal')) return;
        const state = {
          route: location.pathname + location.search,
          width: innerWidth,
          height: innerHeight,
          theme: document.documentElement.dataset.theme,
          reading: document.documentElement.dataset.reading,
          headings: text('h1,h2,[role="dialog"] h3'),
          dialogs: text('[role="dialog"] [id*="radix"], [role="dialog"] h2, .rx-dialog h3'),
          alerts: text('[role="alert"],.state h2,.state h3'),
          labels: text('label'),
          controls: text('button,a[role="button"],[role="menuitem"],summary'),
          bodyText: document.querySelector('main')?.textContent?.trim().slice(0, 16000),
          selections: [
            ...document.querySelectorAll(
              '[aria-current],[aria-expanded="true"],[aria-busy="true"]',
            ),
          ]
            .filter(visible)
            .map((e) => ({
              text: e.textContent?.trim().slice(0, 150),
              current: e.getAttribute('aria-current'),
              expanded: e.getAttribute('aria-expanded'),
              busy: e.getAttribute('aria-busy'),
            })),
          scenarioIds: [
            ...document.querySelectorAll<HTMLElement>(
              '[data-v5-scene],[data-v4-view],[data-design-scenario]',
            ),
          ]
            .filter(visible)
            .flatMap((e) =>
              (e.dataset.designScenario || e.dataset.v5Scene || e.dataset.v4View || '').split(
                /\s+/,
              ),
            ),
          documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
        const signature = JSON.stringify(state);
        if (signature === previous) return;
        previous = signature;
        (window as unknown as { __makanExactSignature: string }).__makanExactSignature = signature;
        void (
          window as unknown as { __makanExactState: (state: unknown) => Promise<void> }
        ).__makanExactState({ ...state, signature, wallTime: Date.now() });
      }, 180);
    }
    const observer = new MutationObserver(schedule);
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'data-theme',
        'data-reading',
        'aria-expanded',
        'aria-current',
        'aria-busy',
        'open',
      ],
    });
    window.addEventListener('resize', schedule);
    window.addEventListener('popstate', schedule);
    document.addEventListener('change', schedule);
    schedule();
  });
  return async () => {
    await Promise.allSettled([...pending]);
    roles.dispose();
  };
}
