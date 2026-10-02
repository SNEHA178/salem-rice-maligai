import React from 'react';
import { Products as ProductsJsx } from './Products.jsx';
import { PricingMode } from '../types';

export interface ProductsProps {
  onNavigate?: (path: string) => void;
  pricingMode?: 'RETAIL' | 'WHOLESALE' | 'retail' | 'wholesale' | PricingMode;
  onAddToCart?: (product?: any, quantity?: number, mode?: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const Products: React.FC<ProductsProps> = (props) => {
  return <ProductsJsx {...props} />;
};

export default Products;
