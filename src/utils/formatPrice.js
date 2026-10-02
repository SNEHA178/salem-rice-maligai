/**
 * Format numeric price to Indian Rupee (INR) currency representation
 * Example: 1450 -> ₹1,450
 * 
 * @param {number|string} amount 
 * @returns {string} Formatted Indian Rupee string
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || amount === '') {
    return '₹0';
  }
  const numeric = Number(amount);
  if (isNaN(numeric)) {
    return '₹0';
  }
  return `₹${numeric.toLocaleString('en-IN')}`;
}

export default formatPrice;
