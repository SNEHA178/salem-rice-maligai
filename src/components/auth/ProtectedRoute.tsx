import React from 'react';
import { ProtectedRoute as ProtectedRouteJsx } from './ProtectedRoute.jsx';
import { UserRole } from '../../types';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  onNavigate?: (path: string) => void;
  currentPath?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  return <ProtectedRouteJsx {...(props as any)} />;
};

export default ProtectedRoute;
