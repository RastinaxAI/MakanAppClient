// A static QA artifact. It neither mounts product routes nor changes product state.
// Run after screenshot/test writers finish so row metadata and source PNGs agree.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = 'output/review/exact-v1';
const read = async (file, fallback = []) =>
  JSON.parse(await fs.readFile(file, 'utf8').catch(() => JSON.stringify(fallback)));
const matrix = await read('docs/design/exact-v1/screen-route-matrix.json');
const current = await read(root + '/after/results.json');
const before = await read(root + '/before/results.json');
for (const file of await fs.readdir(root + '/states-native-sixth').catch(() => [])) {
  if (file.endsWith('.json'))
    before.push(
      ...(await read(root + '/states-native-sixth/' + file)).map((row) => ({
        ...row,
        status: 'captured',
        detail: 'شاهد میانی پیش از اصلاح نهایی اجزای مشترک؛ ' + (row.detail || ''),
      })),
    );
}
const reference = await read(root + '/reference/results.json');
const allReferences = await read(root + '/reference-all/manifest.json');
const nativeStates = new Map();
const nativeFiles = await Promise.all(
  (await fs.readdir(root + '/states-native').catch(() => []))
    .filter((file) => file.endsWith('.json'))
    .map(async (file) => ({
      file,
      modified: (await fs.stat(root + '/states-native/' + file)).mtimeMs,
    })),
);
for (const { file } of nativeFiles.sort((a, b) => a.modified - b.modified)) {
  for (const row of await read(root + '/states-native/' + file)) {
    const identity = JSON.stringify([
      row.testFile,
      row.test,
      row.scenarios,
      row.detail,
      row.width,
      row.height,
      row.theme,
      row.role,
      row.workspaceType,
    ]);
    nativeStates.set(identity, row);
  }
}
const native = [...nativeStates.values()];
const boundaries = await read(root + '/after-boundaries/results.json');
const large = await read(root + '/after-large/results.json');
// Gallery URLs retain the bytes associated with their evidence, even while another
// capture updates the mutable after/ or states-native/ working directories.
await fs.mkdir(root + '/gallery-assets', { recursive: true });
const imageSnapshots = new Map();
async function snapshotImage(source) {
  if (!imageSnapshots.has(source))
    imageSnapshots.set(
      source,
      (async () => {
        const absolute = path.resolve(source);
        if (
          !absolute.startsWith(path.resolve(root) + path.sep) ||
          path.extname(absolute) !== '.png'
        )
          throw Error('Gallery image must be a PNG inside the QA output directory.');
        const bytes = await fs.readFile(absolute);
        const hash = createHash('sha256').update(bytes).digest('hex');
        const target = root + '/gallery-assets/' + hash + '.png';
        try {
          await fs.writeFile(target, bytes, { flag: 'wx' });
        } catch (error) {
          if (error.code !== 'EEXIST') throw error;
          if (
            createHash('sha256')
              .update(await fs.readFile(target))
              .digest('hex') !== hash
          )
            throw Error('Existing gallery image hash does not match its filename.');
        }
        return { image: target, evidenceImage: source, imageSha256: hash };
      })(),
    );
  return imageSnapshots.get(source);
}
const evidenceRows = [
  ...current,
  ...before,
  ...reference,
  ...allReferences,
  ...native,
  ...boundaries,
  ...large,
];
for (let index = 0; index < evidenceRows.length; index += 24)
  await Promise.all(
    evidenceRows.slice(index, index + 24).map(async (row) => {
      if (row.image) Object.assign(row, await snapshotImage(row.image));
    }),
  );
