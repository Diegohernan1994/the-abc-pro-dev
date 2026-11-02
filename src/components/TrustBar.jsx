import React, { useEffect, useState } from 'react';

export default function TrustBar({ items, theme = 'light', iconColor: customIconColor, dividerColor: customDividerColor, horizontal = false, maxWidth = '1280px' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#271D3E' : '#F6F4F1';
  const borderColor = isDark ? 'transparent' : '#DDDDDD';
  const iconColor = customIconColor || (isDark ? '#BDA478' : '#7A3F96');
  const textColor = isDark ? 'rgba(255,255,255,0.95)' : '#5D5D5D';
  const dividerColor = customDividerColor || (isDark ? 'rgba(189,164,120,0.30)' : '#DDDDDD');

  // Auto-advance every 2.5 seconds on mobile
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  return (
    <div style={{ background: bgColor, borderBottom: isDark ? 'none' : '1px solid ' + borderColor }}>
      {/* Desktop View (> 1200px): 4 Columns */}
      <div className="trust-bar-desktop" style={{ maxWidth: maxWidth || '1280px', margin: '0 auto', padding: '22px 24px', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, gap: '0', alignItems: 'center' }}>
          {items.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                flexDirection: (horizontal || !isDark) ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: horizontal ? '14px' : '10px',
                textAlign: horizontal ? 'left' : 'center',
                padding: '0 14px',
                borderLeft: index > 0 ? '1px solid ' + dividerColor : 'none'
              }}
            >
              <i className={item.icon} aria-hidden="true" style={{ fontSize: item.iconSize || (isDark ? '24px' : '16px'), color: iconColor, flex: '0 0 auto' }}></i>
              {item.lines ? (
                <span style={{ display: 'flex', flexDirection: 'column', fontWeight: 600, fontSize: '12px', lineHeight: '17px', letterSpacing: '0.120em', textTransform: 'uppercase', color: textColor, whiteSpace: 'nowrap' }}>
                  {item.lines.map((l, idx) => <span key={idx}>{l}</span>)}
                </span>
              ) : (
                <span style={{ fontWeight: 600, fontSize: isDark ? '12px' : '11px', lineHeight: '17px', letterSpacing: isDark ? '0.160em' : '0.120em', textTransform: 'uppercase', color: textColor, whiteSpace: 'nowrap' }}>
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View (<= 1200px): Infinite Automatic Carousel (1 at a time) */}
      <div 
        className="trust-bar-mobile"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ padding: '16px 20px', overflow: 'hidden', position: 'relative' }}
      >
        <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            key={currentIndex} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              animation: 'fadeInSlide 400ms cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
          >
            <i className={items[currentIndex].icon} aria-hidden="true" style={{ fontSize: '20px', color: iconColor, flex: '0 0 auto' }}></i>
            <span style={{ fontWeight: 700, fontSize: '12px', lineHeight: '18px', letterSpacing: '0.140em', textTransform: 'uppercase', color: textColor }}>
              {items[currentIndex].lines ? items[currentIndex].lines.join(' ') : items[currentIndex].text}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1201px) {
          .trust-bar-desktop { display: block; }
          .trust-bar-mobile { display: none; }
        }
        @media (max-width: 1200px) {
          .trust-bar-desktop { display: none; }
          .trust-bar-mobile { display: block; }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
