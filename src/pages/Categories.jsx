import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { CategoryCard } from '../components/category/CategoryCard';
import { useLanguage } from '../context/LanguageContext';
import { getCategories } from '../services/categoryService';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';

export const Categories = ({
  onNavigate = () => {},
}) => {
  const { t, isTamil, getName, getDescription } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  return (
    <div className="w-full py-6 sm:py-8">
      <PageContainer>
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer mb-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('returnToStore')}</span>
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#16402A] font-heading tracking-tight">
              {t('categories')}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A5A]">
              {isTamil
                ? 'சேலம் ஆலை அரிசி, பருப்பு மற்றும் அன்றாட மளிகைப் பிரிவுகளைக் கண்டறியவும்.'
                : 'Explore our curated departments of Salem grains, pulses, and kitchen staples.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#B58A2B] bg-[#FAF8F2] px-3 py-1.5 rounded-full border border-[#F0EBDD]">
            <Sparkles className="w-3.5 h-3.5 text-[#CFA13A]" />
            <span className="font-semibold">{categories.length} {t('categories')}</span>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#F0EBDD] p-5 space-y-3 animate-pulse">
                <div className="w-20 h-20 bg-[#FAF8F2] rounded-xl mx-auto" />
                <div className="h-4 bg-[#FAF8F2] rounded-md w-1/2 mx-auto" />
                <div className="h-3 bg-[#FAF8F2] rounded-md w-3/4 mx-auto" />
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
              onClick={fetchCats}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] cursor-pointer transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('retry')}</span>
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((cat, idx) => {
              const catName = typeof cat.name === 'string' ? cat.name : cat.name?.en;
              const catId = cat._id || cat.id || `category-${idx}`;
              return (
                <CategoryCard
                  key={catId}
                  id={catId}
                  name={cat.name}
                  nameTamil={cat.tamilName || (typeof cat.name === 'object' ? cat.name.ta : '')}
                  image={cat.image}
                  onClick={() => onNavigate(`/products?category=${encodeURIComponent(catName)}`)}
                />
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Categories;
