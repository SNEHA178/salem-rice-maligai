import React from 'react';
import { LanguageSelector as LanguageSelectorJsx } from './LanguageSelector.jsx';

export interface LanguageSelectorProps {
  variant?: 'compact' | 'buttons' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  return <LanguageSelectorJsx {...props} />;
};

export default LanguageSelector;
