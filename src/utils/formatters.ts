/**
 * Utility formatters for Salem Rice & Maligai
 */

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUnitLabel(unit: string, pricingMode: 'RETAIL' | 'WHOLESALE' = 'RETAIL'): string {
  if (pricingMode === 'WHOLESALE') {
    return `${unit} (Bulk Pack)`;
  }
  return unit;
}
