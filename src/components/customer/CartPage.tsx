import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { CartItem, PricingMode } from '../../types';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, mode: PricingMode, quantity: number) => void;
  onRemoveItem: (productId: string, mode: PricingMode) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice =
      item.pricingMode === 'WHOLESALE' ? item.product.wholesalePrice : item.product.retailPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  // Free delivery on orders over ₹1,000 or wholesale rice orders
  const deliveryFee = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <PageContainer className="py-12 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center mx-auto mb-4 border border-[#F0EBDD]">
            <ShoppingBag className="w-8 h-8 text-[#CFA13A]" />
          </div>
          <h3 className="text-xl font-bold text-[#16402A] font-heading">
            Your Shopping Cart is Empty
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-6">
            Explore authentic Salem Ponni rice, wood-pressed oils, and fresh groceries at Retail or Wholesale prices.
          </p>
          <button
            onClick={onContinueShopping}
            className="w-full py-3 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-sm transition shadow-sm cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h2>
          <p className="text-xs text-gray-500">
            Review your selected products and pricing modes
          </p>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => {
            const isWholesale = item.pricingMode === 'WHOLESALE';
            const unitPrice = isWholesale
              ? item.product.wholesalePrice
              : item.product.retailPrice;
            const lineSubtotal = unitPrice * item.quantity;
            const savings = item.product.retailPrice - item.product.wholesalePrice;

            return (
              <div
                key={`${item.productId}-${item.pricingMode}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white border border-[#F0EBDD] hover:border-[#CFA13A]/50 transition gap-4"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F2] shrink-0 border border-[#F0EBDD]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#16402A] truncate">
                      {item.product.name}
                    </h4>
                    {item.product.tamilName && (
                      <p className="font-tamil text-xs text-gray-500 truncate">
                        {item.product.tamilName}
                      </p>
                    )}

                    {/* Pricing Mode Badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isWholesale
                            ? 'bg-[#CFA13A] text-[#16402A]'
                            : 'bg-[#205A3B] text-white'
                        }`}
                      >
                        {item.pricingMode} MODE
                      </span>
                      <span className="text-xs font-semibold text-[#16402A]">
                        ₹{unitPrice.toLocaleString('en-IN')}/{item.product.unit}
                      </span>
                      {isWholesale && savings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700">
                          (Saved ₹{savings * item.quantity})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Subtotal */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0EBDD]">
                  {/* Quantity Stepper */}
                  <div className="inline-flex items-center rounded-xl bg-[#F0EBDD] p-1 border border-[#CFA13A]/30">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.productId,
                          item.pricingMode,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-white text-[#16402A] flex items-center justify-center hover:bg-gray-100 transition shadow-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-[#16402A]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.productId, item.pricingMode, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white text-[#16402A] flex items-center justify-center hover:bg-gray-100 transition shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-base font-extrabold text-[#16402A]">
                      ₹{lineSubtotal.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {item.quantity} x ₹{unitPrice}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.productId, item.pricingMode)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              onClick={onContinueShopping}
              className="text-xs sm:text-sm font-bold text-[#205A3B] hover:text-[#16402A] transition cursor-pointer"
            >
              &larr; Add more products from catalog
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#16402A] font-heading pb-3 border-b border-[#F0EBDD]">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-[#2B2B2B]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className="font-bold">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            {deliveryFee > 0 && (
              <p className="text-[11px] text-[#205A3B] bg-[#FAF8F2] p-2 rounded-lg">
                Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more to unlock Free Salem Delivery!
              </p>
            )}

            <div className="pt-3 border-t border-[#F0EBDD] flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#16402A]">Total Amount</span>
              <span className="text-2xl font-black text-[#16402A]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            id="proceed-to-checkout-btn"
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-[#DFBA5C]" />
          </button>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-[#205A3B]" />
            <span>Pay on Delivery (Cash or UPI Scan)</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