const relative = (row) => ({
  ...row,
  image: row.image ? path.relative(root, row.image) : undefined,
});
function eligible(row, id) {
  if (row.stateVerified === false || row.pageErrors?.length) return false;
  if (id === 'MK-09' && row.key === 'school-parent' && !row.parentSelectionVerified) return false;
  if (['RX-012', 'RX-013', 'RX-015', 'RX-016', 'RX-018'].includes(id)) return false;
  if (id === 'MK-220') return false;
  if (id === 'MK-215' && !row.route?.includes('view=new')) return false;
  const entry = matrix.find((item) => item.scenario_id === id);
  if (entry?.group === 'messaging') {
    const expected = {
      'مالک گفتگو': 'Owner',
      'مدیر گفتگو': 'Admin',
      'عضو گفتگو': 'Member',
    }[entry.role];
    if (expected && row.conversationRole !== expected) return false;
  }
  if (row.workspaceType === 'Organization' && id.startsWith('MK-')) {
    const expected = [
      ['دانش‌آموز', 'Student'],
      ['مدرس', 'Teacher'],
      ['مدیر', 'Manager'],
      ['والد', 'Parent'],
    ].find(([title]) => entry?.role.includes(title))?.[1];
    if (expected && row.role !== expected) return false;
  }
  if (id === 'MK-20' && row.key === 'independent-overview') return false;
  if (id === 'MK-456' && row.key === 'teacher-schedule') return false;
  if (id === 'MK-426' && row.key === 'class-fetch-error' && !row.layout?.alerts?.length)
    return false;
  return true;
}
const annotate = (row) => ({
  ...row,
  eligibleScenarios: (row.scenarios ?? []).filter((id) => eligible(row, id)),
});
const data = {
  generated: new Date().toISOString(),
  matrix,
  current: current.map(annotate).map(relative),
  before: before.map(relative),
  reference: reference.map(relative),
  allReferences: allReferences.map(relative),
  native: native.map(annotate).map(relative),
  boundaries: boundaries.map(relative),
  large: large.map(relative),
};
await fs.writeFile(root + '/gallery-data.json', JSON.stringify(data, null, 2) + '\n');
await fs.writeFile(
  root + '/gallery-snapshot.json',
  JSON.stringify(
    {
      generated: data.generated,
      imageSources: imageSnapshots.size,
      method:
        'Content-addressed PNG copies; SHA-256 is recorded with each evidence row. Product build identities remain per-row.',
    },
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  root + '/index.html',
  `<!doctype html>
<html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ماکان — شواهد تطبیق V5</title>
<style>
@font-face{font-family:Vazirmatn;src:url('Vazirmatn.ttf')}*{box-sizing:border-box}body{margin:0;background:#f5f8fe;color:#182a45;font:15px/1.9 Vazirmatn,Arial,sans-serif}header,main{padding:20px;max-width:1800px;margin:auto}h1{font-size:24px;margin:0}p{margin:8px 0}a{color:#0d5ecc}label{display:flex;flex-direction:column;min-width:0;gap:4px}input,select,button{font:inherit;color:inherit;background:white;border:1px solid #8194b0;border-radius:8px;min-height:44px;padding:8px;max-width:100%}.controls{display:grid;grid-template-columns:2fr 3fr 1fr 1fr;gap:12px}.panes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:20px}.pane{min-width:0;border:1px solid #dce5f1;background:white;border-radius:12px;overflow-wrap:anywhere;padding:12px}.pane h2{font-size:17px;margin:0 0 8px}.pane img{display:block;width:100%;height:auto;border:1px solid #dce5f1}.meta{font-size:13px;white-space:pre-wrap;direction:rtl}.latin{white-space:pre-wrap;overflow-wrap:anywhere;direction:ltr;text-align:left;unicode-bidi:plaintext;font:12px/1.8 monospace}.warning{border-right:4px solid #156fee;padding:8px 12px;background:#eaf2ff}summary{cursor:pointer;min-height:44px}details{margin-top:14px}#mapping{overflow-wrap:anywhere;min-width:0;border:1px solid #dce5f1;border-radius:10px;padding:12px;background:white}.chips{display:flex;flex-wrap:wrap;gap:12px;font-size:13px}#alternatives{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #246ce0;outline-offset:3px}@media(max-width:1000px){.controls{grid-template-columns:1fr 1fr}.panes{grid-template-columns:1fr}}@media(max-width:500px){header,main{padding:12px}.controls{grid-template-columns:1fr}}
</style>
<header><h1>ماکان — شواهد تطبیق نسخهٔ ۵ آبی</h1>
<p>تصاویر برنامه از کامپوننت‌های واقعی و دادهٔ آزمایشیِ ایزوله‌اند. مرجع از ناحیهٔ داخلی دستگاه، در اندازهٔ واقعی CSS استخراج شده است.</p>
<p class="warning">نمایش تصاویر در این گالری برای جا شدن در ستون کوچک می‌شود؛ لینک هر تصویر، فایل اصلی با ابعاد viewport را باز می‌کند. متن، نقش، داده، focus و مرحلهٔ گردش کار ممکن است میان مرجع و محصول متفاوت باشند. ثبت تصویر به معنی تأیید برابری پیکسلی نیست.</p>
<div class="chips" id="counts"></div></header>
<main><div class="controls">
<label>جستجو در عنوان یا شناسه<input id="search" type="search" placeholder="MK-95 یا تنظیمات"></label>
<label>موقعیت مرجع<select id="scenario"></select></label>
<label>عرض CSS<select id="width"><option>390</option><option>834</option><option>1440</option></select></label>
<label>تم<select id="theme"><option value="light">روشن</option><option value="dark">تاریک</option></select></label>
</div><p id="title"></p><div id="mapping"></div>
<div class="panes"><section class="pane" id="before"><h2>شاهد قبلی محصول</h2><div class="content"></div></section><section class="pane" id="reference"><h2>مرجع داخلی هم‌اندازه</h2><div class="content"></div></section><section class="pane" id="current"><h2>برنامه پس از تغییر</h2><div class="content"></div></section></div>
<details><summary>شواهد بیشتر همین موقعیت، مرزهای عرض و متن ۲۰۰٪</summary><div id="alternatives"></div></details>
<details><summary>دادهٔ فنی این انتخاب</summary><pre class="latin" id="raw"></pre></details>
<p><a href="gallery-data.json">تمام دادهٔ گالری</a> · <a href="screen-route-matrix.csv">جدول ۵۲۸ موقعیت</a> · <a href="IMPLEMENTATION_REVIEW_FA.md">گزارش اجرا و محدودیت‌ها</a></p>
</main><script>
let data,selectedNative=null;const el=id=>document.getElementById(id);const has=(r,id)=>r.scenario===id||r.proposal===id||(r.eligibleScenarios||r.scenarios||[]).includes(id);const match=(r)=>r.width===+el('width').value&&r.theme===el('theme').value;
function text(tag,value,cls){const node=document.createElement(tag);node.textContent=value;if(cls)node.className=cls;return node}
function drawPane(id,row){const content=el(id).querySelector('.content');content.replaceChildren();if(!row?.image){content.append(text('p','تصویر برنامه برای این حالت ثبت نشده است.'));return}const a=document.createElement('a');a.href=row.image;a.target='_blank';a.rel='noopener';const img=document.createElement('img');img.src=row.image;img.alt=id==='reference'?'قاب داخلی مرجع':'تصویر برنامه واقعی با داده آزمایشی';img.loading='lazy';a.append(img);content.append(a,text('p',row.width+' × '+row.height+' | '+row.theme+' | '+(row.focus||'focus ثبت‌شده در جریان آزمون'),'latin'));if(row.productBuildId)content.append(text('p','build: '+row.productBuildId,'latin'));if(row.proposal)content.append(text('p','نمای پیشنهادی با اتصال قبلی؛ این تصویر شاهد تأیید عرضه یا فعال‌سازی محصول نیست.'));if(row.detail)content.append(text('p',row.detail));if(row.layout?.alerts?.length)content.append(text('p',row.layout.alerts.join(' / ')));}
function options(){const term=el('search').value.toLowerCase();const previous=el('scenario').value;el('scenario').replaceChildren();for(const r of data.matrix.filter(r=>(r.scenario_id+' '+r.title).toLowerCase().includes(term))){const o=document.createElement('option');o.value=r.scenario_id;o.textContent=r.scenario_id+' — '+r.title;el('scenario').append(o)}if([...el('scenario').options].some(o=>o.value===previous))el('scenario').value=previous;render()}
function render(){const id=el('scenario').value;const row=data.matrix.find(r=>r.scenario_id===id);if(!row)return;const candidates=data.current.filter(r=>has(r,id)&&match(r)&&r.status==='captured');const checkpoints=data.native.filter(r=>has(r,id)&&match(r));let current=selectedNative&&has(selectedNative,id)&&match(selectedNative)?selectedNative:candidates[0]||checkpoints[0];const before=data.before.find(r=>has(r,id)&&match(r)&&r.status==='captured');const ref=data.reference.find(r=>has(r,id)&&match(r))||data.allReferences.find(r=>has(r,id)&&match(r));el('title').textContent=id+' — '+row.title+' | صفحهٔ PDF: '+row.pdf_page_v5;el('mapping').replaceChildren(text('p','وضعیت اجرا: '+row.implementation_status),text('p','وضعیت بررسی: '+row.visual_qa_status),text('p',row.actual_route,'latin'),text('p',row.actual_component,'latin'),text('p',row.backend_or_product_dependency),text('p',row.notes));drawPane('before',before);drawPane('reference',ref);drawPane('current',current);el('raw').textContent=JSON.stringify({mapping:row,current,reference:ref,before},null,2);el('alternatives').replaceChildren();for(const r of [...checkpoints,...data.boundaries.filter(r=>has(r,id)),...data.large.filter(r=>has(r,id))]){if(!r.image)continue;const a=document.createElement('a');a.href=r.image;a.target='_blank';a.rel='noopener';a.textContent=r.width+'×'+r.height+' '+r.theme+' '+(r.reading==='large'||(r.evidenceImage||r.image).includes('after-large')?'۲۰۰٪ ':'')+(r.detail||r.key||'');el('alternatives').append(a)}history.replaceState(null,'','#'+id)}
fetch('gallery-data.json').then(r=>r.json()).then(d=>{data=d;const initialHash=location.hash;el('counts').textContent='۵۲۸ موقعیت نگاشت‌شده | '+data.current.filter(r=>r.status==='captured').length+' تصویر مسیرهای محصول | '+data.native.length+' تصویر حالت‌های تعاملی | '+data.allReferences.length+' قاب مرجع مستقل';options();if(initialHash){const id=decodeURIComponent(initialHash.slice(1));if(data.matrix.some(r=>r.scenario_id===id))el('scenario').value=id}render()});el('search').oninput=options;for(const id of ['scenario','width','theme'])el(id).onchange=()=>{selectedNative=null;render()};
</script></html>`,
);
await fs.copyFile('public/fonts/makan-reference/Vazirmatn.ttf', root + '/Vazirmatn.ttf');
for (const file of [
  'screen-route-matrix.csv',
  'screen-route-matrix.json',
  'coverage.json',
  'IMPLEMENTATION_REVIEW_FA.md',
]) {
  await fs.copyFile('docs/design/exact-v1/' + file, root + '/' + file).catch((e) => {
    if (e.code !== 'ENOENT') throw e;
  });
}
console.log(
  JSON.stringify({
    current: current.length,
    native: native.length,
    references: allReferences.length,
    matrix: matrix.length,
  }),
);
