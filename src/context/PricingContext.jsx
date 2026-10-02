import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProductPrice as getPriceHelper } from '../utils/productPrice';

const PricingContext = createContext(null);

const STORAGE_KEY = 'salem_rice_pricing_mode';

/**
 * Normalizes pricing mode strings to standard lowercase 'retail' | 'wholesale'
 * @param {string} mode 
 * @returns {'retail' | 'wholesale'}
 */
export function normalizePricingMode(mode) {
  if (!mode) return 'retail';
  const clean = String(mode).trim().toLowerCase();
  return clean === 'wholesale' ? 'wholesale' : 'retail';
}

export const PricingProvider = ({ children }) => {
  const [pricingMode, setPricingModeState] = useState(() => {
    if (typeof window === 'undefined') return 'retail';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizePricingMode(saved);
      }
    } catch (err) {
      console.error('Failed to read pricing mode from localStorage:', err);
    }
    return 'retail';
  });

  // Keep localStorage synchronized whenever pricing mode changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, pricingMode);
    } catch (err) {
      console.error('Failed to save pricing mode to localStorage:', err);
    }
  }, [pricingMode]);

  /**
   * Set global pricing mode
   * @param {string} mode - 'retail' | 'wholesale'
   */
  const setPricingMode = useCallback((mode) => {
    const normalized = normalizePricingMode(mode);
    setPricingModeState(normalized);
  }, []);

  /**
   * Get current pricing mode
   * @returns {'retail' | 'wholesale'}
   */
  const getPricingMode = useCallback(() => {
    return pricingMode;
  }, [pricingMode]);

  /**
   * Toggle between retail and wholesale
   */
  const togglePricingMode = useCallback(() => {
    setPricingModeState(prev => (prev === 'retail' ? 'wholesale' : 'retail'));
  }, []);

  /**
   * Context helper to get price for a product using active mode
   * @param {Object} product 
   * @returns {number}
   */
  const getProductPrice = useCallback((product) => {
    return getPriceHelper(product, pricingMode);
  }, [pricingMode]);

  const value = {
    pricingMode,
    setPricingMode,
    getPricingMode,
    togglePricingMode,
    getProductPrice,
    isWholesale: pricingMode === 'wholesale',
    isRetail: pricingMode === 'retail',
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

export default PricingContext;
