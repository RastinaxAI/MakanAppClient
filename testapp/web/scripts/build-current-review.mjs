// Review artifact only: original native viewport screenshots, never a replacement app.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = 'output/review/exact-v1';
const read = async (name) => JSON.parse(await fs.readFile(`${root}/${name}/results.json`, 'utf8'));
const after = await read('current-final');
const reference = await read('current-reference');
const before = await read('current-before-context');
const identity = (r) => [r.key, r.width, r.height, r.theme].join(':');
const old = new Map(before.map((r) => [identity(r), r]));
const targets = new Map(reference.map((r) => [identity(r), r]));
const metrics = [
  'header',
  'title',
  'sceneHero',
  'listBounds',
  'listFirstRow',
  'assistantSources',
  'assistantComposer',
  'assistantSendIcon',
  'context',
];
const disposition = (row, name) => {
  if (row.key === 'large-classes')
    return {
      status: 'reference-composition-not-matched',
      reason:
        'RX-004 is an illustrative long-title, learner and source composition. The real Manager list verifies 200% reflow only; its different contents do not support geometric parity.',
    };
  if (['phone', 'otp'].includes(row.key) && name === 'title')
    return {
      status: 'reviewed-box-semantics',
      reason:
        'The product heading is an inline content box; the reference heading fills its parent. Compare titleTextBounds, font, right edge and baseline instead of these different outer boxes.',
    };
  if (row.key === 'exam-editor' && name === 'title')
    return {
      status: 'open-product-heading-difference',
      reason:
        'The existing proposal-gated editor displays the class context; the reference displays an exam title. No final independent-exam rollout is implied. This remains a frontend/title difference, not an asserted API outage.',
    };
  if (row.key === 'resources' && ['listBounds', 'context'].includes(name))
    return {
      status: 'reviewed-different-authorized-data',
      reason:
        'This Personal fixture returns one source; the reference mixes three sample sources. Class scope requires an authorized school context in the active client. Sample rows/permissions were not inserted into the product.',
    };
  if (row.key === 'school-student' && name === 'context')
    return {
      status: 'open-context-summary-difference',
      reason:
        'The reference has two item summaries; the current Student context has a general summary. Its shorter panel remains a frontend difference. Sample lesson metadata was not substituted for real data.',
    };
  return { status: 'open-geometry-difference' };
};
const rows = [];
for (const row of after) {
  if (row.status !== 'captured' || row.stateVerified === false || row.pageErrors?.length) continue;
  const target = targets.get(identity(row));
  const baseline = old.get(identity(row));
  const comparisons = [
    ...metrics,
    ...(['phone', 'otp'].includes(row.key) ? ['titleTextBounds'] : []),
  ].flatMap((name) => {
    const a = name === 'titleTextBounds' ? row.layout?.title?.textBounds : row.layout?.[name],
      b = name === 'titleTextBounds' ? target?.layout?.title?.textBounds : target?.layout?.[name];
    if (!a || !b) return [];
    const delta = Object.fromEntries(
      ['x', 'y', 'width', 'height'].map((p) => [p, Math.round((a[p] - b[p]) * 100) / 100]),
    );
    const reviewRequired = Object.values(delta).some((n) => Math.abs(n) >= 4);
    return [
      {
        name,
        delta,
        reviewRequired,
        ...(reviewRequired ? { disposition: disposition(row, name) } : {}),
        actual: a,
        reference: b,
      },
    ];
  });
  const images = {};
  for (const [kind, item] of Object.entries({ before: baseline, after: row, reference: target })) {
    if (!item?.image) continue;
    const bytes = await fs.readFile(item.image);
    images[kind] = { path: item.image, sha256: createHash('sha256').update(bytes).digest('hex') };
  }
  rows.push({
    key: row.key,
    width: row.width,
    height: row.height,
    theme: row.theme,
    buildId: row.productBuildId,
    role: row.role,
    workspaceType: row.workspaceType,
    synthetic: true,
    stateVerified: row.stateVerified,
    preparation: row.preparation,
    documentOverflow: row.layout?.documentOverflow,
    images,
    comparisons,
    dataComparison:
      row.key === 'large-classes'
        ? 'Different reference composition; behavior-only evidence.'
        : 'Dynamic names, counts, permissions and dates remain actual fixture values; compare matching fields only.',
  });
}
const priority = [
  'assistant',
  'resources',
  'source-detail',
  'school-student',
  'school-teacher',
  'school-manager',
];
rows.sort((a, b) => {
  const order = (key) => (priority.includes(key) ? priority.indexOf(key) : priority.length);
  return order(a.key) - order(b.key);
});
const report = {
  createdAt: new Date().toISOString(),
  scope: 'Native CSS viewport geometry, not a pixel-parity score or live account verification.',
  synthetic: true,
  providerVerified: false,
  cases: rows,
  limitations: [
    'Reference sample names/counts/dates are not normal product data. Only explicitly matched fixtures support a geometry claim about dynamic content.',
    'Library remains metadata-only in the recorded consumer integration. No binary, flashcard or audio service was fabricated.',
    'Approved product logo and account controls are retained; document decorations are excluded.',
    'RX-004 composition, Student context summary and proposal-editor heading remain explicit visual differences. Full PDF parity is not claimed.',
  ],
};
await fs.writeFile(
  'docs/design/exact-v1/current-native-ui.json',
  JSON.stringify(report, null, 2) + '\n',
);
const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cards = rows
  .map(
    (r) =>
      `<article data-key="${esc(r.key)}"><h2>${esc(r.key)} · ${r.width}×${r.height} · ${r.theme}</h2><p>برنامهٔ واقعی Next.js با دادهٔ آزمون ایزوله؛ provider زنده تأیید نشده است. ${r.documentOverflow ? 'سرریز: نیاز به اصلاح' : 'سرریز سند: مشاهده نشد'}</p><div class="frames">${['reference', 'before', 'after'].map((k) => `<figure><figcaption>${{ reference: 'مرجع داخلی viewport', before: 'پیش از اصلاح نهایی', after: 'پس از اصلاح' }[k]}</figcaption>${r.images[k] ? `<a href="${esc(path.relative(root, r.images[k].path))}"><img loading="lazy" width="${r.width}" height="${r.height}" src="${esc(path.relative(root, r.images[k].path))}" alt="${k} ${esc(r.key)}"></a>` : '<p>تصویر این مرحله ثبت نشده است.</p>'}</figure>`).join('')}</div><details><summary>اختلاف مستطیل‌های کلیدی، بر حسب پیکسل CSS</summary><table><thead><tr><th>جزء</th><th>x</th><th>y</th><th>عرض</th><th>ارتفاع</th></tr></thead><tbody>${r.comparisons
        .map(
          (m) =>
            `<tr class="${m.reviewRequired ? 'review' : ''}"><td>${esc(m.name)}</td>${Object.values(
              m.delta,
            )
              .map((n) => `<td>${n}</td>`)
              .join('')}</tr>`,
        )
        .join(
          '',
        )}</tbody></table><p>رنگ مشخص‌شده یعنی اختلاف حداقل ۴ پیکسل؛ اختلاف داده/نقش باید پیش از حکم ظاهری بررسی شود. رسید کامل شامل ابعاد و hash تصاویر است.</p>${r.comparisons
        .filter((m) => m.disposition)
        .map(
          (m) =>
            `<p><b>${esc(m.name)} · ${esc(m.disposition.status)}</b><br>${esc(m.disposition.reason ?? '')}</p>`,
        )
        .join('')}</details></article>`,
  )
  .join('');
