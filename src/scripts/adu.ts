import photoAssets from '../data/adu-photos.json';
import './adu-types-carousel';

const form = document.querySelector<HTMLFormElement>('[data-adu-form]');
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
// Enable only after the private server configuration has been installed.
const isPreview = isLocal || import.meta.env.PUBLIC_ADU_LEADS_ENABLED !== 'true';
const endpoint = 'https://theabcpro.com/api/submit-adu.php';
let tokenRequest: Promise<string> | undefined;
const loadToken = () => tokenRequest ??= fetch(endpoint, {cache:'no-store'})
  .then(async response => {
    const result = await response.json();
    if (!response.ok || typeof result.token !== 'string') throw new Error('Form unavailable');
    return result.token as string;
  });
if (!isPreview) form?.addEventListener('focusin', () => { void loadToken().catch(() => { tokenRequest=undefined; }); }, {once:true});
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Compare hero photographs locally without changing the published design.
if (isLocal) {
  const option = new URLSearchParams(window.location.search).get('hero') || '3';
  const setPhoto = (image: HTMLImageElement, key: keyof typeof photoAssets, alt: string) => {
    const asset = photoAssets[key];
    image.srcset = '';
    image.src = asset.full;
    image.srcset = asset.variants.map(v => `${v.url} ${v.width}w`).join(', ');
    image.width = asset.width;
    image.height = asset.height;
    image.alt = alt;
    image.dataset.photoName = key;
  };
  const hero = document.querySelector<HTMLImageElement>('.adu-hero-photo');
  if (hero && option === '1') {
    setPhoto(hero, 'hero', 'Completed Santa Monica ADU with a private front door and black-framed window');
  } else if (hero && option === '2') {
    setPhoto(hero, 'exterior', 'Completed detached ADU with a gabled roof and private backyard in Santa Monica');
    // Swap gallery photos so the chosen hero is never repeated down the page.
    const galleryPhoto = document.querySelector<HTMLImageElement>('.adu-gallery [data-photo-name="exterior"]');
    if (galleryPhoto) {
      setPhoto(galleryPhoto, 'hero', 'Completed Santa Monica ADU with a private front door and black-framed window');
      const galleryButton = galleryPhoto.closest<HTMLButtonElement>('[data-photo]');
      if (galleryButton) galleryButton.dataset.photo = photoAssets.hero.full;
    }
  } else if (hero && option === '3') {
    setPhoto(hero, 'hero-interior', 'Completed Long Beach ADU with an open-plan kitchen, breakfast bar and living area');
  }
  if (hero) document.querySelector('.adu-hero')?.setAttribute('data-hero-option', option === '1' || option === '2' ? option : '3');
}

document.querySelectorAll<HTMLAnchorElement>('[data-project-type]').forEach(link => {
  link.addEventListener('click', () => {
    const select=form?.querySelector<HTMLSelectElement>('[name="project_type"]');
    if (select) select.value=link.dataset.projectType || '';
  });
});
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const error=form.querySelector<HTMLParagraphElement>('.adu-form-error')!;
  const original=button.innerHTML;
  button.disabled=true;
  button.textContent='Sending your request…';
  error.hidden=true;
  // The local preview never sends personal details to the live website or webhook.
  if (isPreview) {
    window.location.assign(`${base}/landing-adu/thank-you/?preview=1`);
    return;
  }
  const values = new FormData(form);
  const payload = {
    website: String(values.get('website') || ''),
    name: String(values.get('name') || '').trim(),
    phone: String(values.get('phone') || '').trim(),
    email: String(values.get('email') || '').trim(),
    zip: String(values.get('zip') || '').trim(),
    areas: String(values.get('project_type') || ''),
    project_type: String(values.get('project_type') || ''),
    landing: 'adu', full_url: window.location.href, timestamp: new Date().toISOString()
  };
  try {
    const form_token = await loadToken();
    const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...payload, form_token})});
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error('Request failed');
    window.location.assign('https://theabcpro.com/thank-you/');
  } catch {
    tokenRequest=undefined;
    button.disabled=false;
    button.innerHTML=original;
    error.textContent='Unable to send your request. Please try again or call (818) 457-3390.';
    error.hidden=false;
  }
});

const photos=[...document.querySelectorAll<HTMLButtonElement>('.adu-gallery-item')];
const dialog=document.querySelector<HTMLDialogElement>('.adu-lightbox');
let photoIndex=0;
const showPhoto=(index:number)=>{
  if (!dialog) return;
  photoIndex=(index+photos.length)%photos.length;
  const photo=photos[photoIndex];
  const image=dialog.querySelector<HTMLImageElement>('img')!;
  image.src=photo.dataset.photo!;
  image.alt=photo.querySelector('img')?.alt || '';
  dialog.querySelector('figcaption')!.textContent=photo.dataset.caption || '';
};
photos.forEach((photo,index)=>photo.addEventListener('click',()=>{
  showPhoto(index); dialog?.showModal(); document.body.style.overflow='hidden';
}));
dialog?.querySelector('.adu-lightbox-close')?.addEventListener('click',()=>dialog.close());
dialog?.querySelector('.adu-lightbox-next')?.addEventListener('click',()=>showPhoto(photoIndex+1));
dialog?.querySelector('.adu-lightbox-prev')?.addEventListener('click',()=>showPhoto(photoIndex-1));
dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
dialog?.addEventListener('close',()=>{document.body.style.overflow='';photos[photoIndex]?.focus();});
dialog?.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight')showPhoto(photoIndex+1);
  if(event.key==='ArrowLeft')showPhoto(photoIndex-1);
});

const carousel=document.querySelector<HTMLElement>('.adu-review-carousel');
const track=carousel?.querySelector<HTMLElement>('.adu-testimonial-track');
const slides=[...document.querySelectorAll<HTMLElement>('.adu-testimonial')];
const dots=[...document.querySelectorAll<HTMLButtonElement>('[data-slide]')];
const pause=carousel?.querySelector<HTMLButtonElement>('.adu-carousel-pause');
const mobile=window.matchMedia('(max-width:700px)');
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
let current=0,paused=false,interacting=false,timer:ReturnType<typeof setInterval>|undefined;
const updateSlides=()=>{
 if(track)track.style.transform=mobile.matches?`translateX(-${current*100}%)`:'';
 slides.forEach((s,i)=>{s.inert=mobile.matches && i!==current;s.setAttribute('aria-hidden',String(mobile.matches && i!==current));});
 dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
};
const schedule=()=>{
 clearInterval(timer);
 if(mobile.matches && !reduced.matches && !paused && !interacting && !document.hidden)timer=setInterval(()=>{current=(current+1)%slides.length;updateSlides();},2000);
};
dots.forEach((dot,i)=>dot.addEventListener('click',()=>{current=i;updateSlides();schedule();}));
pause?.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play automatic reviews':'Pause automatic reviews');schedule();});
for(const event of ['mouseenter','touchstart','focusin'])carousel?.addEventListener(event,()=>{interacting=true;schedule();},{passive:true});
for(const event of ['mouseleave','touchend','focusout'])carousel?.addEventListener(event,()=>{interacting=false;schedule();},{passive:true});
mobile.addEventListener('change',()=>{updateSlides();schedule();});
reduced.addEventListener('change',schedule);
document.addEventListener('visibilitychange',schedule);
updateSlides();schedule();
