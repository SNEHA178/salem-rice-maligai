import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { CategorySection } from '../components/category/CategorySection';
import { ProductSection } from '../components/product/ProductSection';
import { PricingModeSelector } from '../components/pricing/PricingModeSelector';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import { getFeaturedProducts, getProducts } from '../services/productService';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Scale,
  Sparkles,
  Award,
  Layers,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const Home = ({
  onNavigate = () => {},
  pricingMode = 'RETAIL',
  onAddToCart,
}) => {
  const { t, isTamil } = useLanguage();
  const { togglePricingMode } = usePricing();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Fetch dynamic products from the API
      const [featured, allProds] = await Promise.all([
        getFeaturedProducts().catch(() => []),
        getProducts({ available: true }).catch(() => []),
      ]);

      setFeaturedProducts(featured.length > 0 ? featured : allProds.slice(0, 4));
      setPopularProducts(allProds.length > 0 ? allProds.slice(0, 8) : []);
    } catch (err) {
      console.error('Failed to load home page products:', err);
      setLoadError(err.message || 'Unable to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return (
    <div className="w-full space-y-10 sm:space-y-14 pb-14">
      {/* 1. HERO SECTION (Cream background, Green primary, Gold accents) */}
      <section
        aria-label="Welcome and Store Overview"
        className="relative w-full bg-linear-to-b from-[#FAF8F2] via-[#FAF8F2] to-white border-b border-[#F0EBDD] py-8 sm:py-14 lg:py-16 overflow-hidden"
      >
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subheading & CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#F0EBDD] text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#205A3B] animate-pulse" />
                <span className="font-bold text-[#16402A]">Direct from Shevapet Rice Mills</span>
                <span className="text-[#CFA13A] hidden sm:inline">•</span>
                <span className="font-tamil text-[#2D7A50] hidden sm:inline">நேரடி ஆலை வரத்து</span>
              </div>

              {/* Main Headline (Bilingual per requirement 16) */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#16402A] font-heading tracking-tight leading-[1.15]">
                  {isTamil ? (
                    <>
                      தரமான அரிசி மற்றும் <br />
                      <span className="text-[#205A3B]">அன்றாட மளிகைப் பொருட்கள்</span>
                    </>
                  ) : (
                    <>
                      Quality Rice &amp; <br />
                      <span className="text-[#205A3B]">Everyday Essentials</span>
                    </>
                  )}
                </h1>
                <p className={`text-sm sm:text-base text-[#2D7A50] font-medium ${isTamil ? '' : 'font-tamil'}`}>
                  {isTamil
                    ? 'உங்கள் அன்றாட தேவைகளுக்கான தரமான பொருட்கள்.'
                    : 'சேலம் பாரம்பரிய அரிசி, தரமான பருப்பு வகைகள் மற்றும் மரச்செக்கு எண்ணெய்'}
                </p>
              </div>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-[#5A5A5A] max-w-xl leading-relaxed">
                {isTamil
                  ? 'சேலம் ஆலைகளிலிருந்து நேரடியாக பெறப்பட்ட தரமான பொன்னி அரிசி, இட்லி அரிசி, துவரம் பருப்பு மற்றும் மரச்செக்கு நல்லெண்ணெய். சில்லறை மற்றும் மொத்த விற்பனைக்கு சிறந்தது.'
                  : 'Fresh essentials for your everyday needs. Sourced straight from local Tamil Nadu mills with honest weights, unpolished purity, and fair retail & wholesale pricing.'}
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-sm sm:text-base transition cursor-pointer shadow-md active:scale-98"
                >
                  <span>{t('shopNow')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/categories')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#F0EBDD] hover:border-[#CFA13A] text-[#16402A] font-semibold text-sm sm:text-base transition cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#CFA13A]" />
                  <span>{t('exploreCategories')}</span>
                </button>
              </div>

              {/* Quick Highlights Bar */}
              <div className="pt-4 border-t border-[#F0EBDD] grid grid-cols-3 gap-2 text-xs text-[#5A5A5A]">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#CFA13A] shrink-0" />
                  <span className="font-medium">{t('pureNutrition')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#CFA13A] shrink-0" />
                  <span className="font-medium">{t('directMillRates')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#CFA13A] shrink-0" />
                  <span className="font-medium">{t('fastDelivery')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-[#F0EBDD] bg-white p-3 shadow-md group">
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-5/4">
                  <img
                    src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
                    alt="Salem Deluxe Ponni Rice"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#16402A]/90 via-[#16402A]/20 to-transparent" />

                  {/* Overlaid Card Info */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 sm:p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-[#F0EBDD] text-[#16402A] flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-[#CFA13A] uppercase block">
                        {isTamil ? 'இன்றைய சிறப்பு' : "TODAY'S HIGHLIGHT"}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm font-heading">
                        {isTamil ? 'சேலம் டீலக்ஸ் பொன்னி (25 கிலோ)' : 'Salem Deluxe Ponni (25kg)'}
                      </h4>
                      <p className="text-[11px] text-[#5A5A5A]">
                        {isTamil ? '12 மாதம் பதப்படுத்தப்பட்டது • ₹1,450' : '12-Month Aged Rice • ₹1,450'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('/products')}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
                    >
                      {t('shopNow')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. DUAL PRICING CONTROLS STRIP */}
      <section aria-label="Pricing Preference" className="w-full">
        <PageContainer>
          <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CFA13A]" />
                <h3 className="font-bold text-sm sm:text-base text-[#16402A] font-heading">
                  {isTamil ? 'சில்லறை & மொத்த விற்பனை இரட்டை விலை முறை' : 'Retail & Wholesale Dual Pricing'}
                </h3>
              </div>
              <p className="text-xs text-[#5A5A5A] max-w-xl">
                {isTamil
                  ? 'குடும்ப தேவைகளுக்கு சில்லறை விலையும், உணவகங்கள் மற்றும் வியாபாரிகளுக்கு சிறப்பு மொத்த விலையும்.'
                  : 'Toggle pricing anytime. Transparent wholesale prices for commercial buyers and retail for home kitchens.'}
              </p>
            </div>

            <PricingModeSelector
              currentMode={pricingMode}
              onToggleMode={togglePricingMode}
            />
          </div>
        </PageContainer>
      </section>

      {/* 3. DYNAMIC CATEGORIES SECTION (Fetches from /api/categories per requirement 21 & 22) */}
      <CategorySection
        onSelectCategory={(categoryId) => onNavigate(`/products?category=${categoryId}`)}
        onViewAllCategories={() => onNavigate('/categories')}
      />

      {/* 4. ERROR STATE WITH RETRY (Requirement 29) */}
      {loadError && (
        <PageContainer>
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>{isTamil ? 'பொருட்களை ஏற்றுவதில் சிரமம் ஏற்பட்டது.' : 'Unable to load products right now.'}</span>
            </div>
            <p className="text-xs text-amber-700">
              {loadError.toLowerCase().includes('fetch') || loadError.includes('TypeError')
                ? 'Unable to connect to the store right now.'
                : loadError}
            </p>
            <button
              type="button"
              onClick={loadHomeData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] cursor-pointer transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('retry')}</span>
            </button>
          </div>
        </PageContainer>
      )}

      {/* 5. FEATURED PRODUCTS (Fetches from /api/products per requirement 21) */}
      {!loadError && (
        <ProductSection
          title={t('featuredProducts')}
          subtitle={t('featuredSubtitle')}
          products={featuredProducts}
          pricingMode={pricingMode}
          onAddToCart={onAddToCart}
          onViewDetails={(id) => onNavigate(`/products/${id}`)}
          onViewAll={() => onNavigate('/products')}
          isLoading={isLoading}
          viewAllText={t('viewAll')}
        />
      )}

      {/* 6. POPULAR ESSENTIALS (Requirement 21) */}
      {!loadError && popularProducts.length > 0 && (
        <ProductSection
          title={isTamil ? 'அன்றாட அத்தியாவசிய பொருட்கள்' : 'Daily Harvest Essentials'}
          subtitle={isTamil ? 'சேலம் ஆலைகளிலிருந்து புதிய இருப்பு' : 'Direct fresh arrivals from our Shevapet warehouses'}
          products={popularProducts}
          pricingMode={pricingMode}
          onAddToCart={onAddToCart}
          onViewDetails={(id) => onNavigate(`/products/${id}`)}
          onViewAll={() => onNavigate('/products')}
          isLoading={isLoading}
          viewAllText={t('viewAll')}
        />
      )}
    </div>
  );
};

export default Home;
