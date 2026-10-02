import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({
  variant = 'compact', // 'compact', 'buttons', 'full'
  className = '',
}) => {
  const { language, setLanguage, isTamil, isEnglish } = useLanguage();

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-semibold text-[#16402A] block">
          {language === 'ta' ? 'மொழித் தேர்வு (Language)' : 'Language Preference'}
        </label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select language">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isEnglish
                ? 'bg-[#205A3B] text-white border-[#205A3B] shadow-xs'
                : 'bg-[#FAF8F2] text-[#2B2B2B] border-[#F0EBDD] hover:border-[#205A3B]'
            }`}
            aria-pressed={isEnglish}
          >
            <span>English</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold font-tamil transition cursor-pointer ${
              isTamil
                ? 'bg-[#205A3B] text-white border-[#205A3B] shadow-xs'
                : 'bg-[#FAF8F2] text-[#2B2B2B] border-[#F0EBDD] hover:border-[#205A3B]'
            }`}
            aria-pressed={isTamil}
          >
            <span>தமிழ் (Tamil)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-[#FAF8F2] border border-[#F0EBDD] p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Select language"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs ${
          isEnglish
            ? 'bg-[#205A3B] text-white shadow-xs font-bold'
            : 'text-[#5A5A5A] hover:text-[#16402A]'
        }`}
        aria-pressed={isEnglish}
        title="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-300 text-[10px] px-0.5">|</span>
      <button
        type="button"
        onClick={() => setLanguage('ta')}
        className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs font-tamil ${
          isTamil
            ? 'bg-[#205A3B] text-white shadow-xs font-bold'
            : 'text-[#5A5A5A] hover:text-[#16402A]'
        }`}
        aria-pressed={isTamil}
        title="தமிழுக்கு மாறவும்"
      >
        தமிழ்
      </button>
    </div>
  );
};

export default LanguageSelector;
