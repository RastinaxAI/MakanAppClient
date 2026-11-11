// Reference-only QA: reuse a page for each native viewport, never an operational app.
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { captureReference } from './lib/v5-reference.mjs';
import { collectViewportGeometry } from './lib/v5-geometry.mjs';
const input = process.env.EXACT_PRODUCT_RESULTS;
const out = process.env.EXACT_OUTPUT_DIR;
for (const directory of [input, out])
  if (!directory?.startsWith('output/review/exact-v1/') || directory.split('/').includes('..'))
    throw Error('Explicit review evidence paths are required');
const rows = JSON.parse(await fs.readFile(input, 'utf8')).filter(
  (r) => r.scenarios?.length || r.proposal,
);
const url = 'http://127.0.0.1:3161/MakanApp_Responsive_Design_FA_v5.html';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const groups = new Map();
for (const row of rows) {
  const key = [row.width, row.height, row.theme, row.reading ?? 'normal'].join('|');
  const group = groups.get(key) ?? [];
  group.push(row);
  groups.set(key, group);
}
const results = [];
await fs.mkdir(out, { recursive: true });
try {
  for (const group of groups.values()) {
    const first = group[0];
    const context = await browser.newContext({
      viewport: { width: first.width, height: first.height },
      colorScheme: first.theme,
      reducedMotion: 'reduce',
      locale: 'fa-IR',
      timezoneId: 'Asia/Tehran',
    });
    await context.route('**/*', (route) =>
      ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
        ? route.continue()
        : route.abort('blockedbyclient'),
    );
    const page = await context.newPage();
    for (const row of group) {
      const record = {
        ...row,
        productBuildId: undefined,
        sourceProductEvidence: input,
        status: 'pending',
        pageErrors: [],
        apiFailures: [],
        referenceOnly: true,
      };
      try {
        await captureReference(
          page,
          { ...row, large: row.reading === 'large' || row.key === 'large-classes' },
          row.width,
          row.height,
          row.theme,
          url,
        );
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        record.layout = await page.evaluate(collectViewportGeometry);
        record.image = `${out}/${row.key}-${row.width}-${row.theme}.png`;
        await page.screenshot({ path: record.image, animations: 'disabled' });
        record.stateVerified = record.layout.fonts && !record.layout.renderError;
        record.status = 'captured';
        record.referenceIdentity = await page.evaluate(() => {
          const element = document.querySelector('.rx-root');
          return { id: element?.dataset.scenario, classes: element?.className };
        });
      } catch (error) {
        record.status = 'blocked';
        record.reason = error.message.split('\n')[0];
      }
      results.push(record);
      await fs.writeFile(out + '/results.partial.json', JSON.stringify(results, null, 2) + '\n');
      await fs.rename(out + '/results.partial.json', out + '/results.json');
    }
    await context.close();
    console.log(
      JSON.stringify({
        viewport: [first.width, first.height],
        theme: first.theme,
        reading: first.reading ?? 'normal',
        completed: results.length,
      }),
    );
  }
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({
    total: results.length,
    captured: results.filter((r) => r.status === 'captured').length,
    blocked: results
      .filter((r) => r.status !== 'captured')
      .map((r) => ({ key: r.key, width: r.width, reason: r.reason })),
  }),
);
