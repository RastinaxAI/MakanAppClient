// Create the Persian handbook from actual, captured owner-panel UI.
// Every explanation, arrow and highlight is baked into the annotated image.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { chapters, pages } = require('./owner-handbook-content.cjs');
const root = path.resolve(__dirname, '..');
const working = path.join(root, 'tmp/pdfs/owner-handbook');
const captures = path.join(working, 'screenshots');
const annotated = path.join(working, 'annotated');
const output = path.join(root, 'output/pdf/MakanApp_Admin_Visual_User_Guide_FA.pdf');
const manifestFile = path.join(captures, 'manifest.json');
if (!fs.existsSync(manifestFile))
  throw new Error('Capture the current UI with scripts/capture-owner-handbook.mjs first.');
const shots = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const data = (file, mime = 'image/png') =>
  `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const fa = (value) => String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const font = data(
  path.join(
    root,
    'node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2',
  ),
  'font/woff2',
);
const latin = data(
  path.join(
    root,
    'node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-latin-wght-normal.woff2',
  ),
  'font/woff2',
);
const total = pages.length + 4;
// Some screenshots show a later step; map its highlight to the matching card.
const pinMaps = {
  'provision-3': [1],
  'library-publish': [1],
  'library-version': [1],
  'plan-edit-bottom': [2],
  'plan-publish': [1, 2],
  contracts: [2, 1],
  'user-age': [1, 1],
  'role-assignments': [null, 0],
};
const first = (chapter) => pages.findIndex((page) => page.chapter === chapter) + 4;
function footer(number) {
  return `<footer><span>ماکان | راهنمای تصویری پنل مدیریت</span><span>${fa(number)} / ${fa(total)}</span><span>تصاویر با داده نمایشی</span></footer>`;
}
function top(chapter) {
  return `<header><span>آموزش کاربردی سامانه ماکان</span><span>${escape(chapter)}</span><a href="#contents">بازگشت به فهرست</a></header>`;
}
function visual(item, index) {
  const shot = shots[item.image];
  if (!shot || !fs.existsSync(path.join(captures, shot.file)))
    throw new Error('Missing current screenshot: ' + item.image);
  const box = { x: 15, y: 20, width: 703, height: 510 };
  const scale = Math.min(box.width / shot.width, box.height / shot.height);
  const width = shot.width * scale;
  const height = shot.height * scale;
  const x = box.x + (box.width - width) / 2;
  const y = box.y + (box.height - height) / 2;
  const geometry = (shot.pins ?? [])
    .slice(0, item.notes.length)
    .map((pin, i) => {
      const cardIndex = pinMaps[item.image] ? pinMaps[item.image][i] : i;
      if (cardIndex === null || cardIndex === undefined) return '';
      const px = Math.max(x, x + pin.x * scale),
        py = y + pin.y * scale;
      const pw = Math.min(pin.width * scale, x + width - px),
        ph = Math.min(pin.height * scale, y + height - py);
      const tx = px + pw - 5,
        ty = py + Math.min(ph / 2, 18);
      const cardY = 26 + cardIndex * 171 + 28;
      return `<path d="M 743 ${cardY} C 718 ${cardY}, 738 ${ty}, ${tx + 10} ${ty}" fill="none" stroke="#2375dd" stroke-width="2" marker-end="url(#arrow-${index})"/>
      <rect x="${px}" y="${py}" width="${Math.max(5, pw)}" height="${Math.max(5, ph)}" rx="5" fill="#2c7ddd" fill-opacity=".025" stroke="#ed8c32" stroke-width="2"/>
      <circle cx="${px + Math.min(16, pw / 2)}" cy="${py + Math.min(16, ph / 2)}" r="12.5" fill="#1461c9" stroke="white" stroke-width="2"/>
      <text x="${px + Math.min(16, pw / 2)}" y="${py + Math.min(16, ph / 2) + 5}" text-anchor="middle" fill="white" font-family="Vazir" font-size="16" font-weight="750">${fa(cardIndex + 1)}</text>`;
    })
    .join('');
  return `<div class="visual" id="visual-${item.image}" data-image="${item.image}">
    <svg class="image-layer" viewBox="0 0 1036 550" aria-label="تصویر واقعی پنل همراه کادر و فلش آموزشی">
      <defs><marker id="arrow-${index}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M 0 0 L 7 3.5 L 0 7 Z" fill="#2375dd"/></marker></defs>
      <rect x="${x - 1}" y="${y - 1}" width="${width + 2}" height="${height + 2}" rx="9" fill="white" stroke="#cdd8e9"/>
      <image href="${data(path.join(captures, shot.file))}" x="${x}" y="${y}" width="${width}" height="${height}"/>
      ${geometry}
    </svg>
    ${item.notes.map(([title, text], i) => `<article class="callout" style="top:${26 + i * 171}px"><h2><b>${fa(i + 1)}</b>${escape(title)}</h2><p>${escape(text)}</p></article>`).join('')}
    <span class="photo-label">عکس از رابط خود سامانه</span>
  </div>`;
}
const cover = `<section class="page cover" id="cover">
  <div class="cover-top"><span>راهنمای آموزش و تحویل به کاربر</span><span>۲۰ آبان ۱۴۰۵ | ۱۱ نوامبر ۲۰۲۶</span></div>
  <div class="hero"><div class="hero-copy"><span class="eyebrow">عکس واقعی رابط + کادر و فلش + توضیح روی تصویر</span><h1>ماکان<br><em>قدم به قدم</em></h1><p>راهنمای کامل استفاده از<br>پنل مدیریت مالک پلتفرم</p><div class="cover-badges"><span>${fa(pages.length)} درس تصویری</span><span>${fa(Object.keys(chapters).length)} بخش</span><span>رایانه و موبایل</span></div></div><div class="hero-photo"><img src="${data(path.join(captures, 'dashboard.png'))}" alt="نمای کلی واقعی پنل"/></div></div>
  <div class="cover-bottom"><strong>برای کسی که می‌خواهد با سامانه کار کند.</strong><p>از ورود و جست‌وجو تا سازمان، کاربر، آموزش، کلاس شخصی، کتابخانه، قرارداد، پرداخت و پیگیری خطا.</p></div>
  ${footer(1)}
