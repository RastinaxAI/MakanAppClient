(()=>{
 const S=window.MAKAN_SCENES,L=window.MAKAN_LAYOUT,qs=s=>document.querySelector(s);
 let index=0,mode='compare',width=390,height=844,theme='design',large=false;const drafts={};
 const group=qs('#group'),search=qs('#query'),list=qs('#scene-list'),preview=qs('#preview');
 function filter(){const q=search.value.trim().toLowerCase();list.innerHTML=S.map((s,i)=>({s,i})).filter(({s})=>(!group.value||s.group===group.value)&&(!q||[s.id,s.title,s.role,L.groups[s.group],...(s.tags||[])].join(' ').toLowerCase().includes(q))).map(({s,i})=>`<button type="button" data-index="${i}" class="${i===index?'selected':''}"><span dir="ltr">${s.id}</span><b>${s.title}</b><small>${L.groups[s.group]||'تکمیلی'}</small></button>`).join('');qs('#count').textContent=list.children.length+' موقعیت';}
 function remember(){const el=document.activeElement;if(preview.contains(el)&&el.id&&/INPUT|TEXTAREA/.test(el.tagName)){const key=S[index].id+'-'+el.id.split('-control-').pop();drafts[key]=el.value;}}
 function scaleFrame(w,h,available,cap=1){return Math.max(.15,Math.min(cap,available/w));}
 function render(){
  const s=S[index];qs('#scene-title').textContent=s.title;qs('#scene-meta').textContent=s.id+' · '+(s.role||'حساب فعال')+' · '+s.designStatus;
  const available=Math.max(330,qs('#preview-host').clientWidth-48);
  const set=mode==='compare'?Object.entries(L.metrics).map(([type,m])=>({type,...m,scale:scaleFrame(m.width,m.height,available*({mobile:.17,tablet:.31,desktop:.52}[type])-15,.9)})):[{type:width<768?'mobile':width<1200?'tablet':'desktop',width,height,scale:scaleFrame(width,height,available,1)}];
  preview.innerHTML=set.map(m=>`<section class="v-frame"><div class="v-frame-title">${m.type==='mobile'?'موبایل':m.type==='tablet'?'تبلت':'دسکتاپ'} <span dir="ltr">${m.width} × ${m.height}</span></div><div class="v-stage" style="width:${m.width*m.scale}px;height:${m.height*m.scale}px;--scale:${m.scale}">${L.device(s,m.type,m.width,m.height,{uid:s.id+'-'+m.type})}</div></section>`).join('');
  preview.querySelectorAll('.rx-root').forEach(root=>{if(theme!=='design')root.classList.toggle('dark',theme==='dark');if(large)root.classList.add('large-text');});
  preview.querySelectorAll('input,textarea').forEach(el=>{if(el.id){const key=s.id+'-'+el.id.split('-control-').pop();if(key in drafts)el.value=drafts[key];}});
  requestAnimationFrame(()=>{
   preview.querySelectorAll('.rx-content').forEach(el=>{el.closest('.rx-viewport').classList.toggle('has-scroll',el.scrollHeight>el.clientHeight+4);});
   if(s.focus){const target=preview.querySelector(s.focus==='field'?'.input':s.focus==='search'?'.search':'.row[tabindex]');if(target)target.classList.add('focus-example');}
  });
  filter();qs('#mode-compare').classList.toggle('on',mode==='compare');qs('#mode-single').classList.toggle('on',mode==='single');qs('#large').classList.toggle('on',large);
  qs('#guide').innerHTML=['mobile','tablet','desktop'].map(type=>`<p><b>${type==='mobile'?'موبایل':type==='tablet'?'تبلت':'دسکتاپ'}:</b> ${L.behavior(s,type)}</p>`).join('');
 }
 list.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(!b)return;remember();index=Number(b.dataset.index);render();});
 group.addEventListener('change',filter);search.addEventListener('input',filter);
 qs('#mode-compare').onclick=()=>{remember();mode='compare';render();};qs('#mode-single').onclick=()=>{remember();mode='single';render();};
 qs('#preset').onchange=e=>{remember();[width,height]=e.target.value.split('x').map(Number);qs('#width').value=width;qs('#height').value=height;mode='single';render();};
 function custom(){remember();width=Math.max(320,Math.min(2400,Number(qs('#width').value)||390));height=Math.max(568,Math.min(1600,Number(qs('#height').value)||844));mode='single';render();}
 qs('#width').onchange=custom;qs('#height').onchange=custom;
 qs('#theme').onchange=e=>{remember();theme=e.target.value;render();};qs('#large').onclick=()=>{remember();large=!large;render();};
 qs('#prev').onclick=()=>{if(index>0){remember();index--;render();}};qs('#next').onclick=()=>{if(index<S.length-1){remember();index++;render();}};
 qs('#jump').onsubmit=e=>{e.preventDefault();const q=qs('#jump-id').value.trim().toLowerCase();const i=S.findIndex(s=>s.id.toLowerCase()===q||s.id.toLowerCase()===q.replace(/-[mtd]$/,''));if(i>=0){remember();index=i;group.value='';search.value='';render();}else qs('#live-hint').textContent='شناسه پیدا نشد. نمونه: MK-95 یا RX-001';};
 function closeDialog(root){root.querySelector('.rx-overlay')?.remove();root.querySelector('.rx-app-frame')?.removeAttribute('inert');root.querySelector('.rx-head .rx-icon-button:last-child')?.focus();qs('#live-hint').textContent='پنجره طراحی بسته شد؛ برای دیدن دوباره، موقعیت را از فهرست انتخاب کنید.';}
 preview.addEventListener('click',e=>{
  const root=e.target.closest('.rx-root');if(!root)return;
  const sw=e.target.closest('[role=switch]');if(sw){const on=sw.getAttribute('aria-checked')!=='true';sw.setAttribute('aria-checked',String(on));sw.querySelector('.toggle')?.classList.toggle('on',on);return;}
  const ck=e.target.closest('[role=checkbox]');if(ck){const on=ck.getAttribute('aria-checked')!=='true';ck.setAttribute('aria-checked',String(on));ck.querySelector('.checkbox')?.classList.toggle('checked',on);return;}
  const radio=e.target.closest('[role=radio]');if(radio){radio.parentElement.querySelectorAll('[role=radio]').forEach(r=>{const on=r===radio;r.setAttribute('aria-checked',String(on));r.querySelector('.radio')?.classList.toggle('selected',on);});return;}
  if(e.target.closest('.rx-dialog-head button,.rx-dialog-actions .secondary')){closeDialog(root);return;}
  const row=e.target.closest('.row[role=button]');if(row){row.parentElement.querySelectorAll('.rx-selected').forEach(r=>r.classList.remove('rx-selected'));row.classList.add('rx-selected');}
  const button=e.target.closest('button');if(button&&!button.disabled)qs('#live-hint').textContent='کنترل «'+(button.textContent.trim()||button.getAttribute('aria-label'))+'» در نمونه انتخاب شد. هیچ فرمانی به بک‌اند ارسال نمی‌شود.';
 });
 preview.addEventListener('input',e=>{const el=e.target;if(el.id&&/INPUT|TEXTAREA/.test(el.tagName)){const key=S[index].id+'-'+el.id.split('-control-').pop();drafts[key]=el.value;preview.querySelectorAll('input,textarea').forEach(peer=>{if(peer!==el&&peer.id.split('-control-').pop()===el.id.split('-control-').pop())peer.value=el.value;});}});
 preview.addEventListener('keydown',e=>{
  const root=e.target.closest('.rx-root');if(!root)return;
  if(e.key==='Escape'&&root.querySelector('.rx-overlay')){e.preventDefault();closeDialog(root);return;}
  if(e.key===' '&&e.target.matches('[role=checkbox],[role=switch],[role=radio]')){e.preventDefault();e.target.click();}
  const dialog=e.target.closest('.rx-dialog');if(e.key==='Tab'&&dialog){const focusable=[...dialog.querySelectorAll('button:not(:disabled),input,textarea,[tabindex="0"]')].filter(el=>el.offsetParent!==null);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&e.target===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first?.focus();}}
 });
 window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();search.focus();}});
 let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{remember();render();},120);});
 filter();render();
})();
