import React from 'react';
import { Home as HomeJsx } from './Home.jsx';

export interface HomeProps {
  onNavigate?: (path: string) => void;
  pricingMode?: 'RETAIL' | 'WHOLESALE' | 'retail' | 'wholesale' | string;
  onTogglePricingMode?: () => void;
  onAddToCart?: (productOrId?: any) => void;
}

export const Home: React.FC<HomeProps> = (props) => {
  return <HomeJsx {...props} />;
};

export default Home;
