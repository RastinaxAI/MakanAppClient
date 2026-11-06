const fs=require('fs'),path=require('path');
module.exports=function(C,S){
 const {icon,btn,badge,row,field,kv,alert,empty,phone,aside,fa,avatar}=C;
 const api=JSON.parse(fs.readFileSync(path.join(__dirname,'openapi.snapshot.json')));
 const atlasPages=JSON.parse(fs.readFileSync(path.join(__dirname,'assets','atlas_ui_pages.json')));
 const evidence=JSON.parse(fs.readFileSync(path.join(__dirname,'api_evidence.json')));
 const pages=[],records=[],groups=[];let next=83,current=null;
 const h={};
 const sampleValues={
  'از پیش‌فاکتور معتبر':'۲٬۹۰۰٬۰۰۰ تومان','همان مبلغ معتبر سفارش':'۲٬۹۰۰٬۰۰۰ تومان','از سفارش معتبر':'۲٬۹۰۰٬۰۰۰ تومان',
  'طبق اشتراک جاری':'۱۰۰ عضو آموزشی','طبق خلاصه تجاری':'۶۴ عضو · ۶ گیگابایت','طبق اثر ثبت‌شده سفارش':'بسته ماهانه فعال',
  'نسخه تجاری انتخاب‌شده':'بسته آموزشگاه · ماهانه','نسخه معتبر کاتالوگ':'بسته آموزشگاه · نسخه ۲','گزینه مجاز کاتالوگ':'بسته پایه ماهانه',
  'فیلدهای معتبر قرارداد تجاری':'ماهانه · ۲٬۹۰۰٬۰۰۰ تومان','مقادیر مجاز همان نسخه':'۱۰۰ عضو آموزشی · ۱۰ گیگابایت',
  'طبق فیلد معتبر':'ماهانه · ۲٬۹۰۰٬۰۰۰ تومان','طبق نسخه منتخب':'۱۰۰ عضو آموزشی','طبق سیاست نسخه':'اعتبار مصرفی جداگانه',
  'نوع و سقف مجاز از قرارداد':'فایل PDF و تصویر مجاز','طبق تنظیمات پیش‌نویس':'۲۰ نمره · ۲ تلاش',
  'یکی از قالب‌های مجاز قرارداد':'قالب قابل انتخاب گزارش','یکی از دلایل مجاز':'محتوای نامرتبط یا آسیب‌زا',
  'از فهرست نقش‌های معتبر':'رسیدگی‌کننده گزارش','حساب مجاز منتخب':'مریم رضایی','طبق وضعیت معتبر':'حضور پس از بازبینی مدرس',
 };
 h.F=(label,value,hint='',area=false)=>field(label,sampleValues[value]||value,hint,'',area);
 h.Err=(label,value,error)=>field(label,value,error,'error');
 h.K=pairs=>`<div class="card v4-meta">${pairs.map(([k,v])=>kv(k,sampleValues[v]||v)).join('')}</div>`;
 h.L=items=>`<div class="list v4-list">${items.map(([t,s,ic='FileText',state='',kind=''])=>row(t,s,ic,state?badge(state,'',kind):'chev')).join('')}</div>`;
 h.H=(title,desc='',state='')=>`<div class="card hero v4-hero">${state?badge(state):''}<h3>${title}</h3>${desc?`<p>${desc}</p>`:''}</div>`;
 const technical=/(قرارداد|endpoint|snapshot|expectedVersion|rowVersion|clientOperationId|clientMessageId|enum|cache|cursor|بک‌اند|طرح‌واره|مقادیر معتبر|پارامتر|بدنه درخواست|پیاده‌سازی)/i;
 h.P=text=>technical.test(text)?`<template class="v4-dev-note">${text}</template>`:`<p class="policy v4-policy">${text}</p>`;
 h.A=(text,kind='',ic='Info')=>technical.test(text)?(/مستند نشده|نیازمند|ندارد/.test(text)?alert('این قابلیت هنوز فعال نشده است. می‌توانید به بخش قبلی برگردید.',kind,ic):`<template class="v4-dev-note">${text}</template>`):alert(text,kind,ic);
 h.B=btn;h.badge=badge;h.icon=icon;h.seg=C.seg;h.chips=C.chips;h.file=C.file;h.check=C.checkbox;
 h.T=items=>`<div class="list v4-list">${items.map(([t,s,on=true])=>`<div class="row"><div class="grow"><h4>${t}</h4><p>${s||''}</p></div><span class="toggle ${on?'on':''}"></span></div>`).join('')}</div>`;
 h.R=(items,on=0)=>`<div class="list v4-list">${items.map(([t,s],i)=>`<div class="row"><span class="radio ${i===on?'selected':''}"></span><div class="grow"><h4>${t}</h4>${s?`<p>${s}</p>`:''}</div></div>`).join('')}</div>`;
 h.Search=C.search;h.Empty=(title,desc,ic='Search')=>empty(ic,title,desc,true);
 h.Stats=items=>`<div class="stats">${items.map(([n,l])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>`;
 h.Bars=(labels=[['حضور','۸۶٪',86],['تحویل','۷۲٪',72],['پیشرفت','۶۸٪',68]])=>`<div class="card v4-bars">${labels.map(([t,n,w])=>`<div class="between"><span>${t}</span><b>${n}</b></div><div class="progress"><i style="width:${w}%"></i></div>`).join('')}</div>`;
 h.Calendar=()=>`<div class="card v4-calendar"><div class="between"><b>آبان ۱۴۰۵</b>${icon('ChevronLeft')}</div><div class="calendar-grid">${['ش','ی','د','س','چ','پ','ج'].map(d=>`<small>${d}</small>`).join('')}${'<span aria-hidden="true"></span>'.repeat(6)}${Array.from({length:30},(_,i)=>`<span class="${i===13?'selected':''}">${fa(i+1)}</span>`).join('')}</div></div>`;
 h.Receipt=(title,pairs)=>`<div class="success-mark">${icon('CircleCheck')}</div><h3 class="v4-receipt-title">${title}</h3>${h.K(pairs)}`;
 h.Chat=(title='گروه ریاضی دهم')=>`<div class="v4-chat-preview">${C.bubble('برای تمرین فردا، سؤال دوم را هم بررسی کنید.',false,'مریم رضایی')}${C.bubble('پاسخم را در بخش تکلیف کلاس تحویل دادم.',true)}${h.file('تمرین فصل دوم.pdf','PDF · ۲ صفحه',icon('Download'))}</div>`;
 h.Upload=(title='انتخاب فایل',desc='نوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.')=>`<div class="upload">${icon('Upload')}<b>${title}</b><p>${desc}</p></div>`;
 h.Actions=items=>items.map(([t,ic='ChevronLeft',danger=false])=>`<div class="action-row ${danger?'danger':''}">${icon(ic)}${t}</div>`).join('');
 h.Question=()=>`${h.H('صورت سؤال','معادله زیر را حل و روش خود را توضیح دهید.')}<div class="v4-math">x² − 5x + 6 = 0</div>${h.F('پاسخ تشریحی','دو عدد با حاصل‌ضرب ۶ و مجموع ۵ می‌یابیم…','',true)}`;
 const V=(title,role,blocks,action='',opts={})=>({title,role,blocks:Array.isArray(blocks)?blocks:[blocks],action,...opts});
 const O=(title,role,blocks,action='تأیید',opts={})=>V(title,role,blocks,action,{...opts,overlay:true});
 function group(key,title){current={key,title,start:pages.length,views:0};groups.push(current);}
 function atlas(ids){return ids.map(id=>{let ps=(atlasPages[id]||[]).filter(n=>n>10);if(ps.length>1)ps=ps.filter(n=>![15,57,62,129,229,283,292,319,331,348,364].includes(n));return `${id} ص ${ps.join('،')}`;}).join(' · ');}
 function render(v){
  const body=v.blocks.join('');let overlay='';
  const baseNames={school:'آموزشگاه آفتاب',messaging:'باشگاه کتاب‌خوانی',personal:'کارگاه داستان‌نویسی',account:'تنظیمات',platform:'مدیریت ماکان',states:'ماکان',dark:'ماکان'};
  let baseName=v.baseTitle||v.backdrop?.title||baseNames[current.key]||'ماکان';
  let backdrop=v.backdrop?.blocks.join('');
  if(!backdrop&&/منبع|انتشار منبع|نمایش منبع/.test(v.title)){baseName='منابع من';backdrop=h.H('یادداشت‌های فصل دوم','منبع شخصی · نسخه ۳')+h.L([['محتوای منبع','پیش‌نویس و فایل آماده','BookOpen'],['نسخه و نمایش','تنظیمات همین منبع','History']]);}
  if(!backdrop&&/پیام|سنجاق|واکنش/.test(v.title)){baseName='باشگاه کتاب‌خوانی';backdrop=h.Chat();}
  if(!backdrop&&/اعلان|صدا/.test(v.title)){baseName='تنظیم اعلان';backdrop=h.H('اعلان‌های شما','ترجیح حساب و دستگاه')+h.T([['اعلان دستگاه','برای این زمینه',true],['ساعات سکوت','۲۲ تا ۸',true]]);}
  if(!backdrop&&/ذخیره|تغییر|ویرایش|نسخه/.test(v.title)){baseName='ویرایش اطلاعات';backdrop=h.F('عنوان','کارگاه داستان‌نویسی')+h.F('توضیحات','متن ناتمام شما در همین فرم حفظ شده است.','',true);}
  if(!backdrop)backdrop=h.H(baseName,'فضای مجاز شما')+h.L([['اطلاعات و اعضا','دسترسی مطابق نقش فعلی','UsersRound'],['تنظیمات و فعالیت‌ها','ابزارهای مجاز همین زمینه','Settings2']]);
  if(v.overlay){overlay=`<div class="veil"></div><section class="sheet-modal v4-modal"><div class="handle"></div><h3>${v.title}</h3><div class="v4-modal-body">${body}</div>${v.action?`<div class="v4-modal-actions">${btn(v.action,v.danger?'Trash2':'Check',v.danger?'danger':'')}${btn('انصراف','','secondary')}</div>`:''}</section>`;}
  return C.finishScreen({title:v.overlay?baseName:v.title,sub:v.overlay?(v.backdrop?.role||v.context||v.role):(v.context||v.role),back:v.active===undefined,right:'',active:v.overlay?(v.backdrop?.active??null):(v.active??null),dark:!!v.dark,body:v.overlay?backdrop:body,bodyClass:'compact v4-body',footer:!v.overlay&&v.action?btn(v.action,v.actionIcon||'ArrowLeft',v.danger?'danger':/^در حال/.test(v.action)?'disabled':''):'' ,overlay});
 }
 function trio(title,views,opts={}){
  if(views.length!==3)throw Error('Each page must contain exactly three designed views: '+title);
  const pageRecords=views.map((v,index)=>{
   const r={id:`MK-${next++}`,title:v.title,role:v.role,group:current.key,tags:v.tags||opts.tags||[],ops:v.ops||[],atlas:v.atlas||opts.atlas||[],kind:v.overlay?'sheet':v.kind||'screen',proposal:!!v.proposal,developer_notes:[...v.blocks.join('').matchAll(/<template class="v4-dev-note">([\s\S]*?)<\/template>/g)].map(m=>m[1]),interaction:v.interaction||opts.interaction||'ورود عمیق؛ بازگشت به جای قبلی. تأیید موفق پس از پاسخ معتبر؛ خطا در همان زمینه.'};records.push(r);return {...v,record:r,backdrop:v.overlay?(v.backdrop||[...views.slice(0,index)].reverse().find(x=>!x.overlay)||views.find(x=>!x.overlay)):undefined};
  });
  const roles=[...new Set(views.map(v=>v.role))].join(' · ');
  const rules=opts.rules||[
   ['مسیر',opts.pathTitle||'کار در زمینه درست',opts.flow||'ورود از فهرست یا جزئیات مرتبط؛ عنوان، نقش و فضای فعال روشن است. بازگشت، فیلتر و جای فهرست را حفظ می‌کند.','Route'],
   ['رفتار',opts.stateTitle||'ثبت و نتیجه قابل پیگیری',opts.states||'هنگام ثبت، اقدام تکراری بسته است؛ پاسخ ناموفق، متن و انتخاب‌ها را نگه می‌دارد. موفقیت فقط با پاسخ معتبر نشان داده می‌شود.','CircleCheck'],
   ['اختیار',opts.roleTitle||'عمل مطابق اختیار فعلی',opts.permission||'نمایش دکمه و نتیجه با مجوز همان زمینه هماهنگ است؛ لغو دسترسی، داده تازه یا عمل حساس را باز نمی‌کند.','ShieldCheck'],
  ];
  const tag=opts.proposal?'پیشنهاد محصول · قرارداد کامل لازم':`قرارداد مستند · ${roles}`;
  const source=[opts.atlas?.length?atlas(opts.atlas):'طراحی تکمیلی نسخه ۴',`OpenAPI ثبت‌شده ۵ نوامبر ۲۰۲۶: ${(opts.tags||[]).join('،')||'رفتار رابط'}`,opts.source||'وجود قرارداد، تأیید اجرای کسب‌وکار نیست.'].join(' | ');
  pages.push({title,sub:opts.sub||`${current.title}؛ ادامه همان هویت آبی، با مسیر، پنجره و حالت‌های متناسب نقش.`,chapter:current.title,content:`<div class="stage"><div class="visuals">${pageRecords.map(v=>phone(v.record.id,v.title,v.caption||`${v.role} · ${v.overlay?'پنجره کوتاه در همان زمینه':'نمای مستقل با بازگشت روشن'}`,render(v))).join('')}</div>${aside(rules,opts.note||'نام‌ها، زمان‌ها، ظرفیت و نتیجه‌ها نمونه طراحی‌اند. مقدار واقعی و مجوز از قرارداد معتبر همان زمینه خوانده می‌شود.',tag)}</div>`,source,cls:''});
  current.views+=3;
 }
 function desktop(title,role,content,opts={}){
  const id=`MK-${next++}`;records.push({id,title,role,group:current.key,tags:opts.tags||[],ops:opts.ops||[],kind:'desktop',atlas:opts.atlas||[],proposal:!!opts.proposal,interaction:opts.interaction||'فهرست و جزئیات کنار هم؛ حفظ فیلتر، ترتیب تمرکز و بازگشت.'});
  let shell=C.desktopShell(`<header class="desk-head"><div><h2>${title}</h2><p>${role} · ${opts.context||'آموزشگاه آفتاب'}</p></div>${btn(opts.action||'ذخیره تغییرات','Check')}</header><div class="desk-body v4-desk">${content}</div>`,opts.active??0,!!opts.admin);
  if(!opts.admin&&opts.context)shell=shell.replace('فضای شخصی<br><b>سارا احمدی</b>',`${C.e(opts.context)}<br><b>${C.e(role)}</b>`);
  if(opts.admin&&opts.adminSection)shell=shell.replace('بررسی درخواست‌ها',C.e(opts.adminSection));
  pages.push({title,sub:opts.sub||'همان کار در عرض گسترده؛ فهرست، زمینه و اقدام اصلی کنار هم قرار دارند.',chapter:current.title,content:`<div class="stage"><div class="desktop-wrap" data-screen="${id}">${shell}<div class="desk-caption">${id} · ${opts.caption||'در تبلت پنل‌ها جمع می‌شوند و در موبایل همین مسیر به چند نمای عمیق تقسیم می‌شود.'}</div></div>${aside([['کار','اطلاعات کنار تصمیم',opts.flow||'انتخاب ردیف، جزئیات را در همان زمینه باز می‌کند؛ وضعیت انتخاب و فیلتر پایدار می‌ماند.','PanelsTopLeft'],['حالت','بازخورد نزدیک عمل','خطا کنار فیلد و نتیجه ثبت در همان پنل دیده می‌شوند؛ انتظار جزئی، کل میز کار را قفل نمی‌کند.','CircleCheck'],['دسترسی','همان قواعد موبایل','میان‌بُر صفحه‌کلید، تمرکز روشن و نام قابل خواندن برای کنترل‌ها لازم است.','Accessibility']],opts.note||'این نما طراحی قابل بازبینی است؛ اتصال زنده و آزمون کارایی محصول انجام نشده است.','دسکتاپ · طراحی تکمیلی')}</div>`,source:`OpenAPI ۵ نوامبر ۲۰۲۶: ${(opts.tags||[]).join('،')} | ${opts.atlas?.length?atlas(opts.atlas):'چیدمان تکمیلی نسخه ۴'}`,cls:''});current.views++;
 }
 h.Table=(headers,rows)=>`<table class="data-table"><thead><tr>${headers.map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 return {C,S,h,V,O,trio,group,desktop,pages,records,groups,api,evidence,atlas};
};
