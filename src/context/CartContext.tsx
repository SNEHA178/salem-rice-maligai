import React from 'react';
import {
  CartProvider as CartProviderJs,
  useCart as useCartJs,
  getCartItemId as getCartItemIdJs,
} from './CartContext.jsx';
import { PricingMode } from '../types';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  name?: string;
  nameTamil?: string;
  image: string;
  unit: string;
  category?: string;
  pricingMode: 'retail' | 'wholesale' | PricingMode;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  available?: boolean;
  wholesaleMinimumQuantity?: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantityOrMode?: number | string, optionalMode?: string) => boolean;
  removeFromCart: (productIdOrCartItemId: string, pricingMode?: string) => void;
  updateQuantity: (productIdOrCartItemId: string, pricingModeOrQty?: string | number, maybeQty?: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: (ignoredPricingMode?: any) => number;
  getCartItems: () => CartItem[];
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CartProviderJs>{children}</CartProviderJs>;
};

export const useCart = (): CartContextType => {
  return useCartJs();
};

export const getCartItemId = (productId: string, pricingMode: string): string => {
  return getCartItemIdJs(productId, pricingMode);
};

export default CartProvider;
