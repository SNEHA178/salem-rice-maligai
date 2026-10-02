import React from 'react';
import {
  PricingProvider as PricingProviderJs,
  usePricing as usePricingJs,
  normalizePricingMode as normalizePricingModeJs,
} from './PricingContext.jsx';

export type PricingModeType = 'retail' | 'wholesale';

export interface PricingContextType {
  pricingMode: PricingModeType;
  setPricingMode: (mode: PricingModeType | string) => void;
  getPricingMode: () => PricingModeType;
  togglePricingMode: () => void;
  getProductPrice: (product: any) => number;
  isWholesale: boolean;
  isRetail: boolean;
}

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PricingProviderJs>{children}</PricingProviderJs>;
};

export const usePricing = (): PricingContextType => {
  return usePricingJs();
};

export const normalizePricingMode = (mode: string): PricingModeType => {
  return normalizePricingModeJs(mode);
};

export default PricingProvider;
