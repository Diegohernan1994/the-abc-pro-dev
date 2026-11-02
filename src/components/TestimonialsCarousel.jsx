import React, { useState, useEffect, useRef } from 'react';

export default function TestimonialsCarousel({ testimonials, showQuotes = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Auto-advance every 3.5s on mobile
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    } else if (diff < -40) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
    touchStartX.current = null;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop Grid View (> 1200px) */}
      <div className="testimonials-desktop" style={{ display: 'grid', gridTemplateColumns: `repeat(${testimonials.length}, minmax(0, 1fr))`, gap: '56px' }}>
        {testimonials.map((item, idx) => (
          <figure key={idx} style={{ position: 'relative', margin: 0, padding: showQuotes ? '0 56px' : '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {showQuotes && (
              <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '50px', background: item.quoteColor || '#7A3F96', WebkitMask: 'url(/assets/quote-mark-open-solid.svg) center / contain no-repeat', mask: 'url(/assets/quote-mark-open-solid.svg) center / contain no-repeat' }}></span>
            )}
            <figcaption style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '17px', lineHeight: '25.5px', textTransform: 'uppercase', color: '#7A3F96' }}>{item.author}</span>
              {item.location && <span style={{ fontSize: '13px', lineHeight: '19px', color: '#777' }}>{item.location}</span>}
            </figcaption>
            <blockquote style={{ margin: 0, fontFamily: "'Noto Serif', Georgia, serif", fontSize: '19px', lineHeight: '30px', color: '#5D5D5D', textWrap: 'pretty' }}>
              {item.quote}
              {showQuotes && item.closeQuoteColor && (
                <span aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '7px', width: '22px', height: '18px', background: item.closeQuoteColor || '#DDDDDD', WebkitMask: 'url(/assets/quote-mark-close-solid.svg) center / contain no-repeat', mask: 'url(/assets/quote-mark-close-solid.svg) center / contain no-repeat' }}></span>
              )}
            </blockquote>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #DDDDDD', alignSelf: 'stretch' }}>
              <img src={item.sourceLogo} alt={item.sourceName} style={{ height: '42px', width: 'auto', display: 'block' }} />
              <span style={{ fontStyle: 'italic', fontWeight: 500, fontSize: '13px', lineHeight: '19px', color: '#5D5D5D' }}>{item.sourceText}</span>
            </span>
          </figure>
        ))}
      </div>

      {/* Mobile Carousel View (<= 1200px) */}
      <div 
        className="testimonials-mobile"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ background: '#FBFAF8', border: '1px solid #DDDDDD', padding: showQuotes ? '36px 24px 28px' : '28px 24px 24px', position: 'relative' }}>
          {showQuotes && (
            <span aria-hidden="true" style={{ position: 'absolute', left: '16px', top: '16px', width: '40px', height: '34px', background: testimonials[currentIndex].quoteColor || '#7A3F96', WebkitMask: 'url(/assets/quote-mark-open-solid.svg) center / contain no-repeat', mask: 'url(/assets/quote-mark-open-solid.svg) center / contain no-repeat' }}></span>
          )}
          <div key={currentIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', animation: 'fadeReview 400ms ease' }}>
            <figcaption style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', color: '#7A3F96' }}>{testimonials[currentIndex].author}</span>
              {testimonials[currentIndex].location && <span style={{ fontSize: '13px', color: '#777' }}>{testimonials[currentIndex].location}</span>}
            </figcaption>
            <blockquote style={{ margin: 0, fontFamily: "'Noto Serif', Georgia, serif", fontSize: '16px', lineHeight: '26px', color: '#5D5D5D' }}>
              {showQuotes ? `"${testimonials[currentIndex].quote}"` : testimonials[currentIndex].quote}
            </blockquote>
            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #E5E5E5', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <img src={testimonials[currentIndex].sourceLogo} alt={testimonials[currentIndex].sourceName} style={{ height: '34px', width: 'auto' }} />
              <span style={{ fontStyle: 'italic', fontSize: '12px', color: '#777' }}>{testimonials[currentIndex].sourceText}</span>
            </div>
          </div>
        </div>

        {/* Square Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Testimonial ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '0px',
                border: 'none',
                padding: 0,
                background: currentIndex === idx ? '#7A3F96' : '#D4D4D4',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 1201px) {
          .testimonials-desktop { display: grid !important; }
          .testimonials-mobile { display: none !important; }
        }
        @media (max-width: 1200px) {
          .testimonials-desktop { display: none !important; }
          .testimonials-mobile { display: block !important; }
        }
        @keyframes fadeReview {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
