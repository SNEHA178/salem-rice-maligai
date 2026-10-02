import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { RetailWholesaleToggle } from '../common/RetailWholesaleToggle';
import { Product, Category, Advertisement, PricingMode } from '../../types';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  advertisements: Advertisement[];
  pricingMode: PricingMode;
  setPricingMode: (mode: PricingMode) => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, mode: PricingMode, quantity?: number) => void;
  addedProductIds: { [id: string]: boolean };
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  advertisements,
  pricingMode,
  setPricingMode,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  addedProductIds,
}) => {
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Active advertisements
  const activeAds = advertisements.filter(a => a.active);
  const currentAd = activeAds[activeAdIndex] || activeAds[0];

  // Featured products
  const featuredProducts = products.filter(p => p.featured && p.available);
  const allAvailableProducts = products.filter(p => p.available);

  // Active categories
  const activeCategories = categories.filter(c => c.active);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 1. HERO / PROMOTIONAL AD BANNER (Requirement #8, #11, #20) */}
      <PageContainer className="pt-4 sm:pt-6">
        {currentAd ? (
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#16402A] text-white shadow-md border border-[#CFA13A]/30">
            {/* Banner Background Image with Controlled Aspect Ratio */}
            <div className="relative aspect-21/9 sm:aspect-24/9 min-h-[220px] max-h-[360px] w-full overflow-hidden">
              <img
                src={currentAd.image}
                alt={currentAd.title}
                className="w-full h-full object-cover object-center transform scale-105 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#16402A] via-[#16402A]/85 to-transparent" />
            </div>

            {/* Overlay Banner Content */}
            <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-center max-w-xl z-10">
              {currentAd.badge && (
                <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#CFA13A] text-[#16402A] mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  {currentAd.badge}
                </span>
              )}

              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight font-heading leading-tight text-[#FAF8F2]">
                {currentAd.title}
              </h2>

              {currentAd.tamilTitle && (
                <p className="font-tamil text-xs sm:text-sm text-[#DFBA5C] font-semibold mt-1">
                  {currentAd.tamilTitle}
                </p>
              )}

              {currentAd.subtitle && (
                <p className="text-xs sm:text-sm text-gray-200 mt-2 line-clamp-2 max-w-md hidden sm:block">
                  {currentAd.subtitle}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {currentAd.linkCategory && (
                  <button
                    onClick={() => onSelectCategory(currentAd.linkCategory!)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#CFA13A] text-[#16402A] hover:bg-[#DFBA5C] transition shadow-xs cursor-pointer"
                  >
                    <span>Browse {currentAd.linkCategory}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Pricing Mode Quick Switch in Hero */}
                <div className="inline-flex items-center gap-1.5 bg-[#205A3B]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#DFBA5C]/30 text-xs">
                  <span className="text-gray-300">View in:</span>
                  <button
                    onClick={() => setPricingMode(pricingMode === 'RETAIL' ? 'WHOLESALE' : 'RETAIL')}
                    className="font-bold text-[#DFBA5C] hover:underline"
                  >
                    {pricingMode === 'RETAIL' ? 'Wholesale Pricing' : 'Retail Pricing'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination dots if multiple ads */}
            {activeAds.length > 1 && (
              <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
                {activeAds.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAdIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeAdIndex ? 'w-5 bg-[#DFBA5C]' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </PageContainer>

      {/* 2. BRAND PROMISE / TRUST BADGES (Requirement #8) */}
      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white border border-[#F0EBDD] shadow-xs">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center shrink-0 border border-[#F0EBDD]">
              <Award className="w-5 h-5 text-[#CFA13A]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16402A]">Direct Salem Mill</h4>
              <p className="text-[11px] text-gray-500">Pure unpolished grains</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center shrink-0 border border-[#F0EBDD]">
              <TrendingUp className="w-5 h-5 text-[#205A3B]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16402A]">Wholesale Rates</h4>
              <p className="text-[11px] text-gray-500">Bulk savings for shops</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center shrink-0 border border-[#F0EBDD]">
              <Truck className="w-5 h-5 text-[#CFA13A]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16402A]">Fast Local Delivery</h4>
              <p className="text-[11px] text-gray-500">Free delivery on sacks</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center shrink-0 border border-[#F0EBDD]">
              <ShieldCheck className="w-5 h-5 text-[#205A3B]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16402A]">Family Business</h4>
              <p className="text-[11px] text-gray-500">Serving trust since 1988</p>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* 3. DYNAMIC CATEGORIES (Requirement #8, #19: Admin adds -> customer sees automatically!) */}
      <PageContainer>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#16402A] font-heading">
              Shop by Category
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Browse authentic Salem rice, cold-pressed oils, flours, and daily maligai
            </p>
          </div>
          <span className="text-xs text-[#205A3B] font-semibold">
            {activeCategories.length} Categories
          </span>
        </div>

        {/* Adaptive Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {activeCategories.map(cat => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.name)}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-[#F0EBDD] hover:border-[#CFA13A] hover:shadow-md transition-all text-center cursor-pointer"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2.5 bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16402A] line-clamp-1 group-hover:text-[#205A3B]">
                {cat.name}
              </h4>
              {cat.tamilName && (
                <span className="font-tamil text-[10px] text-[#5A5A5A] line-clamp-1 mt-0.5">
                  {cat.tamilName}
                </span>
              )}
            </button>
          ))}
        </div>
      </PageContainer>

      {/* 4. FEATURED PRODUCTS (Requirement #8, #28: 2 cols on mobile, 3-4 cols on tablet/desktop) */}
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-[#DFBA5C]/30 text-[#16402A] text-[11px] font-bold">
                MILL FAVORITES
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-[#16402A] font-heading mt-1">
              Featured Rice &amp; Provisions
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Highest quality customer choices with instant Retail or Wholesale price switching
            </p>
          </div>

          {/* Pricing Toggle Bar */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-[#F0EBDD] shadow-xs">
            <span className="text-xs text-gray-500 font-medium">Pricing:</span>
            <RetailWholesaleToggle
              mode={pricingMode}
              onChange={setPricingMode}
              size="sm"
            />
          </div>
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map(product => {
            const isWholesale = pricingMode === 'WHOLESALE';
            const price = isWholesale ? product.wholesalePrice : product.retailPrice;
            const savings = product.retailPrice - product.wholesalePrice;
            const isAdded = addedProductIds[product._id];

            return (
              <div
                key={product._id}
                className="group flex flex-col rounded-2xl bg-white border border-[#F0EBDD] hover:border-[#205A3B]/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Product Image with Controlled Aspect Ratio & Crop */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-4/3 w-full bg-[#FAF8F2] overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#205A3B] text-white shadow-xs">
                      {product.category}
                    </span>
                    {isWholesale && savings > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#CFA13A] text-[#16402A] shadow-xs">
                        Save ₹{savings}
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    per {product.unit}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-[#16402A] hover:text-[#205A3B] line-clamp-1 cursor-pointer font-heading"
                    >
                      {product.name}
                    </h4>

                    {product.tamilName && (
                      <p className="font-tamil text-[11px] text-[#5A5A5A] line-clamp-1 mt-0.5">
                        {product.tamilName}
                      </p>
                    )}

                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F0EBDD]">
                    {/* Price & Unit */}
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-xl font-extrabold text-[#16402A]">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            /{product.unit}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-[#CFA13A] uppercase block">
                          {isWholesale ? 'Wholesale Price' : 'Retail Price'}
                        </span>
                      </div>

                      {/* Stock indicator */}
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                        In Stock
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      id={`add-to-cart-${product._id}`}
                      onClick={() => onAddToCart(product, pricingMode, 1)}
                      className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
                        isAdded
                          ? 'bg-[#16402A] text-white'
                          : 'bg-[#205A3B] hover:bg-[#16402A] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#DFBA5C]" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5 text-[#DFBA5C]" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>

      {/* 5. ALL PRODUCTS LISTING PREVIEW (Requirement #8) */}
      <PageContainer>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#16402A] font-heading">
              Complete Rice &amp; Provision Catalog
            </h3>
            <p className="text-xs text-gray-500">
              Showing all direct products from our warehouse
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {allAvailableProducts.map(product => {
            const isWholesale = pricingMode === 'WHOLESALE';
            const price = isWholesale ? product.wholesalePrice : product.retailPrice;
            const isAdded = addedProductIds[product._id];

            return (
              <div
                key={product._id}
                className="group flex flex-col rounded-2xl bg-white border border-[#F0EBDD] hover:border-[#205A3B]/40 hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-4/3 w-full bg-[#FAF8F2] overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#205A3B] text-white">
                    {product.category}
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-[#16402A] hover:text-[#205A3B] line-clamp-1 cursor-pointer font-heading"
                    >
                      {product.name}
                    </h4>
                    {product.tamilName && (
                      <p className="font-tamil text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                        {product.tamilName}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#F0EBDD] flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-extrabold text-[#16402A]">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        /{product.unit} ({isWholesale ? 'Wholesale' : 'Retail'})
                      </span>
                    </div>

                    <button
                      onClick={() => onAddToCart(product, pricingMode, 1)}
                      className="p-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white transition cursor-pointer"
                      title="Add to Cart"
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 text-[#DFBA5C]" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-[#DFBA5C]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
};
