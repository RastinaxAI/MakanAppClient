// Import the author's V4 frames, keeping book/device chrome outside the product.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const active = JSON.parse(await fs.readFile('design/reference-v4-archive.json', 'utf8'));
if (active.version !== '4.0-blue') throw Error('Select the V4 reference first');
const output = active.directory;
const inventory = JSON.parse(await fs.readFile(output + '/screen_inventory.json', 'utf8'));
if (inventory.length !== 467) throw Error('V4 inventory must contain 467 unique IDs');
for (const name of ['ui.css', 'education.css', 'blue-theme.css', 'expansion.css'])
  await fs.copyFile(`${output}/editable-source/${name}`, `${output}/${name}`);
await fs.copyFile(output + '/MakanApp_UI_Design.html', output + '/MakanApp_Visual_Reference.html');
await fs.copyFile(output + '/page_manifest.json', output + '/pages.json');
await fs.mkdir(output + '/app-screens', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const original = await browser.newPage();
  await original.goto(pathToFileURL(path.resolve(output, 'MakanApp_UI_Design.html')).href);
  await original.evaluate(() => document.fonts.ready);
  const data = await original.evaluate((inventory) => {
    const legacyDesktop = {
      'MK-19': 'desktopReview',
      'MK-56': 'desktopManager',
      'MK-81': 'desktopEducation',
      'MK-82': 'desktopExamEditor',
    };
    const entries = inventory.map((spec) => {
      const wrapper = document.querySelector(
        `[data-screen="${legacyDesktop[spec.id] ?? spec.id}"]`,
      );
      const screen = wrapper?.querySelector('.screen,.desktop');
      if (!screen) throw Error('Missing V4 design: ' + spec.id);
      const desktop = screen.classList.contains('desktop');
      const owner =
        spec.id === 'MK-19' ||
        /مالک یا ادمین ماکان|پلتفرم/.test(spec.role) ||
        spec.group === 'platform' ||
        ['MK-463', 'MK-464'].includes(spec.id);
      return {
        ...spec,
        kind: desktop ? 'desktop' : 'mobile',
        variant: spec.kind,
        width: desktop ? 1270 : 390,
        height: desktop ? 764 : 844,
        scope: owner ? 'separate-owner-app' : 'client',
        html: screen.outerHTML,
        image: 'app-screens/' + spec.id + '.png',
        product_status: 'design-reference-only',
      };
    });
    return { head: document.head.innerHTML, entries };
  }, inventory);
  const capture = await browser.newPage();
  const chrome =
    'html,body{margin:0!important;padding:0!important;min-width:0!important;background:#f5f8fe!important}body{direction:rtl}#capture{position:relative;overflow:hidden}#capture>.screen{height:100%;width:100%;border-radius:0!important}#capture>.desktop{position:relative!important;inset:auto!important;width:100%!important;height:100%!important;transform:none!important;box-shadow:none!important;border:0!important;border-radius:0!important}#capture .status,#capture .home-safe,#capture .browserbar{display:none!important}#capture .desktop-app{height:100%!important}*{animation:none!important;transition:none!important}';
  for (const entry of data.entries) {
    await capture.setViewportSize({ width: entry.width, height: entry.height });
    await capture.setContent(
      `<!doctype html><html lang="fa" dir="rtl"><head>${data.head}<style>${chrome}</style></head><body><div id="capture" style="width:${entry.width}px;height:${entry.height}px">${entry.html}</div></body></html>`,
    );
    await capture.evaluate(() => document.fonts.ready);
    await capture
      .locator('#capture')
      .screenshot({ path: output + '/' + entry.image, animations: 'disabled' });
    delete entry.html;
  }
  await fs.writeFile(
    output + '/screens.json',
    JSON.stringify(
      {
        reference: `MakanApp visual design ${active.version}, 2026-11-05`,
        screen_count: data.entries.length,
        sourcePdfSha256: active.sourcePdfSha256,
        note: 'Author reference frames. Inventory presence does not prove API connection, interaction or visual parity.',
        screens: data.entries,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({
      imported: data.entries.length,
      client: data.entries.filter((x) => x.scope === 'client').length,
      owner: data.entries.filter((x) => x.scope !== 'client').length,
    }),
  );
} finally {
  await browser.close();
}
