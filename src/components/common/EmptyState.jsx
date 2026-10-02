import React from 'react';
import { PackageOpen, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  title = 'No products found',
  description = 'Try adjusting your search terms or browse another category to find everyday essentials.',
  actionLabel = 'View All Products',
  onAction,
  icon: Icon = PackageOpen,
}) => {
  return (
    <div className="w-full py-12 px-4 rounded-3xl bg-white border border-[#F0EBDD] text-center max-w-lg mx-auto shadow-xs my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B] mb-4">
        <Icon className="w-8 h-8 stroke-1" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#16402A] font-heading">{title}</h3>
      <p className="text-xs sm:text-sm text-[#5A5A5A] mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {onAction && actionLabel && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
