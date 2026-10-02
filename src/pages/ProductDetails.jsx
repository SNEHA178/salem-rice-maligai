import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductImage } from '../components/common/ProductImage';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCard } from '../components/product/ProductCard';
import { PricingModeSelector } from '../components/pricing/PricingModeSelector';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import { getProductPrice, getWholesaleSavings } from '../utils/productPrice';
import { formatPrice } from '../utils/formatPrice';
import { getProductById, getProductsByCategory } from '../services/productService';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

export const ProductDetails = ({
  productId,
  onNavigate = () => {},
  pricingMode: propPricingMode,
  onAddToCart,
}) => {
  const { pricingMode: contextMode, setPricingMode } = usePricing();
  const { t, isTamil, getName, getDescription, formatUnit } = useLanguage();
  const activeMode = String(propPricingMode || contextMode || 'retail').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
  const isWholesale = activeMode === 'wholesale';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [minQtyError, setMinQtyError] = useState('');

  const primaryName = product ? getName(product) : '';
  const descText = product ? getDescription(product) : '';
  const displayUnit = product ? formatUnit(product.unit) : '';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setMinQtyError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!productId) {
      setIsLoading(false);
      return;
    }

    getProductById(productId)
      .then(found => {
        if (!isMounted) return;
        setProduct(found);
        if (found) {
          setSelectedImage(found.image || '');
          // If product has a wholesale minimum quantity and wholesale is active, set initial quantity
          if (isWholesale && found.wholesaleMinimumQuantity) {
            setQuantity(Math.max(1, Number(found.wholesaleMinimumQuantity)));
          } else {
            setQuantity(1);
          }
          // Fetch related items from same category
          getProductsByCategory(found.category).then(related => {
            if (isMounted) {
              setRelatedProducts(related.filter(r => r.id !== found.id).slice(0, 4));
            }
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // When switching pricing mode to wholesale, respect wholesaleMinimumQuantity if present
  useEffect(() => {
    if (product && isWholesale && product.wholesaleMinimumQuantity) {
      const min = Number(product.wholesaleMinimumQuantity);
      if (quantity < min) {
        setQuantity(min);
      }
      setMinQtyError('');
    } else {
      setMinQtyError('');
    }
  }, [isWholesale, product]);

  if (isLoading) {
    return (
      <div className="w-full py-16">
        <PageContainer>
          <LoadingState message="Fetching grain & provision details..." />
        </PageContainer>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-12">
        <PageContainer variant="narrow">
          <EmptyState
            title="Product Not Found"
            description="The grain or grocery product you are looking for is currently not available in our catalog."
            actionLabel="Return to Products"
            onAction={() => onNavigate('/products')}
          />
        </PageContainer>
      </div>
    );
  }

  const isAvailable = product.available !== false;
  const currentPrice = getProductPrice(product, activeMode);
  const wholesaleMinQty = product.wholesaleMinimumQuantity ? Number(product.wholesaleMinimumQuantity) : null;

  const handleDecreaseQuantity = () => {
    if (isWholesale && wholesaleMinQty) {
      if (quantity <= wholesaleMinQty) {
        setMinQtyError(`Minimum wholesale quantity is ${wholesaleMinQty}.`);
        return;
      }
    }
    if (quantity > 1) {
      setQuantity(q => q - 1);
      setMinQtyError('');
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(q => q + 1);
    setMinQtyError('');
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;

    if (isWholesale && wholesaleMinQty && quantity < wholesaleMinQty) {
      setMinQtyError(`Minimum wholesale quantity is ${wholesaleMinQty}.`);
      return;
    }

    if (onAddToCart) {
      onAddToCart(product, quantity, activeMode);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <div className="w-full py-6 sm:py-10">
      <PageContainer>
        {/* Top Back Navigation & Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#5A5A5A]">
          <button
            type="button"
            onClick={() => onNavigate('/products')}
            className="inline-flex items-center gap-1.5 font-semibold text-[#205A3B] hover:text-[#16402A] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Products</span>
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate(`/products?category=${product.category}`)}
            className="capitalize hover:text-[#205A3B] transition cursor-pointer"
          >
            {product.categoryName || product.category}
          </button>
          <span>/</span>
          <span className="text-[#16402A] font-medium truncate max-w-xs">
            {product.name}
          </span>
        </div>

        {/* Main Product Details Layout: Desktop 2 Columns, Mobile Single Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-[#F0EBDD] p-5 sm:p-8 shadow-xs">
          {/* Left Column: Image Gallery (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#F0EBDD] bg-[#FAF8F2] aspect-4/3 sm:aspect-square">
              <ProductImage
                src={selectedImage || product.image}
                alt={product.name}
                aspectRatio="aspect-square"
                className="w-full h-full object-cover"
              />

              {/* Badges on main image */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                <span className="bg-[#16402A] text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase shadow-xs">
                  {isWholesale ? 'Wholesale Pricing' : 'Retail Pricing'}
                </span>
                {product.featured && (
                  <span className="bg-[#CFA13A] text-[#16402A] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    Featured Grain
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 z-10">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Currently Unavailable</span>
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedImage === img
                        ? 'border-[#205A3B] ring-2 ring-[#205A3B]/20'
                        : 'border-[#F0EBDD] hover:border-[#CFA13A]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Origin */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(`/products?category=${product.category}`)}
                  className="bg-[#FAF8F2] text-[#205A3B] hover:bg-[#F0EBDD] text-xs font-bold px-3 py-1 rounded-lg border border-[#F0EBDD] capitalize cursor-pointer transition"
                >
                  {product.categoryName || product.category}
                </button>
                <span className="text-xs text-[#5A5A5A]">•</span>
                <span className="text-xs font-semibold text-[#B58A2B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#CFA13A]" />
                  <span>Salem Direct Mill Harvest</span>
                </span>
              </div>

              {/* Title & Secondary Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#16402A] font-heading tracking-tight leading-tight">
                  {primaryName}
                </h1>
                {typeof product.name === 'object' && product.name.ta && !isTamil && (
                  <p className="font-tamil text-base sm:text-lg text-[#2D7A50] mt-1 font-medium">
                    {product.name.ta}
                  </p>
                )}
                {product.nameTamil && !isTamil && !product.name?.ta && (
                  <p className="font-tamil text-base sm:text-lg text-[#2D7A50] mt-1 font-medium">
                    {product.nameTamil}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed">
                  {descText}
                </p>
                <p className="text-xs text-[#2B2B2B] font-semibold mt-1">
                  {isTamil ? 'அளவு' : 'Standard Unit'}: <span className="text-[#16402A]">{displayUnit}</span>
                </p>
              </div>

              {/* PRICING MODE SELECTOR & PRICE BLOCK */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#16402A] uppercase tracking-wider">
                      {isTamil ? 'விலை முறை:' : 'Select Pricing:'}
                    </span>
                    <PricingModeSelector
                      currentMode={activeMode}
                      size="sm"
                      onChange={mode => setPricingMode(mode)}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-[#5A5A5A]">
                    {t('mode')}: <strong className="text-[#16402A] capitalize">{isWholesale ? t('wholesale') : t('retail')}</strong>
                  </span>
                </div>

                {/* Current Price Display */}
                <div className="flex items-baseline gap-2 pt-2 border-t border-[#F0EBDD]">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#16402A] font-heading">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm sm:text-base text-[#5A5A5A] font-medium">
                    / {displayUnit}
                  </span>
                  <span
                    className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-md ${
                      isWholesale
                        ? 'bg-[#CFA13A]/20 text-[#16402A] border border-[#CFA13A]/40'
                        : 'bg-[#205A3B]/10 text-[#205A3B]'
                    }`}
                  >
                    {isWholesale ? t('wholesale') : t('retail')}
                  </span>
                </div>

                {/* Wholesale Informational Note (Requirement 14) */}
                {isWholesale && (
                  <div className="flex items-start gap-2 text-xs text-[#16402A] bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                    <Info className="w-4 h-4 text-[#CFA13A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Wholesale pricing available for bulk purchases.
                      </p>
                      {wholesaleMinQty && (
                        <p className="text-[11px] text-[#B58A2B] font-bold mt-0.5">
                          Minimum wholesale order quantity: {wholesaleMinQty} units.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications / Mill Details if available */}
              {product.specifications && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-[#16402A] uppercase tracking-wider font-heading mb-2">
                    Harvest &amp; Grain Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-[#FAF8F2] p-2.5 rounded-xl border border-[#F0EBDD]"
                      >
                        <span className="text-[#5A5A5A] capitalize block text-[10px]">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-semibold text-[#2B2B2B] block truncate">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart Section */}
            <div className="pt-4 border-t border-[#F0EBDD] space-y-3">
              {isAvailable ? (
                <>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between sm:justify-start border border-[#F0EBDD] rounded-xl p-1 bg-[#FAF8F2]">
                      <span className="text-xs font-semibold text-[#5A5A5A] px-3 sm:hidden">
                        Quantity:
                      </span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleDecreaseQuantity}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 rounded-lg bg-white border border-[#F0EBDD] text-[#16402A] flex items-center justify-center hover:bg-[#F0EBDD] transition cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-[#16402A] font-heading">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={handleIncreaseQuantity}
                          aria-label="Increase quantity"
                          className="w-9 h-9 rounded-lg bg-white border border-[#F0EBDD] text-[#16402A] flex items-center justify-center hover:bg-[#F0EBDD] transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      aria-label={`Add ${quantity} of ${product.name} to cart at ${formatPrice(currentPrice)}`}
                      className="flex-1 py-3 px-6 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-semibold text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {t('addToCart')} • {formatPrice(currentPrice * quantity)} ({isWholesale ? t('wholesale') : t('retail')})
                      </span>
                    </button>
                  </div>

                  {/* Minimum quantity error banner if user attempts invalid quantity */}
                  {minQtyError && (
                    <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{minQtyError}</span>
                    </div>
                  )}

                  {/* Subtotal preview */}
                  <div className="flex items-center justify-between text-xs text-[#5A5A5A] px-1">
                    <span>
                      Order Subtotal: <strong className="text-[#16402A]">{formatPrice(currentPrice * quantity)}</strong> ({quantity} {quantity === 1 ? 'pack' : 'packs'})
                    </span>
                    <span className="capitalize text-[#205A3B] font-semibold">
                      Mode: {activeMode}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Currently Unavailable</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    This grain variety is awaiting the next fresh mill arrival from Shevapet. Please check back shortly.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="w-full mt-2 py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm border border-gray-200 cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                </div>
              )}

              {/* Added to cart toast */}
              {addedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      Added {quantity} × {product.name} ({activeMode} rate: {formatPrice(currentPrice)}) to Cart!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/cart')}
                    className="underline hover:text-emerald-950 font-bold ml-2 cursor-pointer"
                  >
                    View Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Category Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
                  More in {product.categoryName || product.category}
                </h2>
                <p className="text-xs sm:text-sm text-[#5A5A5A]">
                  Direct mill staples from the same Salem department
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/products?category=${product.category}`)}
                className="text-xs sm:text-sm font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer"
              >
                View Department
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  pricingMode={activeMode}
                  onAddToCart={onAddToCart}
                  onViewDetails={id => onNavigate(`/products/${id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ProductDetails;
