/**
 * Calculate product price according to pricing mode
 * 
 * @param {Object} product - Product record containing retailPrice & wholesalePrice
 * @param {string} pricingMode - 'retail' | 'wholesale' (case-insensitive)
 * @returns {number} The resolved unit price
 */
export function getProductPrice(product, pricingMode = 'retail') {
  if (!product) return 0;

  const mode = String(pricingMode || 'retail').trim().toLowerCase();

  if (mode === 'wholesale') {
    if (product.wholesalePrice !== undefined && product.wholesalePrice !== null) {
      return Number(product.wholesalePrice);
    }
  }

  return Number(product.retailPrice || 0);
}

export function getWholesaleSavings(product) {
  if (!product) return { amount: 0, percent: 0, diff: 0 };
  const retail = Number(product.retailPrice || 0);
  const wholesale = Number(product.wholesalePrice !== undefined && product.wholesalePrice !== null ? product.wholesalePrice : retail);
  const diff = retail - wholesale;
  const amount = diff > 0 ? diff : 0;
  const percent = retail > 0 && amount > 0 ? Math.round((amount / retail) * 100) : 0;
  return { amount, percent, diff: amount };
}

export default getProductPrice;
