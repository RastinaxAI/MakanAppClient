// Native DOM/computed/cascade evidence for public authentication controls.
// Only the isolated loopback fixture may receive a local OTP challenge; no live OTP.
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { chromium } from '@playwright/test';
const origin = process.env.CSS_REVIEW_ORIGIN || 'http://127.0.0.1:3163';
if (!/^http:\/\/127\.0\.0\.1:31\d{2}$/.test(origin) || origin.endsWith(':3130'))
  throw Error('An explicit isolated fixture origin is required.');
const output = process.env.CSS_CASCADE_OUTPUT || 'tmp/css-reconstruction/cascade-fourth.json';
if (!/^(tmp\/css-reconstruction|docs\/quality)\/[a-zA-Z0-9_-]+\.json$/.test(output))
  throw Error('Unexpected evidence output path');
const sourceRules = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith('.css')) {
      const tree = postcss.parse(await fs.readFile(file, 'utf8'), { from: file });
      tree.walkRules((rule) => {
        for (const selector of rule.selectors)
          sourceRules.push({
            file,
            selector: normalize(selector),
            line: rule.source.start.line,
            declarations: rule.nodes
              .filter((d) => d.type === 'decl')
              .map((d) => ({ property: d.prop, value: d.value, line: d.source.start.line })),
          });
      });
    }
  }
}
function normalize(value) {
  return value
    .replace(/:global\(([^()]*)\)/g, '$1')
    .replace(/\.([\w-]{6})_([\w-]+)/g, '.$2')
    .replace(/["']/g, '')
    .replace(/\s+/g, '')
    .replace(/,1\)/g, ',1)');
}
function sourceLocation(selector, property) {
  const direct = sourceRules.filter((r) => r.selector === normalize(selector));
  const alias = property.name.startsWith('padding-')
    ? 'padding'
    : property.name.startsWith('margin-')
      ? 'margin'
      : property.name.startsWith('font-') || property.name === 'line-height'
        ? 'font'
        : property.name.startsWith('border-')
          ? 'border'
          : null;
  const result = direct.flatMap((r) =>
    r.declarations
      .filter(
        (d) => d.property === property.name && normalize(d.value) === normalize(property.value),
      )
      .map((d) => ({ file: r.file, line: d.line, property: d.property })),
  );
  return result.length
    ? result
    : direct.flatMap((r) =>
        r.declarations
          .filter((d) => d.property === property.name || d.property === alias)
          .map((d) => ({ file: r.file, line: d.line, property: d.property })),
      );
}
await walk('src');
const properties = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'display',
  'width',
  'height',
  'min-height',
  'gap',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'border-top-width',
  'border-top-color',
  'border-radius',
  'background-color',
  'color',
];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const records = [];
try {
  for (const [width, height] of [
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await context.route('**/*', (route) =>
      ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
        ? route.continue()
        : route.abort('blockedbyclient'),
    );
    await context.addInitScript(() => localStorage.setItem('makan-theme', 'light'));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const sheets = new Map();
    cdp.on('CSS.styleSheetAdded', ({ header }) => sheets.set(header.styleSheetId, header));
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    await page.goto(origin + '/enter');
    for (const scenario of ['MK-02', 'MK-03']) {
      if (scenario === 'MK-03') {
        await page.locator('#phone-number').fill('09120000101');
        await page.locator('button[type="submit"]').click();
        await page.locator('#otp-code').fill('4719');
      }
      await page.locator('h1').click();
      await page.evaluate(() => document.fonts.ready);
      const { root } = await cdp.send('DOM.getDocument');
      const sheetOrder = await page.evaluate(() => [...document.styleSheets].map((s) => s.href));
      const targets = {
        heading: 'h1',
        intro: '.rx-body-grid > p.policy',
        input: scenario === 'MK-02' ? '#phone-number' : '#otp-code',
        action: 'button[type="submit"]',
        ...(scenario === 'MK-03'
          ? {
              digits: '#otp-code + div',
              codeActions: '.rx-body-grid > div:has(> button)',
              security: '.rx-body-grid > aside',
            }
          : { policy: '[data-auth-policy]' }),
      };
      for (const [name, selector] of Object.entries(targets)) {
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
        if (!nodeId) continue;
        const matched = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
        const computed = await cdp.send('CSS.getComputedStyleForNode', { nodeId });
        const dom = await page.locator(selector).evaluate((element) => {
          const r = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            classes: element.className,
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
            focused: element === document.activeElement,
          };
        });
        const candidates = [];
        for (const [ruleOrder, match] of (matched.matchedCSSRules ?? []).entries()) {
          if (match.rule.layers?.length)
            throw Error('Layered cascade requires an explicit layer order audit');
          for (const index of match.matchingSelectors) {
            const selected = match.rule.selectorList.selectors[index];
            const specificity = selected.specificity ?? { a: 0, b: 0, c: 0 };
            for (const [declarationOrder, property] of match.rule.style.cssProperties.entries()) {
              if (
                !properties.includes(property.name) ||
                property.disabled ||
                property.parsedOk === false
              )
                continue;
              const header = sheets.get(match.rule.styleSheetId);
              candidates.push({
                property: property.name,
                value: property.value,
                selector: selected.text,
                important: !!property.important,
                specificity,
                compiled: header
                  ? {
                      url: header.sourceURL,
                      line:
                        (property.range?.startLine ?? match.rule.style.range?.startLine ?? 0) + 1,
                      column: (property.range?.startColumn ?? 0) + 1,
                    }
                  : { origin: match.rule.origin },
                source: sourceLocation(selected.text, property),
                rank: [
                  property.important ? 1 : 0,
                  match.rule.origin === 'user-agent' ? 0 : 1,
                  specificity.a,
                  specificity.b,
                  specificity.c,
                  sheetOrder.indexOf(header?.sourceURL),
                  ruleOrder,
                  declarationOrder,
                ],
              });
            }
          }
        }
        candidates.sort((a, b) => {
          for (let i = 0; i < a.rank.length; i++)
            if (a.rank[i] !== b.rank[i]) return b.rank[i] - a.rank[i];
          return 0;
        });
        const cascade = Object.fromEntries(
          properties.map((property) => {
            const list = candidates.filter((c) => c.property === property);
            return [
              property,
              {
                computed: computed.computedStyle.find((c) => c.name === property)?.value,
                winner: list[0],
                otherMatchedDeclarations: list.slice(1, 5),
              },
            ];
          }),
        );
        records.push({
          scenario,
          width,
          height,
          theme: 'light',
          focus: 'none',
          target: name,
          selector,
          ...dom,
          cascade,
        });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  output,
  JSON.stringify(
    {
      buildId: (await fs.readFile('.next/BUILD_ID', 'utf8')).trim(),
      method:
        'Chromium CDP matched selectors and their native specificity, source order, declaration order; unlayered author cascade; computed values and native element rectangles.',
      limitation:
        'Inherited values are resolved by getComputedStyle; winner lists refer to matched declarations on this element. Shorthand source locations may have multiple candidates and are not silently reduced to one.',
      records,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ output, records: records.length }));
