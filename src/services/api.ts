import {
  Product,
  Category,
  Advertisement,
  Order,
  User,
  DashboardStats,
  DbStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADVERTISEMENTS,
} from '../../server/seedData';

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  // Strip out invalid or legacy localhost:5000 references
  if (envUrl && !envUrl.includes('localhost:5000') && !envUrl.includes(':5000')) {
    let clean = envUrl.replace(/\/+$/, '');
    if (!clean.endsWith('/api') && !clean.includes('/api/')) {
      clean = `${clean}/api`;
    }
    return clean;
  }
  // Default relative /api endpoint served on current host (port 3000)
  return '/api';
}

export const API_BASE = getApiBaseUrl();

export function buildApiUrl(endpoint: string): string {
  // If legacy or external call points to localhost:5000, sanitize it to /api
  if (endpoint.includes('localhost:5000')) {
    endpoint = endpoint.replace(/^https?:\/\/localhost:5000(\/api)?/, '/api');
  }
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/') || cleanEndpoint === '/api') {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
  }
  return `${base}${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`;
}

export function getAuthToken(): string | null {
  try {
    const directToken = localStorage.getItem('salem_rice_token');
    if (directToken && directToken !== 'undefined' && directToken !== 'null' && directToken.trim() !== '') {
      return directToken.trim();
    }

    const storedUser = localStorage.getItem('salem_rice_auth_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.token && typeof parsed.token === 'string' && parsed.token !== 'undefined' && parsed.token !== 'null' && parsed.token.trim() !== '') {
        return parsed.token.trim();
      }
    }
  } catch {}
  return null;
}

