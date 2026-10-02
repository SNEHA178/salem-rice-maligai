import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProductPrice } from '../utils/productPrice';

const CartContext = createContext(null);

const STORAGE_KEY = 'salem_cart';

/**
 * Normalizes pricing mode to lowercase 'retail' | 'wholesale'
 */
function normalizeMode(mode) {
  if (!mode) return 'retail';
  const clean = String(mode).trim().toLowerCase();
  return clean === 'wholesale' ? 'wholesale' : 'retail';
}

/**
 * Generates unique composite cart identity key: productId + pricingMode
 */
export function getCartItemId(productId, pricingMode) {
  return `${productId}_${normalizeMode(pricingMode)}`;
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ensure each item has accurate id, unitPrice, and pricingMode preserved
          return parsed.map(item => {
            const mode = normalizeMode(item.pricingMode || 'retail');
            const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : (mode === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice)) || 0;
            const quantity = Math.max(1, Number(item.quantity) || 1);
            return {
              ...item,
              id: item.id || getCartItemId(item.productId || item.id, mode),
              productId: item.productId || item.id,
              productName: item.productName || item.name || 'Salem Grain',
              name: item.productName || item.name || 'Salem Grain',
              pricingMode: mode,
              unitPrice,
              quantity,
              subtotal: unitPrice * quantity,
              product: item.product || {
                _id: item.productId || item.id,
                id: item.productId || item.id,
                name: item.productName || item.name || 'Salem Grain',
                tamilName: item.nameTamil || '',
                nameTamil: item.nameTamil || '',
                retailPrice: mode === 'retail' ? unitPrice : unitPrice * 1.05,
                wholesalePrice: mode === 'wholesale' ? unitPrice : unitPrice * 0.95,
                image: item.image || '/images/products/ponni-boiled-rice.svg',
                unit: item.unit || 'unit',
                available: true,
                category: item.category || 'rice',
                featured: false,
                stock: 50,
                description: '',
              },
            };
          });
        }
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
    }
    return [];
  });

  // Keep localStorage in sync with state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to write cart to localStorage:', err);
    }
  }, [cartItems]);

  /**
   * Add a product to the cart with locked-in unit price and pricing mode
   * Supports:
   * addToCart(product, quantity, pricingMode)
   * addToCart(product, pricingMode)
   * 
   * @param {Object} product 
   * @param {number|string} quantityOrMode 
   * @param {string} [optionalMode] 
   * @returns {boolean} true if added, false if unavailable
   */
  const addToCart = useCallback((product, quantityOrMode = 1, optionalMode) => {
    if (!product || product.available === false) {
      return false;
    }

    let quantity = 1;
    let mode = 'retail';

    if (typeof quantityOrMode === 'string') {
      mode = normalizeMode(quantityOrMode);
      quantity = 1;
    } else {
      quantity = Math.max(1, Number(quantityOrMode) || 1);
      mode = normalizeMode(optionalMode || product.pricingMode || 'retail');
    }

    // Check wholesale minimum quantity constraint
    if (mode === 'wholesale') {
      const minQty = Number(
        product.wholesaleMinimumQuantity !== undefined && product.wholesaleMinimumQuantity !== null
          ? product.wholesaleMinimumQuantity
          : 4
      );
      if (quantity < minQty) {
        quantity = minQty;
      }
    }

    const prodId = product.id || product._id || product.productId;
    const cartItemId = getCartItemId(prodId, mode);
    const unitPrice = getProductPrice(product, mode);

    setCartItems(prevItems => {
      // Find matching item by composite key (productId + pricingMode)
      const existingIndex = prevItems.findIndex(
        item => item.id === cartItemId || (item.productId === prodId && item.pricingMode === mode)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + quantity;
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          subtotal: currentItem.unitPrice * newQty,
        };
        return updated;
      }

      // New cart line item with locked-in unit price & pricing mode
      const newItem = {
        id: cartItemId,
        productId: prodId,
        productName: product.name,
        name: product.name,
        nameTamil: product.nameTamil || product.tamilName || '',
        image: product.image,
        unit: product.unit || 'unit',
        category: product.category,
        pricingMode: mode, // 'retail' | 'wholesale'
        unitPrice: unitPrice, // LOCKED IN
        quantity: quantity,
        subtotal: unitPrice * quantity,
        available: product.available !== false,
        wholesaleMinimumQuantity:
          product.wholesaleMinimumQuantity !== undefined && product.wholesaleMinimumQuantity !== null
            ? Number(product.wholesaleMinimumQuantity)
            : 4,
        product: product,
      };

      return [...prevItems, newItem];
    });

    return true;
  }, []);

  /**
   * Remove item from cart by composite productId + pricingMode OR by cartItemId
   * @param {string} productIdOrCartItemId 
   * @param {string} [pricingMode] 
   */
  const removeFromCart = useCallback((productIdOrCartItemId, pricingMode) => {
    setCartItems(prev => {
      if (pricingMode) {
        const targetId = getCartItemId(productIdOrCartItemId, pricingMode);
        const normMode = normalizeMode(pricingMode);
        return prev.filter(
          item => item.id !== targetId && !(item.productId === productIdOrCartItemId && item.pricingMode === normMode)
        );
      }
      // Single argument: could be cartItemId or productId
      return prev.filter(
        item => item.id !== productIdOrCartItemId && item.productId !== productIdOrCartItemId
      );
    });
  }, []);

  /**
   * Update quantity of an item
   * Supports:
   * updateQuantity(productId, pricingMode, newQuantity)
   * updateQuantity(cartItemId, newQuantity)
   * 
   * Minimum quantity is 1. If newQuantity <= 0, item is removed.
   */
  const updateQuantity = useCallback((productIdOrCartItemId, pricingModeOrQty, maybeQty) => {
    let targetProductId = productIdOrCartItemId;
    let targetMode = null;
    let newQty = 1;

    if (maybeQty !== undefined) {
      // 3 arguments: productId, pricingMode, newQuantity
      targetMode = normalizeMode(pricingModeOrQty);
      newQty = Number(maybeQty);
    } else {
      // 2 arguments: cartItemId, newQuantity
      newQty = Number(pricingModeOrQty);
    }

    if (newQty <= 0) {
      removeFromCart(targetProductId, targetMode);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        let isMatch = false;
        if (targetMode) {
          isMatch =
            item.id === getCartItemId(targetProductId, targetMode) ||
            (item.productId === targetProductId && item.pricingMode === targetMode);
        } else {
          isMatch = item.id === targetProductId || item.productId === targetProductId;
        }

        if (isMatch) {
          return {
            ...item,
            quantity: newQty,
            subtotal: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /**
   * Get total number of product units in cart
   * @returns {number}
   */
  const getCartCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [cartItems]);

  /**
   * Get overall cart total
   * Always calculates sum of item.unitPrice * item.quantity!
   * Never recalculates with global pricing mode!
   * @returns {number}
   */
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return total + price * qty;
    }, 0);
  }, [cartItems]);

  /**
   * Get cart items array
   * @returns {Array}
   */
  const getCartItems = useCallback(() => {
    return cartItems;
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    getCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
