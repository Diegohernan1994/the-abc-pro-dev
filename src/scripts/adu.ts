import './adu-types-carousel';
import './adu-scroll-reveal';
import './adu-videos';

const form = document.querySelector<HTMLFormElement>('[data-adu-form]');
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const REDIRECT_THANKS_URL = 'https://theabcpro.com/thank-you/';

// Reconstruct webhook endpoint strictly in memory on form submission (fragmented reversed Base64)
const _getAduZapEndpoint = () => {
  if (typeof atob === 'undefined') return '';
  const _p = ['1YzczNm0v', 'UzNTYzL3V', 'GNoLzIzNz', 'b2tzL2Nhd', 'uY29tL2hv', '56YXBpZXI', 'y9ob29rcy', 'aHR0cHM6L'];
  return atob([..._p].reverse().join(''));
};

document.querySelectorAll<HTMLAnchorElement>('[data-project-type]').forEach(link => {
  link.addEventListener('click', () => {
    const select=form?.querySelector<HTMLSelectElement>('[name="project_type"]');
    if (select) select.value=link.dataset.projectType || '';
  });
});
let isSubmitting = false;
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (isSubmitting || !form.reportValidity()) return;

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const error = form.querySelector<HTMLParagraphElement>('.adu-form-error')!;
  const original = button.innerHTML;
  const values = new FormData(form);

  // Silent honeypot trap for bots
  if (String(values.get('website') || '').trim() !== '') {
    window.location.assign(REDIRECT_THANKS_URL);
    return;
  }

  isSubmitting = true;
  button.disabled = true;
  button.textContent = 'Sending your request…';
  error.hidden = true;

  try {
    const now = new Date();
    const fullName = String(values.get('name') || '').trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');
    const phone = String(values.get('phone') || '').trim();
    const email = String(values.get('email') || '').trim();
    const zip = String(values.get('zip') || '').trim();
    const projectType = String(values.get('project_type') || '').trim();
    const currentUrl = window.location.href;
    const pageTitle = document.title.trim();
    const urlParams = new URLSearchParams(window.location.search);

    const payload = {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      name: fullName,
      phone,
      email,
      zip_code: zip,
      zip,
      Interest: projectType,
      interest: projectType,
      areas: projectType,
      project_type: projectType,
      landing: 'adu',
      Url: currentUrl,
      full_url: currentUrl,
      Title: pageTitle,
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || '',
      submission_date_time: now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' (PT)',
      submission_date_iso: now.toISOString(),
      user_timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
      screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : ''
    };

    let sent = false;

    // Layer A: Same-origin PHP proxy on live server (avoids outdated cross-origin handlers locally)
    if (!isLocal) {
      try {
        const proxyRes = await fetch('/api/submit-lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await proxyRes.json().catch(() => ({}));
        if (proxyRes.ok && result.success === true && result.landing === 'adu') {
          sent = true;
        }
      } catch {
        // Fallback to Layer B below
      }
    }

    // Layer B: Direct RAM-reconstructed Zapier webhook fallback
    const zapTarget = _getAduZapEndpoint();
    if (!sent && zapTarget) {
      try {
        await fetch(zapTarget, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        sent = true;
      } catch {
        // Handled below if neither succeeded
      }
    }

    if (!sent) {
      throw new Error('Delivery failed');
    }

    window.location.assign(REDIRECT_THANKS_URL);
  } catch {
    isSubmitting = false;
    button.disabled = false;
    button.innerHTML = original;
    error.textContent = 'Unable to send your request. Please try again or call (818) 457-3390.';
    error.hidden = false;
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
