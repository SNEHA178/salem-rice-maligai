import React from 'react';
import { Header as HeaderJsx } from './Header.jsx';

export interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  cartCount?: number;
  user?: any;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  pricingMode?: 'RETAIL' | 'WHOLESALE' | 'retail' | 'wholesale' | string;
  onTogglePricingMode?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <HeaderJsx {...props} />;
};

export default Header;
