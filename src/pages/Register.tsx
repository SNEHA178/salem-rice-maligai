import React from 'react';
import { Register as RegisterJsx } from './Register.jsx';

export interface RegisterPageProps {
  onNavigate?: (path: string) => void;
}

export const Register: React.FC<RegisterPageProps> = (props) => {
  return <RegisterJsx {...props} />;
};

export default Register;
