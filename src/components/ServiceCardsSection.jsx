import React, { useState, useEffect, useRef } from 'react';

export default function ServiceCardsSection({ services }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Auto-advance every 2s on mobile, pause on touch
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [services.length, isPaused]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    } else if (diff < -40) {
      setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
    }
    touchStartX.current = null;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop Grid View (> 1200px): 3 Columns */}
      <div className="services-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '22px' }}>
        {services.map((item, idx) => (
          <a 
            key={idx}
            href="#lead-form" 
            style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '18px', 
              minHeight: '430px', 
              padding: '44px 34px', 
              boxSizing: 'border-box', 
              background: `#000 url(${item.image}) center / cover no-repeat`, 
              textAlign: 'center', 
              textDecoration: 'none', 
              borderBottom: '10px solid #271D3E', 
              overflow: 'hidden' 
            }}
          >
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(39,29,62,0.42) 0%, rgba(39,29,62,0.62) 40%, rgba(39,29,62,0.80) 100%)' }}></span>
            <span style={{ position: 'relative', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '30px', lineHeight: '39px', color: '#fff', textWrap: 'pretty' }}>
              {item.title}
            </span>
            <span style={{ position: 'relative', fontSize: '16px', lineHeight: '25px', color: '#fff', maxWidth: '340px', textWrap: 'pretty' }}>
              {item.description}
            </span>
          </a>
        ))}
      </div>

      {/* Mobile Carousel View (<= 1200px): Infinite 2s with Square Dots */}
      <div 
        className="services-mobile"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <a 
          href="#lead-form"
          key={currentIndex}
          style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px', 
            minHeight: '380px', 
            padding: '40px 24px', 
            boxSizing: 'border-box', 
            background: `#000 url(${services[currentIndex].image}) center / cover no-repeat`, 
            textAlign: 'center', 
            textDecoration: 'none', 
            borderBottom: '8px solid #271D3E',
            animation: 'fadeCard 350ms ease-in-out'
          }}
        >
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(39,29,62,0.52) 0%, rgba(39,29,62,0.72) 40%, rgba(39,29,62,0.90) 100%)' }}></span>
          <span style={{ position: 'relative', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '26px', lineHeight: '34px', color: '#fff', fontWeight: 500 }}>
            {services[currentIndex].title}
          </span>
          <p style={{ margin: 0, position: 'relative', fontSize: '15px', lineHeight: '23px', color: 'rgba(255,255,255,0.92)' }}>
            {services[currentIndex].description}
          </p>
        </a>

        {/* Square Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {services.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Service ${idx + 1}`}
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
          .services-desktop { display: grid !important; }
          .services-mobile { display: none !important; }
        }
        @media (max-width: 1200px) {
          .services-desktop { display: none !important; }
          .services-mobile { display: block !important; }
        }
        @keyframes fadeCard {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
