import React from 'react';
import { Categories as CategoriesJsx } from './Categories.jsx';

export interface CategoriesProps {
  onNavigate?: (path: string) => void;
}

export const Categories: React.FC<CategoriesProps> = (props) => {
  return <CategoriesJsx {...props} />;
};

export default Categories;
