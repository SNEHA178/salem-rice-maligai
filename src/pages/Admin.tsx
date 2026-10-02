import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout, AdminTab } from '../layouts/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, Category, Order, User, Advertisement, DbStatus, OrderStatus } from '../types';
import { AdminDashboardHome } from '../components/admin/AdminDashboardHome';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminCategories } from '../components/admin/AdminCategories';
import { AdminAdvertisements } from '../components/admin/AdminAdvertisements';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminCustomers } from '../components/admin/AdminCustomers';
import { AdminSettings } from '../components/admin/AdminSettings';
import { Loader2, RefreshCw } from 'lucide-react';

export interface AdminPageProps {
  initialTab?: AdminTab;
  onReturnToStore?: () => void;
  onNavigate?: (path: string) => void;
}

export const Admin: React.FC<AdminPageProps> = ({
  initialTab = 'dashboard',
  onReturnToStore = () => {},
  onNavigate = () => {},
}) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Synchronize activeTab if initialTab changes via URL navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsData, catsData, ordersData, adsData, statusData] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories(true).catch(() => []),
        api.getOrders().catch(() => []),
        api.getAdvertisements(true).catch(() => []),
        api.getDbStatus().catch(() => undefined),
      ]);

      setProducts(prodsData || []);
      setCategories(catsData || []);
      setOrders(ordersData || []);
      setAdvertisements(adsData || []);
      setDbStatus(statusData);

      // Extract unique customer buyers from orders
      const userMap = new Map<string, User>();
      (ordersData || []).forEach((ord: any) => {
        if (ord.customer && ord.customer.phone) {
          const key = ord.customer.phone;
          if (!userMap.has(key)) {
            userMap.set(key, {
              _id: ord.customer.id || ord.customer._id || `usr_${key}`,
              id: ord.customer.id || ord.customer._id || `usr_${key}`,
              name: ord.customer.name || 'Salem Customer',
              email: ord.customer.email || '',
              phone: ord.customer.phone || '',
              role: 'CUSTOMER',
              businessName: ord.customer.businessName || '',
              createdAt: ord.createdAt || new Date().toISOString(),
            });
          }
        }
      });
      setCustomers(Array.from(userMap.values()));
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError('Failed to fetch administrative data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab change handler
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const route = tab === 'advertisements' ? 'ads' : tab;
    onNavigate(`/admin/${route}`);
  };

  const handleAdminLogout = async () => {
    await logout();
    onNavigate('/admin');
  };

  // Product mutations
  const handleAddProduct = async (data: Partial<Product>) => {
    const created = await api.createProduct(data);
    setProducts(prev => [created, ...prev]);
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    const updated = await api.updateProduct(id, data);
    setProducts(prev => prev.map(p => (p.id === id || p._id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
  };

  // Category mutations
  const handleAddCategory = async (data: Partial<Category>) => {
    const created = await api.createCategory(data);
    setCategories(prev => [...prev, created]);
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    const updated = await api.updateCategory(id, data);
    setCategories(prev => prev.map(c => (c.id === id || c._id === id ? updated : c)));
  };

  const handleDeleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id && c._id !== id));
  };

  // Advertisement mutations
  const handleAddAd = async (data: Partial<Advertisement>) => {
    const created = await api.createAdvertisement(data);
    setAdvertisements(prev => [...prev, created]);
  };

  const handleUpdateAd = async (id: string, data: Partial<Advertisement>) => {
    const updated = await api.updateAdvertisement(id, data);
    setAdvertisements(prev => prev.map(a => (a.id === id || a._id === id ? updated : a)));
  };

  const handleDeleteAd = async (id: string) => {
    await api.deleteAdvertisement(id);
    setAdvertisements(prev => prev.filter(a => a.id !== id && a._id !== id));
  };

  // Order status mutation
  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const updated = await api.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => (o.id === id || o._id === id ? updated : o)));
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onReturnToStore={onReturnToStore}
      onLogout={handleAdminLogout}
    >
      {loading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#205A3B] animate-spin mb-3" />
          <p className="text-sm font-semibold text-[#16402A]">Loading Admin Workspace...</p>
          <p className="text-xs text-[#5A5A5A] mt-1">Retrieving catalog, orders, and system status</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#F0EBDD] space-y-4">
          <p className="text-sm text-red-600 font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#205A3B] text-white text-xs font-bold hover:bg-[#16402A] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <AdminDashboardHome
              products={products}
              categories={categories}
              orders={orders}
              customers={customers}
              advertisements={advertisements}
              dbStatus={dbStatus}
              onNavigate={handleTabChange}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'advertisements' && (
            <AdminAdvertisements
              advertisements={advertisements}
              categories={categories}
              onAddAd={handleAddAd}
              onUpdateAd={handleUpdateAd}
              onDeleteAd={handleDeleteAd}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              customers={customers}
              orders={orders}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              dbStatus={dbStatus}
              onRefreshData={fetchData}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default Admin;