await fs.writeFile(
  `${root}/current-review.html`,
  `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>بررسی رابط ماکان</title><style>@font-face{font-family:Vazirmatn;src:url(../../../public/fonts/makan-reference/Vazirmatn.ttf)}*{box-sizing:border-box}body{margin:24px;background:#f5f8fe;color:#182a45;font:14px/1.8 Vazirmatn,sans-serif}h1,h2{margin:12px 0}p{color:#5c6d85}.frames{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}figure{margin:0;min-width:0}figcaption{padding:8px}img{display:block;max-width:100%;height:auto;border:1px solid #dce5f1}article{background:#fff;border:1px solid #dce5f1;padding:16px;margin-block:24px;border-radius:16px}table{border-collapse:collapse;direction:ltr}td,th{border:1px solid #dce5f1;padding:8px}.review{background:#fff4df}@media(max-width:800px){.frames{grid-template-columns:1fr}}</style><h1>مرجع، قبل و بعدِ رابط ماکان</h1><p>این صفحه سند بررسی است. تصاویر از برنامهٔ Next.js و قاب داخلی مرجع با اندازهٔ واقعی CSS گرفته شده‌اند. دادهٔ آزمون اعلام‌شده است و موفقیت سرویس زنده یا تطبیق کامل همهٔ PDF را اثبات نمی‌کند.</p>${cards}</html>`,
);
console.log(
  JSON.stringify({
    screenshots: rows.length,
    cases: new Set(rows.map((r) => r.key)).size,
    overflow: rows.filter((r) => r.documentOverflow).length,
    report: 'docs/design/exact-v1/current-native-ui.json',
    gallery: `${root}/current-review.html`,
  }),
);