</section>`;
const contents = `<section class="page" id="contents">${top('فهرست قابل کلیک')}<div class="page-title"><span>مسیر یادگیری</span><h1>کار موردنظر را پیدا کنید</h1></div><p class="intro">روی نام هر بخش بزنید تا به اولین درس آن بروید. فهرست کناری PDF نیز عنوان درس‌ها را نشان می‌دهد.</p><nav class="contents">${Object.entries(
  chapters,
)
  .map(
    ([key, title], i) =>
      `<a href="#lesson-${pages[first(key) - 4].image}"><b>${fa(i + 1).padStart(2, '۰')}</b><span>${escape(title)}</span><small>صفحه ${fa(first(key))}</small></a>`,
  )
  .join(
    '',
  )}</nav><div class="toc-note">این راهنما درباره همین پنل مدیریت است. امکانات آموزشی کاربران، معلمان یا مدیران آموزشگاه که در برنامه‌های دیگر قرار دارند، در این راهنما شبیه‌سازی نشده‌اند.</div>${footer(2)}</section>`;
const intro = `<section class="page" id="howto">${top('پیش از شروع')}<div class="page-title"><span>سه دقیقه برای شروع درست</span><h1>چطور از این راهنما استفاده کنید؟</h1></div><div class="intro-grid"><article><b>۱</b><h2>عکس از خود سامانه است</h2><p>تصاویر از اجرای همین پنل گرفته شده‌اند. نام‌ها، شماره‌ها، شناسه‌ها و اعداد داخل آن‌ها نمایشی‌اند و مربوط به مشتری واقعی نیستند.</p></article><article><b>۲</b><h2>شماره، کادر و فلش را دنبال کنید</h2><p>هر تصویر توضیح‌های خودش را دارد. کادر نارنجی محل مهم و فلش آبی ارتباط آن را با توضیح نشان می‌دهد. برای ریزنوشته‌ها PDF را بزرگ‌نمایی کنید.</p></article><article><b>۳</b><h2>اول مشاهده، بعد اقدام</h2><p>نام فرد یا سازمان، وضعیت، اثر اقدام و دلیل آن را پیش از دکمه پایانی بخوانید. «ادامه» یا «تازه‌سازی» همیشه به معنی ثبت تغییر نیست.</p></article><article><b>۴</b><h2>مجوز و وضعیت حساب مهم است</h2><p>ممکن است بعضی گزینه‌ها در حساب شما دیده نشوند. دسترسی، وضعیت منبع و پاسخ جاری سامانه تعیین می‌کنند چه کاری مجاز است.</p></article></div><div class="learning-path"><strong>پیشنهاد برای آموزش اولیه</strong><p>ورود ← نمای کلی ← جست‌وجوی سازمان یا کاربر ← بازکردن پرونده ← استفاده از فیلتر ← خواندن اعلان‌ها ← خروج از حساب</p></div><div class="intro-tip">اولین تمرین را با مشاهده و جست‌وجو انجام دهید. ثبت تغییر را فقط روی مورد درست و با مجوز مسئول مربوط انجام دهید.</div>${footer(3)}</section>`;
const lessons = pages
  .map(
    (item, index) =>
      `<section class="page lesson" id="lesson-${item.image}">${top(chapters[item.chapter])}<div class="page-title"><span>درس ${fa(index + 1)} از ${fa(pages.length)}</span><h1>${escape(item.title)}</h1></div><p class="route">مسیر: ${escape(item.route)}</p>${visual(item, index)}<div class="lesson-tip"><b>نکته کاربردی</b><span>${escape(item.tip)}</span></div>${footer(index + 4)}</section>`,
  )
  .join('');
const closing = `<section class="page" id="practice">${top('مرور و تمرین')}<div class="page-title"><span>آماده انجام کار روزانه</span><h1>یک تمرین کوتاه برای تحویل برنامه</h1></div><div class="check-grid"><article><h2>پیداکردن و مشاهده</h2><p>وارد شوید؛ یک سازمان را جست‌وجو کنید؛ پرونده و اعضای آن را ببینید؛ یک کاربر را پیدا و نشست‌هایش را مرور کنید.</p></article><article><h2>فهمیدن وضعیت‌ها</h2><p>وضعیت پرداخت را از اجرای سفارش جدا کنید؛ در منبع کتابخانه، انتشار، نمایانی، فایل و آمادگی هوش مصنوعی را مستقل بخوانید.</p></article><article><h2>ثبت آگاهانه</h2><p>روی یک فرم آموزشی نام هدف، اثر اقدام و فیلد دلیل را پیدا کنید. بدون نیاز واقعی، دکمه پایانی را نزنید.</p></article><article><h2>پیگیری نتیجه</h2><p>روش تازه‌سازی، دریافت نسخه تازه در تعارض و بررسی نتیجه درخواست راه‌اندازی را پیدا کنید. یک نتیجه نامشخص را با ثبت تازه جایگزین نکنید.</p></article><article><h2>موبایل و خروج</h2><p>منوی موبایل، اطلاعات بیشتر کارت و فیلترها را باز کنید. در پایان، از منوی حساب خارج شوید.</p></article><article><h2>کمک‌گرفتن درست</h2><p>برای توضیح مشکل، نام صفحه، زمان، اقدام، متن پیام و شناسه پیگیری را آماده کنید؛ کد ورود و داده محرمانه را نفرستید.</p></article></div><div class="closing-note"><strong>هدف آموزش</strong><p>کاربر بداند کجا برود، چه چیزی را بخواند، قبل از ثبت چه چیزی را بررسی کند و نتیجه را از کجا پیگیری کند.</p></div>${footer(total)}</section>`;
const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>ماکان، قدم به قدم - راهنمای تصویری کامل پنل مدیریت</title><style>
@font-face{font-family:Vazir;src:url('${font}');font-weight:100 900}@font-face{font-family:Vazir;src:url('${latin}');font-weight:100 900;unicode-range:U+0000-00FF}
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Vazir,Tahoma,sans-serif;color:#14263f;background:white}a{color:inherit;text-decoration:none}.page{position:relative;width:297mm;height:210mm;padding:8mm 11mm 12mm;break-after:page;overflow:hidden}.page:last-child{break-after:auto}header{display:flex;justify-content:space-between;align-items:center;height:20px;font-size:10px;color:#657692;border-bottom:1px solid #dbe3ee;padding-bottom:6px}header a{color:#1461c9}.page-title{display:flex;align-items:baseline;gap:18px;margin:10px 0 2px}.page-title>span{font-size:10px;color:#1461c9;font-weight:700;white-space:nowrap}h1{font-size:25px;line-height:1.5;margin:0;font-weight:850}h2{margin:0;color:#174b89}.route{font-size:11px;color:#60718b;margin:0 0 8px}.visual{direction:ltr;position:relative;width:1036px;height:550px;border:1px solid #d9e3ef;border-radius:12px;overflow:hidden;background:linear-gradient(120deg,#f6f8fc,#eef3fa)}.image-layer{position:absolute;inset:0;display:block;width:100%;height:100%}.callout{position:absolute;left:742px;width:276px;height:154px;direction:rtl;padding:13px 13px 10px;background:#fff;border:1px solid #d0def0;border-right:4px solid #1666ca;border-radius:10px;box-shadow:0 3px 10px #102e5710}.callout h2{display:flex;align-items:center;gap:8px;font-size:14px;line-height:1.65;font-weight:800}.callout h2 b{width:24px;height:24px;flex:none;border-radius:50%;display:grid;place-items:center;background:#1461c9;color:#fff;font-size:14px}.callout p{font-size:13.1px;line-height:1.85;margin:7px 0 0;color:#2c3e56}.photo-label{position:absolute;bottom:4px;left:22px;color:#7b8ca6;font-size:8px;direction:rtl}.lesson-tip{display:flex;align-items:flex-start;gap:10px;background:#edf4ff;border-radius:7px;border-right:3px solid #2473d2;margin-top:9px;padding:8px 11px;font-size:11px;line-height:1.7}.lesson-tip b{white-space:nowrap;color:#19549d}footer{position:absolute;bottom:6mm;left:11mm;right:11mm;border-top:1px solid #dbe3ee;padding-top:5px;display:flex;justify-content:space-between;font-size:9px;color:#718198}.cover{background:#f4f7fc}.cover-top{display:flex;justify-content:space-between;color:#42617e;font-size:12px;margin-bottom:24px}.hero{height:470px;border-radius:20px;background:#10233f;display:flex;align-items:center;gap:20px;overflow:hidden;color:white;padding:25px 30px}.hero-copy{width:46%;flex:none}.eyebrow{font-size:12px;color:#a9d1ff}.hero h1{font-size:66px;line-height:1.45;margin:14px 0 12px}.hero h1 em{font-style:normal;color:#79b4ff}.hero-copy>p{font-size:22px;line-height:1.9;margin:0}.hero-photo{width:54%;transform:rotate(-3deg);border:7px solid #fff;border-radius:13px;overflow:hidden;box-shadow:0 15px 35px #0006}.hero-photo img{display:block;width:100%;height:auto}.cover-badges{display:flex;gap:8px;margin-top:25px;flex-wrap:wrap}.cover-badges span{border:1px solid #4777b4;border-radius:8px;font-size:11px;padding:5px 10px;color:#d7e9ff}.cover-bottom{padding:25px 12px}.cover-bottom strong{font-size:21px}.cover-bottom p{font-size:14px;color:#536985;margin:8px 0}.intro{font-size:13px;line-height:1.9;color:#526885;margin:14px 0 18px}.contents{display:grid;grid-template-columns:1fr 1fr;gap:9px 24px}.contents a{display:flex;align-items:center;gap:12px;border:1px solid #d9e3ef;border-radius:9px;padding:12px 14px;font-size:15px;min-height:54px}.contents a>b{color:#1461c9;font-size:19px;min-width:31px}.contents a>span{flex:1}.contents small{font-size:11px;color:#7486a0}.toc-note{background:#edf4ff;border-radius:8px;padding:14px 18px;font-size:13px;line-height:1.9;margin-top:20px}.intro-grid,.check-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:22px}.intro-grid article,.check-grid article{background:#f5f8fd;border:1px solid #d9e3ef;border-radius:12px;padding:20px;position:relative}.intro-grid article>b{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;color:white;background:#1767cb;font-size:20px;float:left}.intro-grid h2,.check-grid h2{font-size:19px;margin-bottom:10px}.intro-grid p,.check-grid p{font-size:15px;line-height:2;margin:0;color:#405570}.learning-path,.closing-note{background:#102a4d;color:white;padding:18px 22px;border-radius:12px;margin-top:22px}.learning-path strong,.closing-note strong{font-size:19px}.learning-path p,.closing-note p{font-size:15px;line-height:2;margin:8px 0 0}.intro-tip{font-size:14px;line-height:2;color:#526885;padding:15px 5px}.check-grid article{padding:17px 20px}.check-grid h2{font-size:17px}.check-grid p{font-size:14px}.check-grid{gap:14px}.closing-note{margin-top:18px}
</style></head><body>${cover}${contents}${intro}${lessons}${closing}</body></html>`;

