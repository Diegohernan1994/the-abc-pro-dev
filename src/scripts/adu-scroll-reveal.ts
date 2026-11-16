// Content stays visible without JavaScript or animation support.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  const running = new Set<Animation>();
  const reveal = (target: Element, delay = 0, hero = false) => {
    if (target.matches('.adu-hero-cta')) target.classList.add('adu-cta-visible');
    const heading = target.matches('h1, .adu-section-heading');
    const x = heading ? -36 : 0;
    const y = hero ? 54 : 88;
    const animation = target.animate([
      { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0) scale(${heading ? '.97' : '.91'})`, filter: 'blur(5px)', offset: 0 },
      { opacity: 1, transform: 'translate3d(0, -6px, 0) scale(1.008)', filter: 'blur(0px)', offset: .78 },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0px)', offset: 1 }
    ], { duration: hero ? 1050 : 1100, delay, easing: 'cubic-bezier(.18,.75,.25,1)', fill: 'backwards' });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  };
  const targets = document.querySelectorAll<HTMLElement>([
    '.adu-metrics-grid > div', '.adu-section-heading', '.adu-gallery-item',
    '.adu-benefit-photo', '.adu-benefits-list article', '.adu-types-carousel',
    '.adu-story-photos', '.adu-story-copy', '.adu-reasons-grid article',
    '.adu-process-grid article', '.adu-review-carousel', '.adu-area-grid',
    '.adu-faq-layout > div', '.adu-final-copy', '.adu-video-carousel',
    '.adu-hero-copy > *', '.adu-estimate', '.adu-mobile-interior'
  ].join(','));
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      observer.unobserve(entry.target);
      if (motionPreference.matches) return;
      reveal(entry.target, Math.min(index, 3) * 130);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(target => {
    // Do not fade out content the visitor can already see on initial load.
    if (target.getBoundingClientRect().top >= window.innerHeight) observer.observe(target);
  });
  // Animate only visible hero content now; lower mobile content enters on scroll.
  let heroIndex = 0;
  document.querySelectorAll<HTMLElement>('.adu-hero-copy > *, .adu-estimate').forEach(target => {
    const box = target.getBoundingClientRect();
    if (target.getClientRects().length && box.top < window.innerHeight && box.bottom > 0) {
      reveal(target, Math.min(heroIndex++, 6) * 110, true);
    }
  });
  const heroPhoto = document.querySelector<HTMLElement>('.adu-hero-photo');
  if (heroPhoto && heroPhoto.getBoundingClientRect().bottom > 0) {
    const animation = heroPhoto.animate([{ opacity: .2, filter: 'blur(5px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 1300, easing: 'ease-out' });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  }
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      observer.disconnect();
      running.forEach(animation => animation.cancel());
      running.clear();
    }
  });
}
