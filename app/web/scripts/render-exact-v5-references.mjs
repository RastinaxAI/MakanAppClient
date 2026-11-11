// Reference evidence only. This script never renders or replaces the application.
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const source = 'http://127.0.0.1:3161/MakanApp_Responsive_Design_FA_v5.html';
const output = 'output/review/exact-v1/reference-all';
const inventory = JSON.parse(await fs.readFile('design/responsive-reference.json', 'utf8'));
const scenes = inventory.screens.filter((s) => s.scope === 'client');
const theme = process.env.REFERENCE_THEME || 'light';
if (!['light', 'dark'].includes(theme)) throw Error('Invalid reference theme');
const previous = JSON.parse(
  await fs.readFile(output + '/manifest.json', 'utf8').catch(() => '[]'),
).filter((r) => r.theme !== theme);
const manifest = [];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
try {
  const settled = await Promise.allSettled(
    [
      [390, 844],
      [834, 1112],
      [1440, 1000],
    ].map(async ([width, height]) => {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      await context.route('**/*', (route) =>
        new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
      );
      const page = await context.newPage();
      await page.goto(source);
      await page.waitForFunction(() => window.MAKAN_LAYOUT && window.MAKAN_SCENES);
      for (const item of scenes) {
        const scenario = item.scenario_id;
        const geometry = await page.evaluate(
          ({ scenario, width, height, theme }) => {
            const scene = structuredClone(window.MAKAN_SCENES.find((s) => s.id === scenario));
            if (!scene) throw Error('Missing reference ' + scenario);
            scene.dark = theme === 'dark';
            document.body.innerHTML = window.MAKAN_LAYOUT.device(
              scene,
              width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop',
              width,
              height,
            );
            document.body.style.margin = '0';
            const style = document.createElement('style');
            style.textContent =
              '.rx-viewport{border-radius:0!important;box-shadow:none!important;transform:none!important}.rx-safe,.rx-scroll-cue{display:none!important}';
            document.head.append(style);
            const rect = (selector) => {
              const e = document.querySelector(selector);
              if (!e) return null;
              const r = e.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            };
            return {
              header: rect('.rx-head'),
              content: rect('.rx-content'),
              workspace: rect('.rx-workspace'),
              dialog: rect('.rx-dialog'),
              field: rect('.input'),
              title: rect('.rx-head h2'),
            };
          },
          { scenario, width, height, theme },
        );
        await page.evaluate(() => document.fonts.ready);
        const image = `${output}/${scenario}-${width}-${theme}.png`;
        await page.screenshot({ path: image, animations: 'disabled' });
        manifest.push({
          scenario,
          width,
          height,
          theme,
          focus: 'reference-authored',
          referenceOnly: true,
          image,
          geometry,
        });
      }
      await context.close();
      console.log(JSON.stringify({ width, captured: scenes.length }));
    }),
  );
  for (const result of settled) if (result.status === 'rejected') throw result.reason;
} finally {
  await browser.close();
  await fs.writeFile(
    output + '/manifest.json',
    JSON.stringify([...previous, ...manifest], null, 2) + '\n',
  );
}
console.log(JSON.stringify({ referenceOnly: true, captured: manifest.length }));
