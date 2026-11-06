const fs=require('fs'),path=require('path');
const C=require('./components.cjs');
const {chromium}=require('playwright');
(async()=>{
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,'assets/source_scenes.json')));
 const extra=require('./new-scenes.cjs')(C);
 const scenes=[...source,...extra];
 const copy=require('./microcopy.cjs');for(const s of scenes)for(const key of ['blocks','overlayBlocks'])s[key]=(s[key]||[]).map(raw=>Object.entries(copy).reduce((text,[from,to])=>text.replaceAll(from,to),raw));
 const b=await chromium.launch({headless:true,executablePath:process.env.MAKAN_CHROME||undefined,args:['--no-sandbox']});const p=await b.newPage();
 const out=await p.evaluate(scenes=>scenes.map(s=>{
  let serial=0;
  const fields=[];const rows=[];const normalize=blocks=>blocks.map(raw=>{
   const holder=document.createElement('div');holder.innerHTML=raw;
   holder.querySelectorAll('script,template,.spacer').forEach(x=>x.remove());
   holder.querySelectorAll('.field').forEach(f=>{
    const label=f.querySelector('label');const input=f.querySelector('.input');if(!input)return;
    const val=input.textContent.trim(),name=label?.textContent.trim()||'مقدار';fields.push({label:name,value:val});
    const tag=input.classList.contains('textarea')?'textarea':'input';const control=document.createElement(tag);
    control.className=input.className;control.id='__VIEW__-control-'+(++serial);control.setAttribute('aria-label',name);
    if(tag==='textarea'){control.textContent=val;control.rows=3;}else{control.value=val;control.setAttribute('value',val);control.setAttribute('type','text');}
    if(/شماره|شناسه|کاربری|پیوند|ایمیل/.test(name))control.setAttribute('dir','auto');
    if(input.classList.contains('error'))control.setAttribute('aria-invalid','true');
    if(label)label.setAttribute('for',control.id);
    const hint=f.querySelector('.hint,.err');if(hint){hint.id=control.id+'-hint';control.setAttribute('aria-describedby',hint.id);}
    input.replaceWith(control);
   });
   holder.querySelectorAll('.policy,.screen-note').forEach(el=>{if(/expectedVersion|rowVersion|clientOperationId|endpoint|snapshot|بک\u200cاند|درخواست با نسخه فعلی تنظیمات/.test(el.textContent))el.remove();});
   holder.querySelectorAll('.btn').forEach(btn=>{const n=document.createElement('button');n.className=btn.className;n.innerHTML=btn.innerHTML;n.type='button';if(btn.classList.contains('disabled')||/^در حال/.test(btn.textContent))n.disabled=true;btn.replaceWith(n);});
   holder.querySelectorAll('.toggle').forEach(t=>{const sw=document.createElement('button');sw.className='switch-hit';sw.type='button';sw.setAttribute('role','switch');sw.setAttribute('aria-checked',String(t.classList.contains('on')));sw.setAttribute('aria-label',t.closest('.row')?.querySelector('h4')?.textContent||'تغییر تنظیم');t.setAttribute('aria-hidden','true');t.replaceWith(sw);sw.append(t);});
   holder.querySelectorAll('.row:has(.radio)').forEach(r=>{const radio=r.querySelector('.radio');r.tabIndex=0;r.setAttribute('role','radio');r.setAttribute('aria-checked',String(radio.classList.contains('selected')));radio.setAttribute('aria-hidden','true');r.parentElement.setAttribute('role','radiogroup');});
   holder.querySelectorAll('.checkline').forEach(r=>{r.setAttribute('role','checkbox');r.tabIndex=0;r.setAttribute('aria-checked',String(r.querySelector('.checkbox')?.classList.contains('checked')));});
   holder.querySelectorAll('.seg').forEach(group=>{group.setAttribute('role','tablist');group.querySelectorAll('span').forEach(tab=>{tab.setAttribute('role','tab');tab.tabIndex=0;tab.setAttribute('aria-selected',String(tab.classList.contains('on')));});});
   holder.querySelectorAll('.calendar-grid span:not([aria-hidden])').forEach(day=>{if(!day.textContent.trim())return;const b=document.createElement('button');b.type='button';b.className=day.className;b.textContent=day.textContent;b.setAttribute('aria-label',day.textContent+' آبان ۱۴۰۵');if(day.classList.contains('selected'))b.setAttribute('aria-pressed','true');day.replaceWith(b);});
   holder.querySelectorAll('.row').forEach(r=>{const name=r.querySelector('h4')?.textContent;if(name){rows.push({title:name,sub:r.querySelector('p')?.textContent||''});if(!r.hasAttribute('role')&&!r.querySelector('button')){r.setAttribute('tabindex','0');r.setAttribute('role','button');r.setAttribute('aria-label',name);}}});
   holder.querySelectorAll('table').forEach(table=>{
    const heads=[...table.querySelectorAll('th')].map(t=>t.textContent.trim());
    const data=[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(t=>t.innerHTML));
    const wrap=document.createElement('div');wrap.className='rx-table-shell';table.replaceWith(wrap);wrap.append(table);
    const cards=document.createElement('div');cards.className='rx-table-cards';
    cards.innerHTML=data.map(cells=>`<article class="card rx-record"><h4>${cells[0]||''}</h4>${cells.slice(1).map((val,i)=>`<div class="kv"><span class="key">${heads[i+1]||'مشخصات'}</span><span class="val">${val}</span></div>`).join('')}<button class="rx-record-open" type="button">دیدن جزئیات</button></article>`).join('');wrap.append(cards);
   });
   return holder.innerHTML;
  }).filter(Boolean);
  const mainBlocks=normalize(s.blocks||[]),contextFields=[...fields],contextRows=[...rows];
  const normalized={...s,blocks:mainBlocks,overlayBlocks:normalize(s.overlayBlocks||[]),contextFields,contextRows};
  normalized.fieldInventory=fields;normalized.rowInventory=rows;
  const html=(s.overlay?normalized.overlayBlocks:normalized.blocks).join('');
  normalized.kind=s.overlay?'modal':/class="[^\"]*bubble/.test(html)?'chat':(html.match(/class="field/g)||[]).length>=2?'form':/class="[^\"]*(data-table|rx-table-shell|list|chat-row)/.test(html)?'list':/class="[^\"]*(empty|success-mark)/.test(html)?'status':/v4-math|ai-card|document-preview|<p>/.test(html)?'article':'dashboard';
  normalized.readOnly=!!s.readOnly||/فقط.?خواندنی|امکان نوشتن برای حساب شما فعال نیست/.test(s.title+' '+html);
  if(normalized.kind==='chat'&&!normalized.readOnly&&!s.overlay&&(s.actions||[]).some(a=>a.label==='نوشتن پیام'))normalized.hasComposer=true;
  if(normalized.hasComposer&&normalized.kind==='chat')normalized.actions=(normalized.actions||[]).filter(a=>!['نوشتن پیام','ارسال پیام'].includes(a.label));
  normalized.restricted=/دسترسی تغییر کرد|دسترسی مجاز نیست|عضویت پایان یافته|دعوت دیگر معتبر نیست|مجاز نیست|دستیار در دسترس نیست/.test(s.title)||/این بخش در دسترس شما نیست/.test(html);
  normalized.auth=/شروع آشنا|کد تأیید|کد تایید|ورود با شماره|شماره همراه شما|محدودیت ارسال کد/.test(s.title);
  normalized.productPending=!!s.productPending||((s.tags||[]).includes('PersonalClassAcademics'))||(s.group==='personal'&&s.sourcePage>=20&&s.sourcePage<=29);
  normalized.designStatus=normalized.productPending?'آموزش مستقل؛ عرضه نیازمند تأیید محصول':s.proposal?'پیشنهاد محصول؛ قرارداد تکمیلی لازم':s.designStatus||'طراحی بر پایه قرارداد ثبت‌شده؛ اجرا آزموده نشده';
  return normalized;
 }),scenes);
 fs.writeFileSync(path.join(__dirname,'assets/scenes.json'),JSON.stringify(out));
 await b.close();console.log(JSON.stringify({source:source.length,new:extra.length,total:out.length,deviceFrames:out.length*3,kinds:out.reduce((a,s)=>(a[s.kind]=(a[s.kind]||0)+1,a),{})},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
