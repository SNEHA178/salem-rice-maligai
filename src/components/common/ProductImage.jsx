import React, { useState } from 'react';
import { Package } from 'lucide-react';

/**
 * Reusable Product Image component
 * Provides fallback, prevents distortion, supports lazy loading and aspect ratios.
 */
export const ProductImage = ({
  src,
  alt = 'Product image',
  className = '',
  aspectRatio = 'aspect-4/3',
  fallbackIcon: FallbackIcon = Package,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#FAF8F2] flex items-center justify-center select-none ${aspectRatio} ${className}`}
    >
      {/* Fallback container if broken or no src */}
      {hasError || !src ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#F0EBDD]/60 text-[#205A3B]">
          <FallbackIcon className="w-10 h-10 stroke-1 opacity-60 mb-1" />
          <span className="text-[11px] font-medium text-[#5A5A5A] text-center">
            Salem Rice &amp; Maligai
          </span>
        </div>
      ) : (
        <>
          {/* Subtle skeleton pulse while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-[#F0EBDD]/40 animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </>
      )}
    </div>
  );
};

export default ProductImage;
