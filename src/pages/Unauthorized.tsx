import React from 'react';
import { Unauthorized as UnauthorizedJsx } from './Unauthorized.jsx';

export interface UnauthorizedProps {
  onNavigate?: (path: string) => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = (props) => {
  return <UnauthorizedJsx {...props} />;
};

export default Unauthorized;
