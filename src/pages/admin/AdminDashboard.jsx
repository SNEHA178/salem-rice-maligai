import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Edit,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

export const AdminDashboard = ({ onNavigateTab = () => {}, onEditProduct = () => {} }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Unable to load current statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
            Store Dashboard Overview
          </h2>
          <p className="text-xs text-[#5A5A5A] mt-0.5">
            Real-time live operations &amp; stock alerts for Salem Rice &amp; Maligai.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStats}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0DBC8] bg-white text-xs font-semibold text-[#16402A] hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-2xl bg-white border border-[#F0EBDD] shadow-xs space-y-2 hover:border-[#205A3B] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A5A]">
            <span className="text-xs font-semibold">Products</span>
            <Package className="w-4 h-4 text-[#205A3B] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-[#16402A] font-heading">
            {isLoading ? '...' : (stats?.totalProducts ?? 0)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#5A5A5A]">
            <span>{stats?.activeProducts ?? 0} active</span>
            <span className="text-[#205A3B] font-semibold group-hover:underline flex items-center gap-0.5">
              Manage <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* 2. Categories */}
        <div
          onClick={() => onNavigateTab('categories')}
          className="p-5 rounded-2xl bg-white border border-[#F0EBDD] shadow-xs space-y-2 hover:border-[#205A3B] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A5A]">
            <span className="text-xs font-semibold">Categories</span>
            <FolderTree className="w-4 h-4 text-[#CFA13A] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-[#16402A] font-heading">
            {isLoading ? '...' : (stats?.totalCategories ?? 0)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#5A5A5A]">
            <span>{stats?.activeCategories ?? stats?.totalCategories ?? 0} active</span>
            <span className="text-[#CFA13A] font-semibold group-hover:underline flex items-center gap-0.5">
              Manage <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* 3. Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-white border border-[#F0EBDD] shadow-xs space-y-2 hover:border-[#205A3B] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A5A]">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-[#16402A] font-heading">
            {isLoading ? '...' : (stats?.totalOrders ?? 0)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#5A5A5A]">
            <span className="text-amber-700 font-semibold">{stats?.pendingOrders ?? 0} pending</span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Orders <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* 4. Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="p-5 rounded-2xl bg-white border border-[#F0EBDD] shadow-xs space-y-2 hover:border-[#205A3B] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A5A]">
            <span className="text-xs font-semibold">Registered Buyers</span>
            <Users className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-[#16402A] font-heading">
            {isLoading ? '...' : (stats?.totalCustomers ?? 0)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#5A5A5A]">
            <span>Salem Customers</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
              View <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* 5. Low Stock Alert Card */}
        <div
          onClick={() => onNavigateTab('products')}
          className={`p-5 rounded-2xl border shadow-xs space-y-2 transition cursor-pointer group ${
            stats?.lowStockProducts > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
              : 'bg-white border-[#F0EBDD] hover:border-[#205A3B]'
          }`}
        >
          <div className="flex items-center justify-between text-[#5A5A5A]">
            <span className="text-xs font-semibold">Low Stock Products</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                stats?.lowStockProducts > 0 ? 'text-rose-600 animate-bounce' : 'text-emerald-600'
              }`}
            />
          </div>
          <p
            className={`text-2xl font-black font-heading ${
              stats?.lowStockProducts > 0 ? 'text-rose-700' : 'text-[#16402A]'
            }`}
          >
            {isLoading ? '...' : (stats?.lowStockProducts ?? 0)}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#5A5A5A]">Threshold: ≤ {stats?.lowStockThreshold ?? 5}</span>
            <span className="text-rose-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Refill <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Revenue & Operations Bar */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-[#16402A] to-[#205A3B] text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs text-[#DFBA5C] font-semibold tracking-wider uppercase">
            Store Performance
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-heading">
            Total Completed &amp; Active Sales Volume: {formatPrice(stats?.totalRevenue || 0)}
          </h3>
          <p className="text-xs text-emerald-100/80">
            Real orders placed across Salem retail and wholesale dispatch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 rounded-xl bg-[#CFA13A] hover:bg-[#b88f30] text-[#16402A] font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Review Pending Orders ({stats?.pendingOrders || 0})
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('advertisements')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition cursor-pointer"
          >
            Manage Banner Offers
          </button>
        </div>
      </div>

      {/* Low Stock Watchlist */}
      <div className="rounded-2xl bg-white border border-[#F0EBDD] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#16402A] font-heading">
                Low Stock Refill Watchlist (Stock ≤ {stats?.lowStockThreshold || 5})
              </h3>
              <p className="text-xs text-[#5A5A5A]">
                Click any product to update inventory or re-order from rice mills.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="text-xs font-semibold text-[#205A3B] hover:underline"
          >
            View All Products
          </button>
        </div>

        {stats?.lowStockList && stats.lowStockList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] text-[#16402A] font-heading uppercase text-[10px] tracking-wider border-b border-[#F0EBDD]">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Remaining Stock</th>
                  <th className="py-2.5 px-3">Retail Price</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBDD]">
                {stats.lowStockList.map((item) => {
                  const nameEn = typeof item.name === 'object' ? item.name.en : item.name;
                  const nameTa = typeof item.name === 'object' ? item.name.ta : item.tamilName;
                  const unitStr = typeof item.unit === 'object' ? item.unit.en : item.unit || 'kg';
                  return (
                    <tr key={item._id || item.id} className="hover:bg-[#FAF8F2]/60 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&q=80'}
                            alt={nameEn}
                            className="w-9 h-9 rounded-lg object-cover border border-[#F0EBDD] shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#16402A] block">{nameEn}</span>
                            {nameTa && <span className="text-[11px] text-[#2D7A50] block font-tamil">{nameTa}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#5A5A5A] font-medium">{item.category || 'Salem Rice'}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {item.stock} {unitStr} left
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#16402A]">{formatPrice(item.retailPrice || 0)}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onEditProduct(item._id || item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#205A3B] text-white hover:bg-[#16402A] text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Update Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#FAF8F2] rounded-xl border border-dashed border-[#E0DBC8]">
            <p className="text-xs text-[#205A3B] font-semibold">
              ✓ All inventory levels are above the low stock threshold ({stats?.lowStockThreshold || 5} units).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
