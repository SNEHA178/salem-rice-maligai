import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { en } from '../locales/en';
import { ta } from '../locales/ta';
import { getLocalizedText, getLocalizedName, getLocalizedDescription, formatLocalizedUnit, formatLocalizedStatus } from '../utils/localizedText';

const STORAGE_KEY = 'salem_rice_language';

const dictionaries = {
  en,
  ta,
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ta' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to read language preference from storage:', e);
    }
    return 'en';
  });

  // Update HTML lang attribute whenever language changes for accessibility and fonts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch (e) {
      console.warn('Failed to persist language preference:', e);
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'ta') {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'ta' : 'en'));
  }, []);

  /**
   * Main translation function t(key, fallback)
   */
  const t = useCallback(
    (key, fallback = '') => {
      const dict = dictionaries[language] || dictionaries.en;
      if (dict && key in dict) {
        return dict[key];
      }
      // Fallback to English dictionary if key missing in current language
      if (dictionaries.en && key in dictionaries.en) {
        return dictionaries.en[key];
      }
      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isTamil: language === 'ta',
      isEnglish: language === 'en',
      t,
      // Helper shortcuts
      getText: (val, fallback) => getLocalizedText(val, language, fallback),
      getName: (item) => getLocalizedName(item, language),
      getDescription: (item) => getLocalizedDescription(item, language),
      formatUnit: (unit) => formatLocalizedUnit(unit, language),
      formatStatus: (status) => formatLocalizedStatus(status, language),
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
