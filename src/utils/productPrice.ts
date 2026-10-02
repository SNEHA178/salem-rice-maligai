import { getProductPrice as getProductPriceJs, getWholesaleSavings as getWholesaleSavingsJs } from './productPrice.js';

export function getProductPrice(product: any, pricingMode: string = 'retail'): number {
  return getProductPriceJs(product, pricingMode);
}

export function getWholesaleSavings(product: any): { amount: number; percent: number; diff: number } {
  return getWholesaleSavingsJs(product);
}

export default getProductPrice;
