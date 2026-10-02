import React from 'react';
import { CategoryCard as CategoryCardJsx } from './CategoryCard.jsx';

export interface CategoryCardProps {
  id: string;
  name: string;
  nameTamil?: string;
  image: string;
  itemCount?: number;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = (props) => {
  return <CategoryCardJsx {...props} />;
};

export default CategoryCard;