export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function formatApiErrorMessage(status: number | null, rawMessage?: string, isNetworkError: boolean = false): string {
  if (isNetworkError) {
    return 'Unable to connect to the server.';
  }
  if (status === 401) {
    return 'Your session has expired. Please login again.';
  }
  if (status === 403) {
    return "You don't have permission to perform this action.";
  }
  if (status === 400 || status === 422) {
    if (rawMessage && !rawMessage.startsWith('HTTP 400') && !rawMessage.startsWith('HTTP 422')) {
      return rawMessage;
    }
    return 'Invalid request information. Please verify and try again.';
  }
  if (status === 404) {
    return rawMessage || 'The requested resource was not found.';
  }
  if (status === 409) {
    return rawMessage || 'A conflict occurred. The item may already exist.';
  }
  if (status && status >= 500) {
    return 'Server error. Please try again.';
  }
  return rawMessage || 'An unexpected error occurred. Please try again.';
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = buildApiUrl(endpoint);
  const method = (options?.method || 'GET').toUpperCase();

  const authHeader = getAuthHeader();
  const rawHeaders = (options?.headers as Record<string, string>) || {};

  // Clean out any accidental "undefined" or null authorization header values
  const cleanedRawHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (k.toLowerCase() === 'authorization') {
      if (v && v !== 'Bearer undefined' && v !== 'Bearer null' && v !== 'undefined' && v !== 'null') {
        cleanedRawHeaders[k] = v;
      }
    } else {
      cleanedRawHeaders[k] = v;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...cleanedRawHeaders,
  };

  const hasToken = Boolean(headers['Authorization']);

  const controller = new AbortController();
  const timeoutMs = 12000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      headers,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    const isNetwork = isAbort || err.name === 'TypeError' || String(err.message || '').includes('fetch');
    const userMessage = formatApiErrorMessage(null, err.message, isNetwork);

    console.log(
      `[AUTH DEBUG]\nRequest:\nMethod: ${method}\nURL: ${url}\nStatus: NETWORK_FAILURE\nHas token: ${hasToken}`
    );
    throw new Error(userMessage);
  }

  if (!res.ok) {
    let errorDetail = '';
    try {
      const errorBody = await res.json();
      errorDetail = errorBody.message || errorBody.error || '';
    } catch {
      errorDetail = res.statusText || '';
    }

    console.log(
      `[AUTH DEBUG]\nRequest:\nMethod: ${method}\nURL: ${url}\nStatus: ${res.status}\nHas token: ${hasToken}`
    );

    // Only clear session for genuine 401 Unauthorized responses
    if (res.status === 401) {
      try {
        localStorage.removeItem('salem_rice_token');
        localStorage.removeItem('salem_rice_auth_user');
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    const friendlyMessage = formatApiErrorMessage(res.status, errorDetail);
    throw new Error(friendlyMessage);
  }

  return res.json();
}

export const api = {
  // Health check
  getHealth: () => request<{ success: boolean; message: string; status?: string }>('/health'),

  // Database status
  getDbStatus: () => request<DbStatus>('/db-status'),
  triggerSeed: () => request<{ success: boolean; message: string }>('/seed', { method: 'POST' }),

  // Auth endpoints
  login: (credentials: { identifier?: string; email?: string; phone?: string; password: string }) =>
    request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { name: string; email: string; phone: string; password: string; address?: string }) =>
    request<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<{ success: boolean; user: User }>('/auth/me'),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Categories with graceful fallback
  getCategories: async (includeAll: boolean = false): Promise<Category[]> => {
    try {
      return await request<Category[]>(`/categories${includeAll ? '?all=true' : ''}`);
    } catch (err) {
      console.warn('[API] Categories fetch offline or failed, using local store seed data');
      return INITIAL_CATEGORIES.map((c, i) => ({
        ...c,
        _id: `cat_${i + 1}`,
        id: `cat_${i + 1}`,
      })) as Category[];
    }
  },

  getCategoryById: (id: string) => request<Category>(`/categories/${id}`),

  createCategory: (data: Partial<Category>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products with graceful fallback
  getProducts: async (params?: { category?: string; search?: string; featured?: boolean; available?: boolean }): Promise<Product[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.featured !== undefined) searchParams.append('featured', String(params.featured));
      if (params?.available !== undefined) searchParams.append('available', String(params.available));
      const query = searchParams.toString();
      return await request<Product[]>(`/products${query ? `?${query}` : ''}`);
    } catch (err) {
      console.warn('[API] Products fetch offline or failed');
      return [];
    }
  },

  getProductById: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Advertisements with graceful fallback
  getAdvertisements: async (includeAll: boolean = false): Promise<Advertisement[]> => {
    try {
      return await request<Advertisement[]>(`/advertisements${includeAll ? '?all=true' : ''}`);
    } catch (err) {
      console.warn('[API] Advertisements fetch offline or failed, using local store seed data');
      return INITIAL_ADVERTISEMENTS.map((a, i) => ({
        ...a,
        _id: `ad_${i + 1}`,
        id: `ad_${i + 1}`,
      })) as Advertisement[];
    }
  },

  getAdvertisementById: (id: string) => request<Advertisement>(`/advertisements/${id}`),

  createAdvertisement: (data: any) =>
    request<Advertisement>('/advertisements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdvertisement: (id: string, data: any) =>
    request<Advertisement>(`/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdvertisement: (id: string) =>
    request<{ success: boolean }>(`/advertisements/${id}`, { method: 'DELETE' }),

  // Addresses
  getAddresses: () => request<any[]>('/addresses'),

  createAddress: (data: any) =>
    request<any>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAddress: (id: string, data: any) =>
    request<any>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAddress: (id: string) =>
    request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params?: { status?: string; search?: string; userId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.search) sp.append('search', params.search);
    if (params?.userId) sp.append('userId', params.userId);
    const q = sp.toString();
    return request<Order[]>(`/orders${q ? `?${q}` : ''}`);
  },

  getOrderById: (id: string) => request<Order>(`/orders/${id}`),

  createOrder: (orderData: any) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateOrderStatus: (id: string, status: string, rejectionReason?: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    }),

  // Settings
  getSettings: () => request<any>('/settings'),

  updateSettings: (data: any) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[]; unreadCount: number }>('/notifications'),

  markNotificationAsRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsAsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Stats
  getStats: () => request<DashboardStats>('/stats'),

  // Upload image helper
  uploadImage: (imageBase64: string, name?: string) =>
    request<{ url: string; name: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, name }),
    }),
};

export default api;
