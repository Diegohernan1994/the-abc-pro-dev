const root=document.querySelector<HTMLElement>('.adu-types-carousel');
if(root){
 const track=root.querySelector<HTMLElement>('.adu-types-grid')!;
 const viewport=root.querySelector<HTMLElement>('.adu-types-viewport')!;
 const cards=[...root.querySelectorAll<HTMLElement>('.adu-type-card')];
 const dots=[...root.querySelectorAll<HTMLButtonElement>('[data-type-slide]')];
 const pause=root.querySelector<HTMLButtonElement>('.adu-types-pause')!;
 const mobile=matchMedia('(max-width:1200px)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let current=0,paused=false,hovered=false,touching=false,focused=false,visible=false;
 let timer:ReturnType<typeof setInterval>|undefined;
 let touchX=0,touchY=0;
 const render=()=>{
  track.style.transform=mobile.matches?`translateX(-${current*100}%)`:'';
  cards.forEach((card,i)=>{
   card.inert=mobile.matches&&i!==current;
   if(mobile.matches)card.setAttribute('aria-hidden',String(i!==current));
   else card.removeAttribute('aria-hidden');
  });
  dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
  if(mobile.matches){root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label','Types of ADUs');}
  else {root.removeAttribute('role');root.removeAttribute('aria-roledescription');root.removeAttribute('aria-label');}
 };
 const schedule=()=>{
  clearInterval(timer);
  if(mobile.matches&&!reduced.matches&&!paused&&!hovered&&!touching&&!focused&&visible&&!document.hidden){
   timer=setInterval(()=>{current=(current+1)%cards.length;render();},2000);
  }
 };
 const move=(index:number)=>{current=(index+cards.length)%cards.length;render();schedule();};
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>move(i)));
 root.querySelector('.adu-types-prev')?.addEventListener('click',()=>move(current-1));
 root.querySelector('.adu-types-next')?.addEventListener('click',()=>move(current+1));
 pause.addEventListener('click',()=>{
  paused=!paused;pause.textContent=paused?'Play':'Pause';
  pause.setAttribute('aria-label',paused?'Play automatic ADU types':'Pause automatic ADU types');schedule();
 });
 viewport.addEventListener('touchstart',e=>{touching=true;touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;schedule();},{passive:true});
 viewport.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;
  touching=false;
  if(mobile.matches&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))move(current+(dx<0?1:-1));
  else schedule();
 },{passive:true});
 viewport.addEventListener('touchcancel',()=>{touching=false;schedule();},{passive:true});
 root.addEventListener('mouseenter',()=>{hovered=true;schedule();});
 root.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 root.addEventListener('focusin',()=>{focused=true;schedule();});
 root.addEventListener('focusout',e=>{focused=root.contains(e.relatedTarget as Node);schedule();});
 root.addEventListener('keydown',e=>{
  if(!mobile.matches)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(current+(e.key==='ArrowRight'?1:-1));}
 });
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15});
 observer.observe(root);
 mobile.addEventListener('change',()=>{render();schedule();});
 reduced.addEventListener('change',schedule);
 document.addEventListener('visibilitychange',schedule);
 render();schedule();
}
