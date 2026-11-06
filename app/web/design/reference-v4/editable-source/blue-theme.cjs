function revisePages(pages,C){
 const cover=pages[0];
 cover.content=cover.content.replace(/(<div class="cover-tag">)[\s\S]*?(<\/div>)/,
  '$1بازنگری رنگ · نسخه ۳٫۰ · ۱۲ آبان ۱۴۰۵$2');
 cover.source='هویت آبی بر پایه تصویر ارسالی؛ چیدمان و جریان‌های نسخه ۲ حفظ شده‌اند. همه داده‌های صفحه‌ها نمونه‌اند.';

 const foundation=pages[3];
 foundation.sub='هویت آبی برگرفته از تصویر ارسالی؛ همان اجزا، فاصله‌ها و تایپوگرافی با کنتراست دقیق‌تر.';
 const swatches=[
  ['#156FEE','#FFFFFF','اقدام اصلی'],['#EAF2FF','#182A45','سطح تأکید'],
  ['#182A45','#FFFFFF','متن اصلی'],['#F5F8FE','#182A45','پس‌زمینه'],
 ].map(([bg,fg,label])=>`<div class="swatch" style="background:${bg};color:${fg}"><span>${label}</span><b>${bg}</b></div>`).join('');
 foundation.content=foundation.content.replace(/<div class="swatches">[\s\S]*?<\/div><p class="board-p"/,
  `<div class="swatches">${swatches}</div><p class="board-p"`);
 foundation.content=foundation.content.replace(
  'کهربایی برای انتظار و هشدار، قرمز برای خطا و عمل مخرب. رنگ به‌تنهایی حامل معنا نیست.',
  'متن آبی روی سطح روشن: <span class="latin">#0D5ECC</span>؛ سفید روی اقدام اصلی: کنتراست ۴٫۶۳:۱. سبز برای موفقیت، کهربایی برای انتظار و قرمز برای خطا.');
 foundation.source='بازنگری رنگ بر پایه تصویر ارسالی؛ Modern Minimal با اجزای قبلی. جفت‌رنگ‌های متن و اقدام محاسبه شده‌اند؛ آزمون محصول اجراشده انجام نشده است.';

 const dark=pages.find(p=>p.chapter==='حالت تاریک');
 if(!dark)throw Error('Dark-theme design page was not found');
 dark.content=dark.content.replace('سبز روشن همه صفحه را پر نمی‌کند.','آبی روشن فقط برای اقدام و انتخاب فعال به کار می‌رود.');
 dark.content=dark.content.replace(/#[0-9A-F]{6}\b/g,h=>`<span class="latin">${h}</span>`);

 pages[1].sub='نسخه ۳ با هویت آبی؛ همان صفحه‌ها و جریان‌های نسخه قبلی، با فهرست پیونددار.';
 const last=pages[pages.length-1];
 last.source='نسخه طراحی ۳٫۰ · ۱۲ آبان ۱۴۰۵ · بازنگری رنگ؛ چیدمان نسخه ۲ حفظ شده است. داده‌ها نمونه‌اند و اجرای بک‌اند تأیید نشده است.';
}
module.exports={revisePages};
