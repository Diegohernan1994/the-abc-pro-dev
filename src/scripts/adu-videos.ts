const videoRoot=document.querySelector<HTMLElement>('.adu-video-carousel');
if(videoRoot){
 const cards=[...videoRoot.querySelectorAll<HTMLButtonElement>('.adu-video-card')];
 const track=videoRoot.querySelector<HTMLElement>('.adu-video-track')!;
 const viewport=videoRoot.querySelector<HTMLElement>('.adu-video-viewport')!;
 const dots=[...videoRoot.querySelectorAll<HTMLButtonElement>('[data-video-slide]')];
 const pause=videoRoot.querySelector<HTMLButtonElement>('.adu-video-pause')!;
 const dialog=document.querySelector<HTMLDialogElement>('.adu-video-dialog')!;
 const player=dialog.querySelector<HTMLElement>('.adu-video-player')!;
 const mobile=matchMedia('(max-width:1200px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let current=0,paused=false,hovered=false,touching=false,focused=false,visible=false,opened=false;
 let timer:ReturnType<typeof setInterval>|undefined,touchX=0,touchY=0;
 let opener:HTMLButtonElement|undefined,previousOverflow='';
 const render=()=>{
  track.style.transform=mobile.matches?`translateX(-${current*100}%)`:'';
  cards.forEach((card,i)=>{card.inert=mobile.matches&&i!==current;if(mobile.matches)card.setAttribute('aria-hidden',String(i!==current));else card.removeAttribute('aria-hidden');});
  dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
  if(mobile.matches){videoRoot.setAttribute('role','region');videoRoot.setAttribute('aria-roledescription','carousel');videoRoot.setAttribute('aria-label','Transformation videos');}
  else{videoRoot.removeAttribute('role');videoRoot.removeAttribute('aria-roledescription');videoRoot.removeAttribute('aria-label');}
 };
 const schedule=()=>{clearInterval(timer);if(mobile.matches&&!reduced.matches&&!paused&&!hovered&&!touching&&!focused&&visible&&!opened&&!document.hidden)timer=setInterval(()=>move(current+1),2000);};
 const move=(index:number)=>{current=(index+cards.length)%cards.length;render();schedule();};
 cards.forEach(card=>card.addEventListener('click',()=>{
  const id=card.dataset.videoId!;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  opener=card;opened=true;previousOverflow=document.body.style.overflow;schedule();
  const iframe=document.createElement('iframe');iframe.title=card.dataset.videoTitle || 'TheABCPro transformation video';
  iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`;
  player.replaceChildren(iframe);dialog.querySelector('.adu-video-player-title')!.textContent=iframe.title;
  dialog.showModal();document.body.style.overflow='hidden';
 }));
 dialog.querySelector('.adu-video-close')?.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{player.replaceChildren();opened=false;document.body.style.overflow=previousOverflow;opener?.focus();schedule();});
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>move(i)));
 videoRoot.querySelector('.adu-video-prev')?.addEventListener('click',()=>move(current-1));
 videoRoot.querySelector('.adu-video-next')?.addEventListener('click',()=>move(current+1));
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play automatic transformation videos':'Pause automatic transformation videos');schedule();});
 viewport.addEventListener('touchstart',event=>{touching=true;touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;schedule();},{passive:true});
 viewport.addEventListener('touchend',event=>{const dx=event.changedTouches[0].clientX-touchX,dy=event.changedTouches[0].clientY-touchY;touching=false;if(mobile.matches&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))move(current+(dx<0?1:-1));else schedule();},{passive:true});
 viewport.addEventListener('touchcancel',()=>{touching=false;schedule();},{passive:true});
 videoRoot.addEventListener('mouseenter',()=>{hovered=true;schedule();});videoRoot.addEventListener('mouseleave',()=>{hovered=false;schedule();});
 videoRoot.addEventListener('focusin',()=>{focused=true;schedule();});videoRoot.addEventListener('focusout',event=>{focused=videoRoot.contains(event.relatedTarget as Node);schedule();});
 videoRoot.addEventListener('keydown',event=>{if(mobile.matches&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();move(current+(event.key==='ArrowRight'?1:-1));}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(videoRoot);
 mobile.addEventListener('change',()=>{render();schedule();});reduced.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);
 render();schedule();
}
