import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const CategoryCard = ({
  id,
  name,
  nameTamil,
  tamilName,
  image,
  itemCount,
  isSelected = false,
  onClick,
}) => {
  const { isTamil, getName, t } = useLanguage();

  const taName = nameTamil || tamilName || (typeof name === 'object' ? name.ta : '');
  const enName = typeof name === 'object' ? name.en : name;

  const displayName = isTamil ? (taName || enName) : (enName || taName);
  const secondaryName = isTamil ? (enName !== displayName ? enName : '') : (taName !== displayName ? taName : '');

  return (
    <div
      onClick={() => onClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(id);
        }
      }}
      className={`group relative rounded-2xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center outline-hidden ${
        isSelected
          ? 'bg-white border-[#205A3B] ring-2 ring-[#205A3B]/20 shadow-md'
          : 'bg-white border-[#F0EBDD] hover:border-[#CFA13A]/80 hover:shadow-md'
      }`}
    >
      {/* Category Image Box */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FAF8F2] overflow-hidden p-1.5 border border-[#F0EBDD] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-200 shrink-0">
        <img
          src={image}
          alt={typeof displayName === 'string' ? displayName : 'Category'}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Primary Category Name in Active Language */}
      <h4 className="font-bold text-xs sm:text-sm text-[#16402A] font-heading group-hover:text-[#205A3B] transition leading-snug line-clamp-1">
        {displayName}
      </h4>

      {/* Secondary Subtitle */}
      {secondaryName && (
        <p className={`text-[10px] sm:text-[11px] text-[#2D7A50] mt-0.5 line-clamp-1 ${isTamil ? '' : 'font-tamil'}`}>
          {secondaryName}
        </p>
      )}

      {/* Item Count if available */}
      {itemCount !== undefined && (
        <span className="text-[10px] text-[#5A5A5A] mt-1 bg-[#FAF8F2] px-2 py-0.5 rounded-full border border-[#F0EBDD]">
          {itemCount} {t('items')}
        </span>
      )}
    </div>
  );
};

export default CategoryCard;
