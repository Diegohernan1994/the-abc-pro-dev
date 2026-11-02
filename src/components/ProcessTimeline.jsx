import React, { useState } from 'react';

export default function ProcessTimeline({ steps, layout = "vertical", cardBg = "transparent" }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop View (> 1200px) */}
      {layout === "horizontal" ? (
        <div className="process-desktop-horizontal" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: 0 }}>
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: idx === 0 ? '0 34px 0 0' : (idx === steps.length - 1 ? '0 0 0 34px' : '0 34px'),
                boxShadow: (idx > 0 && idx < steps.length - 1) ? 'inset 1px 0 0 #DDDDDD, inset -1px 0 0 #DDDDDD' : 'none'
              }}
            >
              <span style={{ width: '64px', height: '64px', borderRadius: '999px', background: '#7A3F96', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '24px', color: '#fff' }}>
                {step.number}
              </span>
              <h3 style={{ margin: 0, fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 400, fontSize: '25px', lineHeight: '32px', color: '#7A3F96' }}>
                {step.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '24px' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="process-desktop-vertical" style={{ position: 'relative', paddingLeft: '76px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'absolute', left: '31px', top: '26px', bottom: '26px', width: '2px', background: '#BDA478' }}></div>
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`process-desktop-item ${cardBg === 'white' ? 'process-card-white' : ''}`}
              style={{ 
                position: 'relative', 
                display: 'grid', 
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 270px)', 
                gap: '28px', 
                alignItems: 'center', 
                background: cardBg === 'white' ? '#fff' : 'transparent', 
                boxShadow: cardBg === 'white' ? 'inset 0 0 0 1px #DDDDDD' : 'none',
                padding: '26px 28px', 
                transition: 'box-shadow 200ms cubic-bezier(.25,.1,.25,1)' 
              }}
            >
              <div style={{ position: 'absolute', left: '-76px', top: '50%', transform: 'translateY(-50%)', width: '64px', height: '64px', borderRadius: '999px', background: '#7A3F96', boxShadow: '0 0 0 8px #F6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '24px', color: '#fff' }}>
                {step.number}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 400, fontSize: '25px', lineHeight: '32px', color: '#7A3F96' }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '24px' }}>
                  {step.text}
                </p>
              </div>
              {step.image && (
                <div style={{ height: '132px', background: `#000 url(${step.image}) center / cover no-repeat` }}></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile View (<= 1200px): Horizontal Step Carousel (1 at a time) */}
      <div className="process-mobile" style={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ background: '#fff', border: '1px solid #DDDDDD', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Step Image if available */}
          {steps[currentStep].image && (
            <div style={{ height: '200px', width: '100%', background: `#000 url(${steps[currentStep].image}) center / cover no-repeat` }}></div>
          )}
          
          {/* Step Header with Number Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '999px', background: '#7A3F96', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '18px', color: '#fff', flexShrink: 0 }}>
              {steps[currentStep].number}
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 500, fontSize: '20px', lineHeight: '27px', color: '#7A3F96' }}>
              {steps[currentStep].title}
            </h3>
          </div>

          <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '23px', color: '#5D5D5D' }}>
            {steps[currentStep].text}
          </p>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #EEEEEE', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)}
              style={{ background: 'transparent', border: '1px solid #BDA478', color: '#7A3F96', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-arrow-left"></i> Prev
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Step ${idx + 1}`}
                  onClick={() => setCurrentStep(idx)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '0px', // Square dot
                    border: 'none',
                    padding: 0,
                    background: currentStep === idx ? '#7A3F96' : '#D4D4D4',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
              style={{ background: '#7A3F96', border: 'none', color: '#fff', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Next <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1201px) {
          .process-desktop-vertical { display: flex !important; }
          .process-desktop-horizontal { display: grid !important; }
          .process-mobile { display: none !important; }
          .process-desktop-item:hover { box-shadow: inset 0 0 0 1px #BDA478 !important; }
          .process-card-white:hover {
            box-shadow: inset 0 0 0 1px #BDA478, 0 10px 26px rgba(39, 29, 62, 0.09) !important;
          }
        }
        @media (max-width: 1200px) {
          .process-desktop-vertical { display: none !important; }
          .process-desktop-horizontal { display: none !important; }
          .process-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