async function main() {
  fs.mkdirSync(working, { recursive: true });
  fs.mkdirSync(annotated, { recursive: true });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1123, height: 794 },
      deviceScaleFactor: 1.5,
    });
    await page.emulateMedia({ media: 'print' });
    await page.setContent(html, { waitUntil: 'load', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('.callout'))
        if (el.scrollHeight > el.clientHeight + 1)
          bad.push({
            kind: 'callout',
            text: el.textContent,
            height: el.scrollHeight,
            limit: el.clientHeight,
          });
      for (const el of document.querySelectorAll('.page')) {
        const footer = el.querySelector('footer').getBoundingClientRect();
        const children = [...el.children].filter((c) => c.tagName !== 'FOOTER');
        const bottom = Math.max(...children.map((c) => c.getBoundingClientRect().bottom));
        if (bottom > footer.top - 4)
          bad.push({ kind: 'page', id: el.id, overlap: bottom - footer.top });
      }
      return bad;
    });
    if (issues.length) throw new Error('Handbook layout overflow: ' + JSON.stringify(issues));
    // Flatten the complete screenshot + arrows + Persian labels into one image.
    // This makes the explanations part of the picture when the PDF is shared.
    for (const item of pages) {
      const locator = page.locator('#visual-' + item.image);
      const file = path.join(annotated, item.image + '.png');
      await locator.screenshot({ path: file, animations: 'disabled', timeout: 30000 });
      await locator.evaluate((el, src) => {
        el.innerHTML = '';
        const image = document.createElement('img');
        image.src = src;
        image.style.cssText = 'display:block;width:100%;height:100%;';
        image.alt = 'تصویر واقعی سامانه با توضیحات، کادر و فلش';
        el.append(image);
      }, data(file));
      console.log('Annotated ' + item.image);
    }
    fs.writeFileSync(path.join(working, 'guide.html'), await page.content());
    await page.pdf({
      path: output,
      format: 'A4',
      landscape: true,
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
    });
    fs.writeFileSync(
      path.join(working, 'build-report.json'),
      JSON.stringify(
        {
          pages: total,
          lessons: pages.length,
          chapters: Object.keys(chapters).length,
          images: Object.keys(shots).length,
          explanationsOnImages: true,
          output,
          layoutIssues: issues,
        },
        null,
        2,
      ),
    );
    fs.copyFileSync(output, path.join(root, 'public/guides/makan-owner-guide.pdf'));
    console.log(
      JSON.stringify({
        output,
        pages: total,
        lessons: pages.length,
        bytes: fs.statSync(output).size,
      }),
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
