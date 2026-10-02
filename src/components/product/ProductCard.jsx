import React from 'react';
import { ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { ProductImage } from '../common/ProductImage';
import { usePricing } from '../../context/PricingContext';
import { useLanguage } from '../../context/LanguageContext';
import { getProductPrice, getWholesaleSavings } from '../../utils/productPrice';
import { formatPrice } from '../../utils/formatPrice';

export const ProductCard = ({
  id,
  product,
  name: propName,
  nameTamil: propNameTamil,
  image: propImage,
  unit: propUnit,
  retailPrice: propRetailPrice,
  wholesalePrice: propWholesalePrice,
  pricingMode: propPricingMode,
  available: propAvailable,
  inStock: propInStock,
  category: propCategory,
  onAddToCart,
  onViewDetails,
}) => {
  const { t, isTamil, getName, formatUnit } = useLanguage();
  const pricingCtx = usePricing();
  const rawMode = propPricingMode || (pricingCtx ? pricingCtx.pricingMode : 'retail');
  const activeMode = String(rawMode).toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';

  const p = product || {};
  const productId = id || p.id || p._id;

  // Language aware names
  const enName = typeof p.name === 'object' ? p.name.en : (propName || p.name || 'Salem Harvest');
  const taName = typeof p.name === 'object' ? p.name.ta : (propNameTamil || p.tamilName || p.nameTamil || '');

  const primaryName = isTamil ? (taName || enName) : (enName || taName);
  const secondaryName = isTamil ? (enName !== primaryName ? enName : '') : (taName !== primaryName ? taName : '');

  const image = propImage || p.image;
  const rawUnit = propUnit || p.unit || 'kg';
  const displayUnit = formatUnit(rawUnit);

  const retailPrice = propRetailPrice !== undefined ? propRetailPrice : (p.retailPrice || 0);
  const wholesalePrice = propWholesalePrice !== undefined ? propWholesalePrice : (p.wholesalePrice || retailPrice);
  const category = propCategory || p.categoryName || (typeof p.category === 'object' ? (isTamil ? p.category.ta : p.category.en) : p.category);

  const productData = {
    ...p,
    id: productId,
    name: p.name || enName,
    tamilName: taName,
    image,
    unit: rawUnit,
    retailPrice,
    wholesalePrice,
    category,
    wholesaleMinimumQuantity: p.wholesaleMinimumQuantity,
  };

  const isAvailable = propAvailable !== undefined
    ? propAvailable
    : (p.available !== undefined ? p.available : (propInStock !== undefined ? propInStock : true));

  const currentPrice = getProductPrice(productData, activeMode);
  const isWholesale = activeMode === 'wholesale';
  const savings = getWholesaleSavings(productData);

  const handleCardClick = () => {
    if (onViewDetails && productId) {
      onViewDetails(productId);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (onAddToCart) {
      onAddToCart(
        {
          ...productData,
          available: isAvailable,
        },
        1,
        activeMode
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#F0EBDD] overflow-hidden hover:border-[#205A3B]/40 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer select-none"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-4/3 bg-[#FAF8F2] overflow-hidden">
        <ProductImage
          src={image}
          alt={primaryName}
          aspectRatio="aspect-4/3"
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Pill Tag */}
        {category && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-white/90 backdrop-blur-xs text-[#16402A] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#F0EBDD] shadow-2xs capitalize">
              {category}
            </span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50/95 backdrop-blur-xs text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{t('inStock')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-50/95 backdrop-blur-xs text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-rose-200">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>{t('outOfStock')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#16402A] font-heading line-clamp-2 group-hover:text-[#205A3B] transition leading-snug">
            {primaryName}
          </h3>

          {secondaryName && (
            <p className={`text-xs text-[#2D7A50] mt-0.5 line-clamp-1 ${isTamil ? '' : 'font-tamil'}`}>
              {secondaryName}
            </p>
          )}

          <p className="text-xs text-[#5A5A5A] mt-1 font-medium">
            {isTamil ? 'அளவு' : 'Unit'}: <span className="text-[#2B2B2B] font-semibold">{displayUnit}</span>
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2.5 border-t border-[#F0EBDD] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-[#16402A] font-heading">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-[11px] text-[#5A5A5A]">/{displayUnit}</span>
            </div>

            {/* Pricing Mode Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                  isWholesale
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-[#FAF8F2] text-[#205A3B] border border-[#F0EBDD]'
                }`}
              >
                {isWholesale ? t('wholesale') : t('retail')}
              </span>
              {isWholesale && savings.savingsPercent > 0 && (
                <span className="text-[9px] font-bold text-emerald-700">
                  {isTamil ? `${savings.savingsPercent}% சேமிப்பு` : `Save ${savings.savingsPercent}%`}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={!isAvailable}
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
              isAvailable
                ? 'bg-[#205A3B] hover:bg-[#16402A] text-white active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
            aria-label={`${t('addToCart')} ${primaryName}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
