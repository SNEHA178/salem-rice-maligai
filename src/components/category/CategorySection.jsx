import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { CategoryCard } from './CategoryCard';
import { getCategories } from '../../services/categoryService';
import { ArrowRight } from 'lucide-react';

export const CategorySection = ({
  onSelectCategory = () => {},
  onViewAllCategories = () => {},
  selectedCategoryId = null,
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCategories().then(data => {
      if (isMounted) {
        setCategories(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section aria-label="Shop by Category" className="w-full">
      <PageContainer>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-[#CFA13A] uppercase tracking-wider block font-heading">
              STORE DEPARTMENTS
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#16402A] font-heading tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A5A] mt-0.5">
              Find your everyday essentials directly from Salem mills
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAllCategories}
            className="text-xs sm:text-sm font-semibold text-[#205A3B] hover:text-[#16402A] flex items-center gap-1 cursor-pointer transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Grid (2 col mobile, 3-4 col tablet, 6 col desktop) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-white border border-[#F0EBDD] p-4 flex flex-col items-center justify-center animate-pulse"
              >
                <div className="w-16 h-16 rounded-xl bg-[#F0EBDD]/60 mb-2" />
                <div className="w-16 h-3 bg-[#F0EBDD] rounded-sm mb-1" />
                <div className="w-10 h-2 bg-[#F0EBDD] rounded-sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, idx) => {
              const catId = cat.id || cat._id || `cat-${idx}`;
              return (
                <CategoryCard
                  key={catId}
                  id={catId}
                  name={cat.name}
                  nameTamil={cat.nameTamil}
                  image={cat.image}
                  itemCount={cat.itemCount}
                  isSelected={selectedCategoryId === catId}
                  onClick={id => onSelectCategory(id)}
                />
              );
            })}
          </div>
        )}
      </PageContainer>
    </section>
  );
};

export default CategorySection;
