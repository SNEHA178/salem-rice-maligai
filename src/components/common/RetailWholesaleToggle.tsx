import React from 'react';
import { PricingMode } from '../../types';

interface RetailWholesaleToggleProps {
  mode: PricingMode;
  onChange: (mode: PricingMode) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  retailPrice?: number;
  wholesalePrice?: number;
}

export const RetailWholesaleToggle: React.FC<RetailWholesaleToggleProps> = ({
  mode,
  onChange,
  size = 'md',
  className = '',
  retailPrice,
  wholesalePrice,
}) => {
  const isWholesale = mode === 'WHOLESALE';
  const savings = retailPrice && wholesalePrice ? retailPrice - wholesalePrice : null;

  const sizeClasses = {
    sm: 'text-xs p-0.5',
    md: 'text-xs sm:text-sm p-1',
    lg: 'text-sm p-1.5',
  }[size];

  const btnPadding = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  }[size];

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div
        id="retail-wholesale-toggle-group"
        role="group"
        aria-label="Pricing Mode"
        className={`inline-flex items-center rounded-xl bg-[#F0EBDD] border border-[#CFA13A]/30 ${sizeClasses}`}
      >
        <button
          type="button"
          onClick={() => onChange('RETAIL')}
          className={`rounded-lg font-semibold transition-all duration-150 cursor-pointer ${btnPadding} ${
            !isWholesale
              ? 'bg-[#205A3B] text-white shadow-xs'
              : 'text-[#2B2B2B] hover:text-[#16402A]'
          }`}
        >
          Retail
        </button>

        <button
          type="button"
          onClick={() => onChange('WHOLESALE')}
          className={`rounded-lg font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1 ${btnPadding} ${
            isWholesale
              ? 'bg-[#CFA13A] text-[#16402A] shadow-xs'
              : 'text-[#2B2B2B] hover:text-[#16402A]'
          }`}
        >
          <span>Wholesale</span>
          {savings && savings > 0 && !isWholesale && (
            <span className="hidden sm:inline-block text-[10px] bg-[#205A3B]/10 text-[#205A3B] px-1 rounded-sm font-bold">
              Save ₹{savings}
            </span>
          )}
        </button>
      </div>

      {isWholesale && savings && savings > 0 && (
        <span className="text-[11px] font-medium text-[#205A3B] mt-1">
          Wholesale savings: ₹{savings} per unit
        </span>
      )}
    </div>
  );
};
