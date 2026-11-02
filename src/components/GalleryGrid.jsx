import React from 'react';

export default function GalleryGrid({ children, photos }) {
  // Mobile rule: If odd number of photos, hide 1 to keep exactly even pairs (parejo de a 2)
  const mobilePhotos = photos.length % 2 !== 0 ? photos.slice(0, photos.length - 1) : photos;

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop Mosaic View (> 1200px) */}
      <div className="gallery-desktop">
        {children}
      </div>

      {/* Mobile 2-Column Grid (<= 1200px) */}
      <div className="gallery-mobile" style={{ padding: '0 20px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {mobilePhotos.map((src, idx) => (
            <div 
              key={idx}
              style={{
                aspectRatio: '1 / 1',
                backgroundColor: '#F6F4F1',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <img 
                src={src} 
                alt="Completed Remodel Project" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                loading="lazy" 
                decoding="async" 
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 1201px) {
          .gallery-desktop { display: block !important; }
          .gallery-mobile { display: none !important; }
        }
        @media (max-width: 1200px) {
          .gallery-desktop { display: none !important; }
          .gallery-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
