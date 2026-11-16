// Content stays visible without JavaScript or animation support.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  const running = new Set<Animation>();
  const targets = document.querySelectorAll<HTMLElement>([
    '.adu-metrics-grid > div', '.adu-section-heading', '.adu-gallery-item',
    '.adu-benefit-photo', '.adu-benefits-list article', '.adu-types-carousel',
    '.adu-story-photos', '.adu-story-copy', '.adu-reasons-grid article',
    '.adu-process-grid article', '.adu-review-carousel', '.adu-area-grid',
    '.adu-faq-layout > div', '.adu-final-copy'
  ].join(','));
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      observer.unobserve(entry.target);
      if (motionPreference.matches) return;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], { duration: 550, delay: Math.min(index, 3) * 60, easing: 'cubic-bezier(.2,.65,.3,1)' });
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(target => {
    // Do not fade out content the visitor can already see on initial load.
    if (target.getBoundingClientRect().top >= window.innerHeight) observer.observe(target);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      observer.disconnect();
      running.forEach(animation => animation.cancel());
      running.clear();
    }
  });
}
