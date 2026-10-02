import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Check, ShieldCheck, Truck } from 'lucide-react';
import { RetailWholesaleToggle } from '../common/RetailWholesaleToggle';
import { Product, PricingMode } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  pricingMode: PricingMode;
  setPricingMode: (mode: PricingMode) => void;
  onAddToCart: (product: Product, mode: PricingMode, quantity: number) => void;
  isAdded: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  pricingMode,
  setPricingMode,
  onAddToCart,
  isAdded,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWholesale = pricingMode === 'WHOLESALE';
  const unitPrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const totalPrice = unitPrice * quantity;
  const savingsPerUnit = product.retailPrice - product.wholesalePrice;
  const totalSavings = savingsPerUnit * quantity;

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#F0EBDD] bg-[#FAF8F2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#205A3B] bg-[#205A3B]/10 px-2.5 py-1 rounded-md">
            {product.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* Product Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF8F2] border border-[#F0EBDD] shadow-xs">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isWholesale && savingsPerUnit > 0 && (
              <div className="absolute top-3 left-3 bg-[#CFA13A] text-[#16402A] px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
                Save ₹{savingsPerUnit} Wholesale
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md font-semibold backdrop-blur-xs">
              Sold per {product.unit}
            </div>
          </div>

          {/* Product Details & Controls */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#16402A] font-heading leading-tight">
                {product.name}
              </h3>
              {product.tamilName && (
                <p className="font-tamil text-sm text-[#205A3B] font-semibold mt-1">
                  {product.tamilName}
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Pricing Mode Selector (Requirement #7) */}
            <div className="p-3 bg-[#FAF8F2] rounded-2xl border border-[#F0EBDD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16402A]">Select Pricing:</span>
                <RetailWholesaleToggle
                  mode={pricingMode}
                  onChange={setPricingMode}
                  size="sm"
                  retailPrice={product.retailPrice}
                  wholesalePrice={product.wholesalePrice}
                />
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-[#F0EBDD]/60">
                <div>
                  <span className="text-2xl font-black text-[#16402A]">
                    ₹{unitPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  <span>Retail: ₹{product.retailPrice}</span>
                  <span className="mx-1">•</span>
                  <span>Wholesale: ₹{product.wholesalePrice}</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-[#16402A]">Quantity ({product.unit}s):</span>
              <div className="inline-flex items-center rounded-xl bg-[#F0EBDD] p-1 border border-[#CFA13A]/30">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-[#16402A] flex items-center justify-center hover:bg-gray-100 transition shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-[#16402A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-[#16402A] flex items-center justify-center hover:bg-gray-100 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0EBDD]">
              <div>
                <span className="text-xs text-gray-500">Total Price:</span>
                <p className="text-xl font-extrabold text-[#16402A]">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </p>
                {isWholesale && totalSavings > 0 && (
                  <p className="text-[11px] font-bold text-emerald-700">
                    You save ₹{totalSavings} with wholesale rates!
                  </p>
                )}
              </div>

              <div className="text-right text-[11px] text-gray-500">
                <p>Status: <span className="font-bold text-emerald-700">Available</span></p>
                <p>Stock: {product.stock} {product.unit}s</p>
              </div>
            </div>

            {/* Add to Cart Action */}
            <button
              onClick={() => {
                onAddToCart(product, pricingMode, quantity);
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                isAdded
                  ? 'bg-[#16402A] text-white'
                  : 'bg-[#205A3B] hover:bg-[#16402A] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-[#DFBA5C]" />
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#DFBA5C]" />
                  <span>Add {quantity} {product.unit} to Cart</span>
                </>
              )}
            </button>

            {/* Trust cues */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#205A3B]" />
                <span>Salem City Quick Dispatch</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#205A3B]" />
                <span>Mill Quality Inspected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
