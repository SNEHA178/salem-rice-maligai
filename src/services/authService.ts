import { api } from './api';
import { User } from '../types';

export const authService = {
  login: async (credentials: { identifier?: string; email?: string; phone?: string; password: string }) => {
    const res = await api.login(credentials);
    if (res && res.token) {
      localStorage.setItem('salem_rice_token', res.token);
    }
    return res;
  },

  register: async (userData: { name: string; email: string; phone: string; password: string; address?: string }) => {
    const res = await api.register(userData);
    if (res && res.token) {
      localStorage.setItem('salem_rice_token', res.token);
    }
    return res;
  },

  getMe: () => api.getMe(),

  logout: async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem('salem_rice_token');
    }
  },
};

export default authService;
