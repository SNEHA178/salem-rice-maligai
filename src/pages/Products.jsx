import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductCard } from '../components/product/ProductCard';
import { PricingModeSelector } from '../components/pricing/PricingModeSelector';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { Search, X, Filter, ArrowLeft, RefreshCw, Package } from 'lucide-react';

export const Products = ({
  onNavigate = () => {},
  pricingMode: propPricingMode,
  onAddToCart,
  initialCategory = 'all',
  initialSearch = '',
}) => {
  const { pricingMode: contextMode, togglePricingMode } = usePricing();
  const { t, isTamil, getName, getDescription } = useLanguage();
  const activeMode = propPricingMode || contextMode || 'retail';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync with prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ available: true }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Unable to load products.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
      const catNorm = selectedCategory.toLowerCase();
      result = result.filter(p => {
        const pCat = typeof p.category === 'string' ? p.category.toLowerCase() : '';
        const pCatName = typeof p.categoryName === 'string' ? p.categoryName.toLowerCase() : '';
        const pCatId = p.category?._id || p.category?.id;
        return (
          pCat === catNorm ||
          pCatName === catNorm ||
          (pCatId && pCatId === selectedCategory)
        );
      });
    }

    // Search query filter (supporting English + Tamil text per requirement 12)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const enName = typeof p.name === 'object' ? p.name.en : p.name;
        const taName = typeof p.name === 'object' ? p.name.ta : (p.tamilName || p.nameTamil);
        const enDesc = typeof p.description === 'object' ? p.description.en : p.description;
        const taDesc = typeof p.description === 'object' ? p.description.ta : '';

        return (
          (enName && enName.toLowerCase().includes(q)) ||
          (taName && taName.toLowerCase().includes(q)) ||
          (enDesc && enDesc.toLowerCase().includes(q)) ||
          (taDesc && taDesc.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const activeCategoryObj = categories.find(
    c =>
      (c._id && c._id === selectedCategory) ||
      (c.id && c.id === selectedCategory) ||
      (typeof c.name === 'object' && (c.name.en?.toLowerCase() === selectedCategory.toLowerCase() || c.name.ta?.toLowerCase() === selectedCategory.toLowerCase())) ||
      (typeof c.name === 'string' && c.name.toLowerCase() === selectedCategory.toLowerCase())
  );

  const activeCategoryName = activeCategoryObj ? getName(activeCategoryObj) : selectedCategory;

  return (
    <div className="w-full py-6 sm:py-8">
      <PageContainer>
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 mb-4 text-xs text-[#5A5A5A]">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1 font-semibold text-[#205A3B] hover:text-[#16402A] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('home')}</span>
          </button>
          <span>/</span>
          <span className="text-[#16402A] font-medium capitalize">
            {selectedCategory === 'all'
              ? (isTamil ? 'அனைத்து பொருட்கள்' : 'All Products')
              : activeCategoryName}
          </span>
        </div>

        {/* Header Title & Category Description */}
        <div className="mb-6 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#CFA13A] uppercase tracking-wider block font-heading">
                {isTamil ? 'சேலம் நேரடி ஆலை மளிகை' : 'AUTHENTIC SALEM PROVISIONS'}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#16402A] font-heading tracking-tight">
                {selectedCategory === 'all'
                  ? (isTamil ? 'அனைத்து அரிசி மற்றும் மளிகை' : 'All Rice & Essentials')
                  : `${activeCategoryName} ${isTamil ? 'பொருட்கள்' : 'Essentials'}`}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <PricingModeSelector
                currentMode={activeMode}
                onToggleMode={togglePricingMode}
                size="sm"
                showLabel
                label={`${t('mode')}:`}
              />
              <span className="text-xs font-semibold text-[#5A5A5A] bg-white px-3 py-1.5 rounded-xl border border-[#F0EBDD] shrink-0">
                {filteredProducts.length} {t('items')}
              </span>
            </div>
          </div>

          {activeCategoryObj && (
            <p className="text-xs sm:text-sm text-[#5A5A5A] max-w-2xl pt-1">
              {getDescription(activeCategoryObj)}
            </p>
          )}
        </div>

        {/* Filter & Search Bar Area */}
        <div className="bg-white rounded-2xl border border-[#F0EBDD] p-3 sm:p-4 mb-6 space-y-3 shadow-xs">
          {/* Category Filter Pills (Horizontal Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#16402A] flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#CFA13A]" />
              <span className="hidden sm:inline">{t('categories')}:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#205A3B] text-white shadow-xs'
                  : 'bg-[#FAF8F2] text-[#2B2B2B] hover:bg-[#F0EBDD]'
              }`}
            >
              {isTamil ? 'அனைத்தும்' : 'All Products'}
            </button>

            {categories.map(cat => {
              const catId = cat._id || cat.id;
              const catTitle = getName(cat);
              const isSelected =
                selectedCategory === catId ||
                selectedCategory.toLowerCase() === (typeof cat.name === 'string' ? cat.name.toLowerCase() : cat.name?.en?.toLowerCase());

              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setSelectedCategory(typeof cat.name === 'string' ? cat.name : cat.name?.en || catId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#205A3B] text-white shadow-xs'
                      : 'bg-[#FAF8F2] text-[#2B2B2B] hover:bg-[#F0EBDD]'
                  }`}
                >
                  {catTitle}
                </button>
              );
            })}
          </div>

          {/* Search Input Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-[#5A5A5A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#F0EBDD] p-3.5 space-y-3 animate-pulse">
                <div className="w-full aspect-4/3 bg-[#FAF8F2] rounded-xl" />
                <div className="h-4 bg-[#FAF8F2] rounded-md w-3/4" />
                <div className="h-3 bg-[#FAF8F2] rounded-md w-1/2" />
                <div className="h-8 bg-[#FAF8F2] rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-8 rounded-3xl bg-white border border-[#F0EBDD] text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('retry')}</span>
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                pricingMode={activeMode}
                onAddToCart={onAddToCart}
                onViewDetails={id => onNavigate(`/products/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state per requirement 30 */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="rounded-3xl bg-white border border-[#F0EBDD] p-10 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#16402A] font-heading">
                {searchQuery ? t('noProductsFound') : t('noProductsCategory')}
              </h3>
              <p className="text-xs text-[#5A5A5A] mt-1 max-w-sm mx-auto">
                {isTamil
                  ? 'தேடல் சொற்களை மாற்றவும் அல்லது அனைத்து தயாரிப்புகளையும் காண வகைகளை அழிக்கவும்.'
                  : 'Try adjusting your search terms or select "All Products" to browse available provisions.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                {isTamil ? 'அனைத்து பொருட்களையும் காண்க' : 'Show All Products'}
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Products;
