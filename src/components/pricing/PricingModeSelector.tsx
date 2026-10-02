import React from 'react';
import { PricingModeSelector as PricingModeSelectorJs } from './PricingModeSelector.jsx';

export interface PricingModeSelectorProps {
  size?: 'sm' | 'md';
  showPrices?: boolean;
  retailPrice?: number;
  wholesalePrice?: number;
  className?: string;
  onChange?: (mode: 'retail' | 'wholesale') => void;
  showLabel?: boolean;
  label?: string;
}

export const PricingModeSelector: React.FC<PricingModeSelectorProps> = (props) => {
  return <PricingModeSelectorJs {...props} />;
};

export default PricingModeSelector;
