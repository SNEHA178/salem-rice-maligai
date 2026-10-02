import { formatPrice as formatPriceJs } from './formatPrice.js';

export function formatPrice(amount: number | string | undefined | null): string {
  return formatPriceJs(amount);
}

export default formatPrice;
