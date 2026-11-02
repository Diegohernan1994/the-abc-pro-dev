import React, { useState, useEffect, useRef } from 'react';

export default function QuestionsCarousel({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Auto-advance every 2 seconds on mobile, pauses on touch
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % questions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [questions.length, isPaused]);

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
      setCurrentIndex((prev) => (prev + 1) % questions.length);
    } else if (diff < -40) {
      setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
    }
    touchStartX.current = null;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop View (> 1200px): Exact list/table layout from PlansDesignLanding.dc.html */}
      <div className="questions-desktop" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #DDDDDD' }}>
        {questions.map((q, idx) => (
          <div 
            key={idx}
            className="question-row-item"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px 48px',
              padding: '24px 4px',
              borderBottom: '1px solid #DDDDDD',
              transition: 'background-color 200ms cubic-bezier(.25, .1, .25, 1)'
            }}
          >
            <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic', fontSize: '21px', lineHeight: '29px', color: '#271D3E', textWrap: 'pretty' }}>
              {q.question}
            </span>
            <span style={{ fontSize: '15px', lineHeight: '24px', textWrap: 'pretty' }}>
              {q.answer}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile View (<= 1200px): 2s Auto Carousel with Square Dots & Touch Pause */}
      <div 
        className="questions-mobile"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        <div style={{ 
          minHeight: '170px',
          padding: '28px 22px', 
          background: '#fff', 
          boxShadow: 'inset 0 0 0 1px #DDDDDD', 
          borderTop: '4px solid #7A3F96', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          boxSizing: 'border-box' 
        }}>
          <div 
            key={currentIndex} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              animation: 'fadeQuestion 350ms ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-comments" aria-hidden="true" style={{ fontSize: '24px', color: '#BDA478', flexShrink: 0 }}></i>
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic', fontSize: '19px', lineHeight: '26px', color: '#7A3F96', fontWeight: 500, textWrap: 'pretty' }}>
                {questions[currentIndex].question}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '23px', color: '#5D5D5D' }}>
              {questions[currentIndex].answer}
            </p>
          </div>
        </div>

        {/* Square Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          {questions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Question ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '0px', // Square dot as requested
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
          .questions-desktop { display: flex !important; }
          .questions-mobile { display: none !important; }
          .question-row-item:hover { background-color: #FBFAF8 !important; }
        }
        @media (max-width: 1200px) {
          .questions-desktop { display: none !important; }
          .questions-mobile { display: block !important; }
        }
        @keyframes fadeQuestion {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
