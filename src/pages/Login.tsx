import React from 'react';
import { Login as LoginJsx } from './Login.jsx';

export interface LoginPageProps {
  onNavigate?: (path: string) => void;
  redirectUrl?: string;
}

export const Login: React.FC<LoginPageProps> = (props) => {
  return <LoginJsx {...props} />;
};

export default Login;
