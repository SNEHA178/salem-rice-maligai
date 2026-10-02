import React, { useState } from 'react';
import { ShoppingBag, Check, ArrowLeft, Filter, Search } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { RetailWholesaleToggle } from '../common/RetailWholesaleToggle';
import { Category, Product, PricingMode } from '../../types';

interface CategoryPageProps {
  categories: Category[];
  products: Product[];
  selectedCategoryName: string;
  onSelectCategory: (name: string) => void;
  pricingMode: PricingMode;
  setPricingMode: (mode: PricingMode) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, mode: PricingMode, quantity?: number) => void;
  addedProductIds: { [id: string]: boolean };
  onBackToHome: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categories,
  products,
  selectedCategoryName,
  onSelectCategory,
  pricingMode,
  setPricingMode,
  onSelectProduct,
  onAddToCart,
  addedProductIds,
  onBackToHome,
}) => {
  const [internalSearch, setInternalSearch] = useState('');

  const activeCategories = categories.filter(c => c.active);
  const currentCategory = categories.find(
    c => c.name.toLowerCase() === selectedCategoryName.toLowerCase()
  ) || activeCategories[0];

  // Filter products by category and optional local search
  const categoryProducts = products.filter(p => {
    const matchesCategory =
      !selectedCategoryName ||
      p.category.toLowerCase() === (currentCategory ? currentCategory.name.toLowerCase() : '');
    const matchesSearch =
      !internalSearch ||
      p.name.toLowerCase().includes(internalSearch.toLowerCase()) ||
      (p.tamilName && p.tamilName.toLowerCase().includes(internalSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageContainer className="py-6 space-y-6">
      {/* Category Header Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={onBackToHome}
          className="hover:text-[#205A3B] transition flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <span>/</span>
        <span className="text-[#16402A] font-bold">Categories</span>
        {currentCategory && (
          <>
            <span>/</span>
            <span className="text-[#205A3B] font-bold">{currentCategory.name}</span>
          </>
        )}
      </div>

      {/* Horizontal Category Pill Selector (Requirement #19: dynamic categories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeCategories.map(cat => {
          const isSelected =
            currentCategory && currentCategory.name.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat._id}
              onClick={() => {
                onSelectCategory(cat.name);
                setInternalSearch('');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#205A3B] text-white shadow-sm'
                  : 'bg-white text-[#2B2B2B] hover:bg-[#F0EBDD] border border-[#F0EBDD]'
              }`}
            >
              <span>{cat.name}</span>
              {cat.tamilName && (
                <span className="font-tamil ml-1 opacity-80 text-[11px]">
                  ({cat.tamilName})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Banner Card */}
      {currentCategory && (
        <div className="relative rounded-2xl overflow-hidden bg-[#16402A] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#CFA13A]/30">
          <div className="max-w-xl z-10">
            <span className="text-xs uppercase tracking-widest text-[#DFBA5C] font-bold">
              Category Collection
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold font-heading mt-1 text-white">
              {currentCategory.name}
            </h2>
            {currentCategory.tamilName && (
              <p className="font-tamil text-sm sm:text-base text-[#DFBA5C] font-medium mt-1">
                {currentCategory.tamilName}
              </p>
            )}
            <p className="text-xs sm:text-sm text-gray-200 mt-2 leading-relaxed">
              {currentCategory.description ||
                'Direct mill-quality products selected and processed under traditional standards in Salem.'}
            </p>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border-2 border-[#CFA13A]/50 shadow-lg">
            <img
              src={currentCategory.image}
              alt={currentCategory.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Filter and Pricing Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#F0EBDD]">
        {/* Local Search within category */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search within ${currentCategory?.name || 'category'}...`}
            value={internalSearch}
            onChange={e => setInternalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] outline-hidden"
          />
        </div>

        {/* Global Pricing Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-gray-500 font-medium">Pricing Mode:</span>
          <RetailWholesaleToggle
            mode={pricingMode}
            onChange={setPricingMode}
            size="sm"
          />
        </div>
      </div>

      {/* Product Grid (Requirement #9: 2 cols mobile, 2-3 tablet, 3-4 laptop, 4 desktop) */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categoryProducts.map(product => {
            const isWholesale = pricingMode === 'WHOLESALE';
            const price = isWholesale ? product.wholesalePrice : product.retailPrice;
            const savings = product.retailPrice - product.wholesalePrice;
            const isAdded = addedProductIds[product._id];

            return (
              <div
                key={product._id}
                className="group flex flex-col rounded-2xl bg-white border border-[#F0EBDD] hover:border-[#205A3B]/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-4/3 w-full bg-[#FAF8F2] overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {isWholesale && savings > 0 && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#CFA13A] text-[#16402A] shadow-xs">
                      Save ₹{savings}
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    per {product.unit}
                  </span>
                </div>

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
                    </div>

                    <button
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
                          <span>Added</span>
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
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#F0EBDD]">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#16402A]">No products found</h4>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search query or selecting another category.
          </p>
        </div>
      )}
    </PageContainer>
  );
};
