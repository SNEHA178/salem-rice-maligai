import React from 'react';
import { PageContainer } from '../layout/PageContainer';
import { ProductCard } from './ProductCard';
import { usePricing } from '../../context/PricingContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Package } from 'lucide-react';

export const ProductSection = ({
  title = 'Featured Products',
  titleTamil,
  subtitle,
  tagline,
  products = [],
  pricingMode: propPricingMode,
  onAddToCart,
  onViewDetails,
  onViewAll,
  viewAllText,
  isLoading = false,
  id,
}) => {
  const { pricingMode: contextMode } = usePricing();
  const { t, isTamil } = useLanguage();
  const activeMode = propPricingMode || contextMode || 'retail';

  const defaultTagline = isTamil ? 'சேலம் நேரடி ஆலை சிறப்பு' : 'HANDPICKED SELECTION';
  const displayTagline = tagline || defaultTagline;
  const displayViewAll = viewAllText || t('viewAll');

  return (
    <section id={id} aria-label={typeof title === 'string' ? title : 'Products'} className="w-full">
      <PageContainer>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            {displayTagline && (
              <span className="text-xs font-bold text-[#CFA13A] uppercase tracking-wider block font-heading">
                {displayTagline}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#16402A] font-heading tracking-tight">
                {title}
              </h2>
              {titleTamil && !isTamil && (
                <span className="font-tamil text-xs sm:text-sm text-[#205A3B] hidden sm:inline">
                  • {titleTamil}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#5A5A5A] mt-0.5 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs sm:text-sm font-semibold text-[#205A3B] hover:text-[#16402A] flex items-center gap-1 cursor-pointer transition shrink-0"
            >
              <span>{displayViewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Loading shimmer state */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#F0EBDD] p-3.5 space-y-3 animate-pulse"
              >
                <div className="w-full aspect-4/3 bg-[#FAF8F2] rounded-xl" />
                <div className="h-4 bg-[#FAF8F2] rounded-md w-3/4" />
                <div className="h-3 bg-[#FAF8F2] rounded-md w-1/2" />
                <div className="h-8 bg-[#FAF8F2] rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          /* Products Grid (2 col mobile, 3 col tablet, 4 col desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map(product => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                pricingMode={activeMode}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          /* Empty state per requirement 30 */
          <div className="rounded-2xl bg-white border border-[#F0EBDD] p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-[#5A5A5A]">
              {t('noProducts')}
            </p>
          </div>
        )}
      </PageContainer>
    </section>
  );
};

export default ProductSection;
