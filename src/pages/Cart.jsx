import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ProductImage } from '../components/common/ProductImage';
import { PricingModeSelector } from '../components/pricing/PricingModeSelector';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { formatPrice } from '../utils/formatPrice';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const Cart = ({
  onNavigate = () => {},
}) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();

  const { pricingMode } = usePricing();

  // Subtotal is strictly calculated using the saved unitPrice of each cart item
  const subtotal = getCartTotal();

  // Architecture ready for future delivery charges: currently 0 (no invented fees)
  const deliveryCharge = 0; 
  const total = subtotal + deliveryCharge;

  // Check if any wholesale item has quantity below wholesaleMinimumQuantity
  const wholesaleViolations = cartItems.filter(item => {
    const isWholesale = String(item.pricingMode || '').toLowerCase() === 'wholesale';
    if (!isWholesale) return false;
    const minQty = Number(item.wholesaleMinimumQuantity || item.product?.wholesaleMinimumQuantity || 4);
    return (Number(item.quantity) || 1) < minQty;
  });

  return (
    <div className="w-full py-6 sm:py-10">
      <PageContainer variant="default">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer mb-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading tracking-tight">
              Shopping Cart
            </h1>
          </div>

          {/* Pricing Mode Selector & Clear Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#F0EBDD] shadow-2xs">
              <span className="text-xs font-semibold text-[#5A5A5A] hidden sm:inline">
                Mode:
              </span>
              <PricingModeSelector size="sm" />
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#F0EBDD] p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-20 h-20 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <ShoppingBag className="w-10 h-10 stroke-1" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#16402A] font-heading">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A5A] max-w-md mx-auto leading-relaxed">
              You have not added any rice varieties or grocery provisions to your cart yet. Explore our fresh direct-mill harvest to begin.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-semibold text-sm transition cursor-pointer shadow-md active:scale-95"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Cart with Items Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Cart Items List (8 cols on lg) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#F0EBDD] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBDD] text-xs text-[#5A5A5A] font-medium">
                <span>Items in Cart ({cartItems.length})</span>
                <span className="text-[#16402A]">
                  Active Store Mode: <strong className="capitalize font-bold">{pricingMode}</strong>
                </span>
              </div>

              {/* Notice that mode switch doesn't alter locked prices */}
              <div className="text-[11px] text-[#5A5A5A] bg-[#FAF8F2] p-2.5 rounded-xl border border-[#F0EBDD] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#CFA13A] shrink-0" />
                <span>
                  Each item preserves its locked pricing mode (Retail or Wholesale) from when it was added.
                </span>
              </div>

              <div className="divide-y divide-[#F0EBDD]">
                {cartItems.map(item => {
                  const itemMode = String(item.pricingMode || 'retail').toLowerCase();
                  const isWholesaleItem = itemMode === 'wholesale';
                  const minWholesale = Number(item.wholesaleMinimumQuantity || item.product?.wholesaleMinimumQuantity || 4);
                  const itemUnitPrice = Number(item.unitPrice) || 0;
                  const itemQuantity = Number(item.quantity) || 1;
                  const itemSubtotal = itemUnitPrice * itemQuantity;
                  const isBelowWholesaleMin = isWholesaleItem && itemQuantity < minWholesale;

                  return (
                    <div
                      key={item.id}
                      className="py-4 first:pt-2 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#F0EBDD] bg-[#FAF8F2] shrink-0">
                          <ProductImage
                            src={item.image}
                            alt={item.productName || item.name}
                            aspectRatio="aspect-square"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Product Name */}
                          <button
                            type="button"
                            onClick={() => onNavigate(`/products/${item.productId}`)}
                            className="font-bold text-sm sm:text-base text-[#16402A] hover:text-[#205A3B] transition text-left line-clamp-1 cursor-pointer font-heading"
                          >
                            {item.productName || item.name}
                          </button>

                          {item.nameTamil && (
                            <p className="font-tamil text-xs text-[#2D7A50] truncate">
                              {item.nameTamil}
                            </p>
                          )}

                          {/* Pricing Mode Badge & Unit */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                isWholesaleItem
                                  ? 'bg-[#CFA13A]/20 text-[#16402A] border border-[#CFA13A]/40'
                                  : 'bg-[#205A3B]/10 text-[#205A3B] border border-[#205A3B]/20'
                              }`}
                            >
                              {isWholesaleItem ? `Wholesale (Min: ${minWholesale})` : 'Retail'}
                            </span>

                            <span className="text-xs text-[#5A5A5A]">
                              Unit: <strong className="text-[#2B2B2B]">{item.unit}</strong>
                            </span>
                          </div>

                          {/* Unit Price */}
                          <div className="text-xs text-[#5A5A5A] mt-1">
                            Unit Price:{' '}
                            <span className="font-bold text-[#16402A]">
                              {formatPrice(itemUnitPrice)}
                            </span>
                            <span className="text-[11px] text-[#5A5A5A]"> / {item.unit}</span>
                          </div>

                          {/* Wholesale Minimum Warning */}
                          {isBelowWholesaleMin && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Wholesale quantity must be at least {minWholesale}.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EBDD]/60">
                        {/* Quantity Selector: [-] qty [+] */}
                        <div className="flex items-center border border-[#F0EBDD] rounded-xl bg-[#FAF8F2] p-0.5">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.productName || item.name}`}
                            disabled={isWholesaleItem && itemQuantity <= minWholesale}
                            onClick={() => {
                              if (isWholesaleItem && itemQuantity <= minWholesale) return;
                              updateQuantity(item.id, itemQuantity - 1);
                            }}
                            className={`w-7 h-7 rounded-lg bg-white border border-[#F0EBDD] text-[#16402A] flex items-center justify-center hover:bg-[#F0EBDD] cursor-pointer ${
                              isWholesaleItem && itemQuantity <= minWholesale ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            title={isWholesaleItem && itemQuantity <= minWholesale ? `Wholesale quantity must be at least ${minWholesale}.` : undefined}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#16402A]">
                            {itemQuantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.productName || item.name}`}
                            onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-[#F0EBDD] text-[#16402A] flex items-center justify-center hover:bg-[#F0EBDD] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-[10px] text-[#5A5A5A] block">Subtotal</span>
                          <span className="text-sm sm:text-base font-extrabold text-[#16402A] font-heading">
                            {formatPrice(itemSubtotal)}
                          </span>
                        </div>

                        {/* Remove Item Button */}
                        <button
                          type="button"
                          aria-label={`Remove ${item.productName || item.name} from cart`}
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Summary Card (4 cols on lg) - Requirement 21 */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#F0EBDD] p-5 sm:p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-extrabold text-[#16402A] font-heading border-b border-[#F0EBDD] pb-3">
                Cart Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                {/* Subtotal */}
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2B2B2B]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-[#F0EBDD] flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-[#16402A]">Total</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {wholesaleViolations.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Wholesale quantity must be at least{' '}
                      {Number(
                        wholesaleViolations[0].wholesaleMinimumQuantity ||
                        wholesaleViolations[0].product?.wholesaleMinimumQuantity ||
                        4
                      )}. Please increase quantity before checkout.
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={wholesaleViolations.length > 0}
                  onClick={() => {
                    if (wholesaleViolations.length > 0) return;
                    onNavigate('/checkout');
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                    wholesaleViolations.length > 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                      : 'bg-[#205A3B] hover:bg-[#16402A] text-white cursor-pointer active:scale-98'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#F0EBDD] text-[#205A3B] hover:bg-[#FAF8F2] text-xs font-semibold transition cursor-pointer text-center block"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Quality & Security Promise */}
              <div className="pt-3 border-t border-[#F0EBDD] space-y-1.5 text-[11px] text-[#5A5A5A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#205A3B] shrink-0" />
                  <span>Direct mill procurement, genuine weight verification</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Cart;
