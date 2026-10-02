import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildApiUrl } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'salem_rice_auth_user';
const TOKEN_KEY = 'salem_rice_token';

// Mock pre-seeded accounts for development and preview fallback
export const DEFAULT_USERS = [
  {
    id: 'user_admin_1',
    _id: 'user_admin_1',
    name: 'Store Manager (Salem Rice)',
    phone: '8973203053',
    email: 'admin@salemrice.com',
    role: 'ADMIN',
    city: 'Salem',
    address: 'Shevapet, Salem - 636002',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_cust_1',
    _id: 'user_cust_1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    email: 'customer@salemrice.com',
    role: 'CUSTOMER',
    city: 'Salem',
    address: 'Fairlands, Salem - 636016',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session from localStorage on mount (survives page refresh)
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUserStr = localStorage.getItem(STORAGE_KEY);

        let activeToken = '';
        let currentUser = null;

        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.trim()) {
          activeToken = storedToken.trim();
        }

        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            if (parsed && (parsed.role === 'ADMIN' || parsed.role === 'CUSTOMER')) {
              currentUser = parsed;
              if (!activeToken && parsed.token && parsed.token !== 'undefined' && parsed.token !== 'null') {
                activeToken = parsed.token.trim();
                localStorage.setItem(TOKEN_KEY, activeToken);
              }
            }
          } catch {}
        }

        if (activeToken && currentUser) {
          // Immediately set user for seamless persistent render on page refresh
          if (isMounted) {
            setUser({ ...currentUser, token: activeToken });
          }

          // Verify token validity with backend /api/auth/me
          try {
            const meUrl = buildApiUrl('/auth/me');
            const res = await fetch(meUrl, {
              headers: { Authorization: `Bearer ${activeToken}` },
            });

            if (res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.user && isMounted) {
                const refreshedUser = { ...data.user, token: activeToken };
                setUser(refreshedUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedUser));
              }
            } else if (res.status === 401) {
              // Token genuinely expired or invalidated by server
              if (isMounted) {
                setUser(null);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(STORAGE_KEY);
              }
            }
            // On other statuses (500, network, etc.), retain local session!
          } catch (netErr) {
            // Do NOT log out on network/connectivity issues
            console.log('[AUTH] Server offline or verifying in background, keeping stored session');
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to load auth session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Listen for genuine 401 session expiration from API calls
    const handleAuthExpired = () => {
      if (isMounted) {
        setUser(null);
      }
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  /**
   * Login with email or phone number and password via real backend JWT
   * @param {string} identifier - Email or Phone number
   * @param {string} password - User password
   * @returns {Promise<{ success: boolean, user?: Object, error?: string }>}
   */
  const login = useCallback(async (identifier, password) => {
    const cleanId = String(identifier || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter your phone/email and password.' };
    }

    try {
      const loginUrl = buildApiUrl('/auth/login');
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          email: cleanId,
          phone: cleanId,
          password: cleanPass,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.token && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        setUser(userWithToken);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
        return { success: true, user: userWithToken };
      }

      const errorMsg = data?.message || (res.status === 401 ? 'Invalid phone/email or password.' : 'Login failed. Please check your credentials.');
      return { success: false, error: errorMsg };
    } catch (networkErr) {
      console.error('[AUTH ERROR] Login request failed:', networkErr.message);
      return { success: false, error: 'Unable to connect to the server. Please check your connection and try again.' };
    }
  }, []);

  /**
   * Register a new customer account via real backend JWT
   */
  const register = useCallback(async (formData) => {
    const { name, phone, email, password } = formData || {};

    if (!name || !name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!phone || phone.trim().length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const regUrl = buildApiUrl('/auth/register');
      const res = await fetch(regUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          address: formData.address || 'Salem, Tamil Nadu',
          city: formData.city || 'Salem',
          pincode: formData.pincode || '636002',
          businessName: formData.businessName || '',
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.token && data.user) {
        const safeUser = { ...data.user, role: 'CUSTOMER', token: data.token };
        setUser(safeUser);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        return { success: true, user: safeUser };
      }

      const errorMsg = data?.message || 'Registration failed. Please check your information and try again.';
      return { success: false, error: errorMsg };
    } catch (networkErr) {
      console.error('[AUTH ERROR] Register request failed:', networkErr.message);
      return { success: false, error: 'Unable to connect to the server. Please check your connection.' };
    }
  }, []);

  /**
   * Logout user.
   * Clears auth session but PRESERVES shopping cart and pricing preferences!
   */
  const logout = useCallback(async () => {
    try {
      const logoutUrl = buildApiUrl('/auth/logout');
      const token = localStorage.getItem(TOKEN_KEY);
      await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).catch(() => {});
    } catch {}

    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Error clearing auth session:', err);
    }
  }, []);

  /**
   * Update profile details (Name, address, city)
   */
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Prevent any role escalation via profile update
    const { role: _, id: __, _id: ___, ...safeUpdates } = updates || {};
    const updatedUser = { ...user, ...safeUpdates };

    setUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {}

    return { success: true, user: updatedUser };
  }, [user]);

  const isAuthenticated = Boolean(user && user.role);
  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isCustomer = Boolean(user && user.role === 'CUSTOMER');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isCustomer,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
