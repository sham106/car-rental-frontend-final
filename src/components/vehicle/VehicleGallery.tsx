import React, { useState } from 'react';

interface VehicleGalleryProps {
  photos: string[];
  vehicleTitle: string;
}

export const VehicleGallery: React.FC<VehicleGalleryProps> = ({ photos = [], vehicleTitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const safePhotos = photos && photos.length > 0 
    ? photos 
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];
  const currentPhoto = safePhotos[activeIndex] || safePhotos[0];

  return (
    <div id="vehicle-gallery-container" className="space-y-3">
      {/* Main Feature Image */}
      <div className="relative aspect-[16/10] bg-[#EAF0F3] rounded-2xl overflow-hidden border border-[#DFE6EC] shadow-sm">
        <img
          src={currentPhoto}
          alt={`${vehicleTitle} - Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
          {activeIndex + 1} / {safePhotos.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {safePhotos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {safePhotos.map((photo, idx) => (
            <button
              key={photo + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'border-[#2F6F6D] ring-2 ring-[#2F6F6D]/30 shadow-sm'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
              aria-label={`View photo ${idx + 1}`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
