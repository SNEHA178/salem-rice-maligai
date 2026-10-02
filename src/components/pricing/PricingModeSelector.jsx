import React from 'react';
import { usePricing } from '../../context/PricingContext';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Compact, accessible pricing mode selector
 * [ Retail ] [ Wholesale ]
 * 
 * Supports standalone mode or contextual product price preview
 */
export const PricingModeSelector = ({
  size = 'md', // 'sm' | 'md'
  showPrices = false,
  retailPrice,
  wholesalePrice,
  className = '',
  onChange,
  showLabel = false,
  label = 'Pricing:',
}) => {
  const { pricingMode, setPricingMode } = usePricing();

  const handleSelect = (mode) => {
    setPricingMode(mode);
    if (onChange) {
      onChange(mode);
    }
  };

  const isRetail = pricingMode === 'retail';
  const isWholesale = pricingMode === 'wholesale';

  const isSmall = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Pricing mode selector"
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {showLabel && (
        <span className="text-xs font-semibold text-[#5A5A5A] mr-1 hidden sm:inline">
          {label}
        </span>
      )}

      <div
        className="inline-flex items-center p-0.5 rounded-xl bg-[#FAF8F2] border border-[#F0EBDD] shadow-2xs"
        role="radiogroup"
        aria-label="Select Retail or Wholesale price"
      >
        {/* Retail Option */}
        <button
          type="button"
          role="radio"
          aria-checked={isRetail}
          onClick={() => handleSelect('retail')}
          className={`relative transition-all duration-150 font-medium rounded-lg cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-[#205A3B] flex items-center justify-center gap-1.5 ${
            isSmall
              ? 'px-2.5 py-1 text-xs'
              : 'px-3.5 py-1.5 text-xs sm:text-sm'
          } ${
            isRetail
              ? 'bg-[#205A3B] text-white font-bold shadow-xs'
              : 'text-[#2B2B2B] hover:text-[#16402A] hover:bg-white/60'
          }`}
        >
          <span>Retail</span>
          {showPrices && retailPrice !== undefined && (
            <span
              className={`text-[11px] font-semibold ${
                isRetail ? 'text-[#FAF8F2]' : 'text-[#5A5A5A]'
              }`}
            >
              {formatPrice(retailPrice)}
            </span>
          )}
        </button>

        {/* Wholesale Option */}
        <button
          type="button"
          role="radio"
          aria-checked={isWholesale}
          onClick={() => handleSelect('wholesale')}
          className={`relative transition-all duration-150 font-medium rounded-lg cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-[#205A3B] flex items-center justify-center gap-1.5 ${
            isSmall
              ? 'px-2.5 py-1 text-xs'
              : 'px-3.5 py-1.5 text-xs sm:text-sm'
          } ${
            isWholesale
              ? 'bg-[#205A3B] text-white font-bold shadow-xs'
              : 'text-[#2B2B2B] hover:text-[#16402A] hover:bg-white/60'
          }`}
        >
          <span>Wholesale</span>
          {showPrices && wholesalePrice !== undefined && (
            <span
              className={`text-[11px] font-semibold ${
                isWholesale ? 'text-[#DFBA5C]' : 'text-[#B58A2B]'
              }`}
            >
              {formatPrice(wholesalePrice)}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default PricingModeSelector;
