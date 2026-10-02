import React from 'react';
import {
  LanguageProvider as LanguageProviderJsx,
  useLanguage as useLanguageJsx,
} from './LanguageContext.jsx';
import { SupportedLanguage } from '../utils/localizedText';

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  isTamil: boolean;
  isEnglish: boolean;
  t: (key: string, fallback?: string) => string;
  getText: (val: any, fallback?: string) => string;
  getName: (item: any) => string;
  getDescription: (item: any) => string;
  formatUnit: (unit: any) => string;
  formatStatus: (status: string) => string;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <LanguageProviderJsx>{children}</LanguageProviderJsx>;
};

export const useLanguage = (): LanguageContextType => {
  return useLanguageJsx();
};

export default LanguageProvider;
