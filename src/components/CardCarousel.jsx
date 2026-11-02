import React, { useState, useEffect, useRef } from 'react';

export default function CardCarousel({ cards, desktopColumns = 2, variant = "default" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Auto-advance every 2 seconds on mobile, pauses on touch
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [cards.length, isPaused]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 40) {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } else if (diff < -40) {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className="card-carousel-wrapper" style={{ width: '100%' }}>
      {/* Desktop Grid View (> 1200px) */}
      <div 
        className="card-grid-desktop" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: variant === "bordered-top" 
            ? 'repeat(auto-fit, minmax(250px, 1fr))' 
            : `repeat(${desktopColumns}, minmax(0, 1fr))`, 
          gap: variant === "bordered-top" ? '22px' : (desktopColumns === 3 ? '0' : '0 56px'), 
          marginTop: (variant === "bordered-top" || desktopColumns === 3) ? '0' : '56px' 
        }}
      >
        {cards.map((card, idx) => (
          variant === "bordered-top" ? (
            <div 
              key={idx}
              className="desktop-card-item card-bordered-top"
              style={{
                background: '#fff',
                padding: '32px 28px',
                boxShadow: 'inset 0 0 0 1px #DDDDDD',
                borderTop: '4px solid #7A3F96',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'box-shadow 200ms cubic-bezier(.25,.1,.25,1)'
              }}
            >
              <i className={card.icon} aria-hidden="true" style={{ fontSize: '38px', lineHeight: '44px', color: '#BDA478' }}></i>
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '22px', lineHeight: '29px', color: '#7A3F96', textWrap: 'pretty' }}>
                {card.title}
              </span>
              <span style={{ fontSize: '15px', lineHeight: '24px' }}>
                {card.description}
              </span>
            </div>
          ) : (
            <div 
              key={idx}
              className={`desktop-card-item ${desktopColumns === 3 ? 'card-3col-item' : 'card-row-item'}`}
              style={desktopColumns === 3 ? {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '0 30px',
                borderRight: idx < cards.length - 1 ? '1px solid #DDDDDD' : 'none'
              } : { 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'flex-start', 
                padding: '24px 0', 
                borderBottom: '1px solid #DDDDDD', 
                transition: 'padding-left 200ms cubic-bezier(.25,.1,.25,1)' 
              }}
            >
              {desktopColumns === 3 ? (
                <>
                  <span style={{ width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', boxShadow: 'inset 0 0 0 1px #DDDDDD', color: '#7A3F96', fontSize: '18px' }}>
                    <i className={card.icon} aria-hidden="true"></i>
                  </span>
                  <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '19px', lineHeight: '26px', color: '#5D5D5D' }}>
                    {card.title}
                  </span>
                  <span style={{ fontSize: '15px', lineHeight: '24px', color: '#5D5D5D' }}>
                    {card.description}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ flex: '0 0 auto', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F4F1', color: '#7A3F96', fontSize: '20px' }}>
                    <i className={card.icon} aria-hidden="true"></i>
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '21px', lineHeight: '27px', color: '#7A3F96' }}>
                      {card.title}
                    </span>
                    <span style={{ fontSize: '15px', lineHeight: '24px', color: '#5D5D5D' }}>
                      {card.description}
                    </span>
                  </span>
                </>
              )}
            </div>
          )
        ))}
      </div>

      {/* Mobile Carousel View (<= 1200px) */}
      <div 
        className="card-carousel-mobile"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ marginTop: '36px', overflow: 'hidden', position: 'relative' }}
      >
        <div style={{ 
          minHeight: '190px', 
          padding: '24px 20px', 
          background: variant === "bordered-top" ? '#fff' : '#FBFAF8', 
          border: '1px solid #DDDDDD', 
          borderTop: variant === "bordered-top" ? '4px solid #7A3F96' : '1px solid #DDDDDD',
          boxSizing: 'border-box' 
        }}>
          <div 
            key={currentIndex} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              animation: 'fadeCard 350ms ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {variant === "bordered-top" ? (
                <i className={cards[currentIndex].icon} aria-hidden="true" style={{ fontSize: '32px', color: '#BDA478', flex: '0 0 auto' }}></i>
              ) : (
                <span style={{ flex: '0 0 auto', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F4F1', color: '#7A3F96', fontSize: '19px' }}>
                  <i className={cards[currentIndex].icon} aria-hidden="true"></i>
                </span>
              )}
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '19px', lineHeight: '25px', color: '#7A3F96', fontWeight: 500 }}>
                {cards[currentIndex].title}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '23px', color: '#5D5D5D' }}>
              {cards[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Square Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          {cards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '0px', // Exact square dot as requested
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: currentIndex === idx ? '#7A3F96' : '#D4D4D4',
                transition: 'background-color 200ms ease'
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 1201px) {
          .card-grid-desktop { display: grid !important; }
          .card-carousel-mobile { display: none !important; }
          .card-bordered-top:hover {
            box-shadow: inset 0 0 0 1px #BDA478, 0 12px 30px rgba(39,29,62,0.10) !important;
            padding-left: 28px !important;
          }
          .card-row-item:hover {
            padding-left: 8px !important;
          }
        }
        @media (max-width: 1200px) {
          .card-grid-desktop { display: none !important; }
          .card-carousel-mobile { display: block !important; }
        }
        @keyframes fadeCard {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
