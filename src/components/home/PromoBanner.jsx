import React from 'react';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

/**
 * Reusable Promotional Banner
 * Prepared for future dynamic admin advertisements (images, titles, CTA, discounts).
 */
export const PromoBanner = ({
  title = 'Everyday Essentials. Better Value.',
  titleTamil = 'தினசரி மளிகை • சிறந்த தரம் • நியாயமான விலை',
  subtitle = 'Direct-from-mill Ponni boiled rice, unpolished toor dal, and cold-pressed cooking oils. Honest weights and prompt dispatch.',
  discountText = 'SAVE UP TO 15% ON MONTHLY PROVISIONS',
  badge = 'DIRECT MILL SPECIAL',
  ctaText = 'Shop Provisions Now',
  onCtaClick,
  image = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
  variant = 'dark', // 'dark' | 'cream'
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#CFA13A]/40 shadow-md">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-40"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#16402A]/95 via-[#16402A]/85 to-[#205A3B]/75" />
      </div>

      {/* Decorative grain pattern watermark */}
      <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none w-64 h-64">
        <img src="/icon.svg" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {/* Badge & Discount */}
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#CFA13A] text-[#16402A] uppercase shadow-xs">
                <Sparkles className="w-3 h-3 text-[#16402A]" />
                <span>{badge}</span>
              </span>
            )}
            {discountText && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-[#DFBA5C] border border-white/20">
                <Tag className="w-3 h-3" />
                <span>{discountText}</span>
              </span>
            )}
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
              {title}
            </h2>
            {titleTamil && (
              <p className="font-tamil text-xs sm:text-sm text-[#DFBA5C] mt-1 font-medium">
                {titleTamil}
              </p>
            )}
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* CTA Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#CFA13A] hover:bg-[#B58A2B] text-[#16402A] font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
