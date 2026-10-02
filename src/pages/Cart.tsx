import React from 'react';
import { Cart as CartJsx } from './Cart.jsx';

export interface CartProps {
  onNavigate?: (path: string) => void;
  pricingMode?: string;
}

export const Cart: React.FC<CartProps> = (props) => {
  return <CartJsx {...props} />;
};

export default Cart;
