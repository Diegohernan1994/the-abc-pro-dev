import React, { useState, useRef, useCallback, useEffect } from 'react';

const normalizeSrc = (src) => {
  if (!src) return '';
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '');
  if (src.startsWith('/') && base && !src.startsWith(base)) {
    return `${base}${src}`;
  }
  return src;
};

export default function BeforeAfterSlider({ 
  beforeImg, 
  afterImg, 
  beforeLabel = "3D Design", 
  afterLabel = "Reality",
  aspectRatio = "16 / 9",
  maxWidth = "1180px",
  labelBottom = ""
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  // Desktop Pointer / Mouse Events
  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return; // Handled by native touch listeners below
    isDragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // High-performance Mobile Touch handling (iPhone / Safari & Android)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isTouching = false;
    let startX = 0;
    let startY = 0;
    let isHorizontal = null;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      isTouching = true;
      isHorizontal = null;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      updatePosition(e.touches[0].clientX);
    };

    const onTouchMove = (e) => {
      if (!isTouching || e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      // Lock direction on initial drag
      if (isHorizontal === null && (diffX > 3 || diffY > 3)) {
        isHorizontal = diffX >= diffY;
        if (!isHorizontal) {
          isTouching = false;
          return;
        }
      }

      if (isHorizontal) {
        if (e.cancelable) e.preventDefault();
        updatePosition(currentX);
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
      isHorizontal = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [updatePosition]);

  // Calculate badge opacities:
  // When sliding left to reveal reality (sliderPos decreases), beforeLabel (3D Design) fades out
  // When sliding right to reveal 3D design (sliderPos increases), afterLabel (Reality) fades out
  const beforeBadgeOpacity = Math.max(0, Math.min(1, (sliderPos - 10) / 15));
  const afterBadgeOpacity = Math.max(0, Math.min(1, (90 - sliderPos) / 15));

  return (
    <div style={{ width: '100%', maxWidth: maxWidth, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: aspectRatio, 
          overflow: 'hidden', 
          background: '#000', 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'pan-y',
          cursor: 'ew-resize'
        }}
      >
        {/* After Image (Reality / After - Base Layer on the right) */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F6F4F1', pointerEvents: 'none' }}>
          <img 
            src={normalizeSrc(afterImg)} 
            alt={afterLabel} 
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} 
          />
          {/* After Badge (Reality) */}
          <span style={{ 
            position: 'absolute', 
            right: '16px', 
            top: '16px', 
            padding: '6px 13px', 
            background: 'rgba(0,0,0,0.72)', 
            color: '#fff', 
            fontFamily: 'Lato, sans-serif', 
            fontWeight: 600, 
            fontSize: '11px', 
            letterSpacing: '0.180em', 
            textTransform: 'uppercase', 
            pointerEvents: 'none',
            opacity: afterBadgeOpacity,
            transition: 'opacity 120ms ease-out',
            zIndex: 2
          }}>
            {afterLabel}
          </span>
        </div>
        
        {/* Before Image (3D Design / Before - Clipped Top Layer on the left) */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            overflow: 'hidden',
            background: '#F6F4F1',
            clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)`,
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          <img 
            src={normalizeSrc(beforeImg)} 
            alt={beforeLabel} 
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} 
          />
          {/* Before Badge (3D Design) */}
          <span style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '16px', 
            padding: '6px 13px', 
            background: 'rgba(0,0,0,0.72)', 
            color: '#fff', 
            fontFamily: 'Lato, sans-serif', 
            fontWeight: 600, 
            fontSize: '11px', 
            letterSpacing: '0.180em', 
            textTransform: 'uppercase', 
            pointerEvents: 'none',
            opacity: beforeBadgeOpacity,
            transition: 'opacity 120ms ease-out',
            zIndex: 4
          }}>
            {beforeLabel}
          </span>
        </div>

        {/* Divider line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', background: '#fff', left: `${sliderPos}%`, transform: 'translateX(-1px)', pointerEvents: 'none', zIndex: 9 }}></div>

        {/* Drag Handle */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: `${sliderPos}%`, 
          transform: 'translate(-50%, -50%)', 
          width: '50px', 
          height: '50px', 
          borderRadius: '999px', 
          background: '#fff', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '5px', 
          color: '#271D3E', 
          fontSize: '13px', 
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </div>

        {/* Interactive Range Input (for keyboard accessibility) */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="0.1" 
          value={sliderPos}
          onChange={(e) => setSliderPos(parseFloat(e.target.value))}
          onInput={(e) => setSliderPos(parseFloat(e.target.value))}
          aria-label={`Compare ${beforeLabel} with ${afterLabel}`} 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', margin: 0 }} 
        />
      </div>

      {labelBottom && (
        <span style={{ textAlign: 'center', fontWeight: 600, fontSize: '12px', letterSpacing: '0.220em', textTransform: 'uppercase', color: '#7A3F96' }}>
          {labelBottom}
        </span>
      )}
    </div>
  );
}


