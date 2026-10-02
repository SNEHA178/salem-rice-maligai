import React from 'react';
import { AuthProvider as AuthProviderJsx, useAuth as useAuthJsx } from './AuthContext.jsx';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (formData: {
    name: string;
    phone: string;
    email: string;
    password: string;
    address?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderJsx>{children}</AuthProviderJsx>;
};

export const useAuth = (): AuthContextType => {
  return useAuthJsx();
};

export default AuthProvider;
