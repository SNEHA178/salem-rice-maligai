import React from 'react';
import { ProductDetails as ProductDetailsJsx } from './ProductDetails.jsx';
import { PricingMode } from '../types';

export interface ProductDetailsProps {
  productId: string;
  onNavigate?: (path: string) => void;
  pricingMode?: PricingMode | 'retail' | 'wholesale' | 'RETAIL' | 'WHOLESALE';
  onAddToCart?: (product: any, quantity?: number, mode?: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = (props) => {
  return <ProductDetailsJsx {...props} />;
};

export default ProductDetails;
