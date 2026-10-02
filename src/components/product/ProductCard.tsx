import React from 'react';
import { ProductCard as ProductCardJsx } from './ProductCard.jsx';
import { PricingMode } from '../../types';

export interface ProductCardProps {
  id?: string;
  product?: any;
  name?: string;
  nameTamil?: string;
  image?: string;
  unit?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  pricingMode?: 'retail' | 'wholesale' | 'RETAIL' | 'WHOLESALE' | PricingMode;
  available?: boolean;
  inStock?: boolean;
  stockCount?: number;
  category?: string;
  onAddToCart?: (product?: any, quantity?: number, mode?: string) => void;
  onViewDetails?: (id?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = (props) => {
  return <ProductCardJsx {...props} />;
};

export default ProductCard;
