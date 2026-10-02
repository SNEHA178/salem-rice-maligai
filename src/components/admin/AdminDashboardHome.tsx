import React, { useState, useEffect } from 'react';
import {
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Megaphone,
  PlusCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Truck,
  XCircle,
  AlertTriangle,
  Calendar,
  Store,
  RefreshCw,
} from 'lucide-react';
import { Product, Category, Order, User, Advertisement, DbStatus, OrderStatus } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardHomeProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: User[];
  advertisements: Advertisement[];
  dbStatus?: DbStatus;
  onNavigate: (tab: any) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, rejectionReason?: string) => Promise<void>;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  products,
  categories,
  orders,
  customers,
  advertisements,
  dbStatus,
  onNavigate,
  onUpdateOrderStatus,
}) => {
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res) setStoreSettings(res);
    }).catch(() => {});
  }, []);

  // Normalize order status
  const norm = (s: string) => String(s || '').toUpperCase();

  // REQUIREMENT #12: All metrics derived from real database collections
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => norm(o.status) === 'PENDING').length;
  const confirmedOrders = orders.filter(o => norm(o.status) === 'CONFIRMED').length;
  const processingOrders = orders.filter(o => norm(o.status) === 'PROCESSING').length;
  const outForDeliveryOrders = orders.filter(o => norm(o.status) === 'OUT_FOR_DELIVERY').length;
  const deliveredOrders = orders.filter(o => norm(o.status) === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => norm(o.status) === 'CANCELLED').length;

  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.available !== false).length;
  const lowStockProducts = products.filter(p => (Number(p.stock) || 0) <= 5).length;

  // Today's orders
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.createdAt && String(o.createdAt).startsWith(todayDateStr)).length;

  // Tomorrow's delivery orders (Orders requiring delivery tomorrow)
  const tomorrowDeliveryOrders = orders.filter(
    o => norm(o.status) !== 'DELIVERED' && norm(o.status) !== 'CANCELLED'
  ).length;

  const currentShopStatus = storeSettings?.shopStatus || 'OPEN';
  const totalRevenue = orders
    .filter(o => norm(o.status) !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner: DB Status & Shop Availability Badge */}
      <div className="p-4 rounded-3xl bg-white border border-[#F0EBDD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              currentShopStatus === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#16402A]">
                Shop Status: {currentShopStatus}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentShopStatus === 'OPEN'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {currentShopStatus === 'OPEN' ? 'Accepting Orders' : 'Orders Paused'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Database: {dbStatus?.type === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Local Storage'} &bull;
              Mon-Sat: {storeSettings?.monSatOpen || '07:00'}–{storeSettings?.monSatClose || '21:30'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="text-xs font-bold text-[#205A3B] hover:text-[#16402A] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Hours &amp; Shop Notice &rarr;</span>
        </button>
      </div>

      {/* REQUIREMENT #12: REAL DATABASE DASHBOARD METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#205A3B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {totalOrders}
          </p>
          <p className="text-[11px] text-[#205A3B] font-semibold mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')} revenue
          </p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-amber-500 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2 font-heading">
            {pendingOrders}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            Requires store acceptance
          </p>
        </div>

        {/* Confirmed Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Confirmed Orders</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {confirmedOrders}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Accepted by mill
          </p>
        </div>

        {/* Processing Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Processing</span>
            <Package className="w-4 h-4 text-[#CFA13A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {processingOrders}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">
            Bagging &amp; packing
          </p>
        </div>

        {/* Out for Delivery */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Out for Delivery</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {outForDeliveryOrders}
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            En route in Salem
          </p>
        </div>

        {/* Delivered Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Delivered</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-2 font-heading">
            {deliveredOrders}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Completed deliveries
          </p>
        </div>

        {/* Cancelled Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-rose-400 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Cancelled / Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-2 font-heading">
            {cancelledOrders}
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            Stock auto-restored
          </p>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Total Customers</span>
            <Users className="w-4 h-4 text-[#205A3B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {totalCustomers}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">
            Registered Salem buyers
          </p>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Products in Catalog</span>
            <Package className="w-4 h-4 text-[#CFA13A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {totalProducts}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {activeProducts} active for sale
          </p>
        </div>

        {/* Low Stock Indicator */}
        <div
          onClick={() => onNavigate('products')}
          className={`p-5 rounded-3xl bg-white border transition cursor-pointer shadow-xs ${
            lowStockProducts > 0 ? 'border-amber-400 bg-amber-50/20' : 'border-[#F0EBDD]'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2 font-heading">
            {lowStockProducts}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Units &le; 5 threshold
          </p>
        </div>

        {/* Today's Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-600">Today&rsquo;s Orders</span>
            <Calendar className="w-4 h-4 text-[#205A3B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {todaysOrders}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">
            Placed today
          </p>
        </div>

        {/* Tomorrow's Delivery Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-3xl bg-[#FAF8F2] border border-[#CFA13A]/50 hover:border-[#205A3B] transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-[#16402A]">
            <span className="text-xs font-extrabold text-[#16402A]">Tomorrow&rsquo;s Dispatch</span>
            <Truck className="w-4 h-4 text-[#CFA13A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#16402A] mt-2 font-heading">
            {tomorrowDeliveryOrders}
          </p>
          <p className="text-[11px] text-[#205A3B] font-bold mt-1">
            Orders for tomorrow&rsquo;s delivery
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs">
        <h3 className="text-sm font-bold text-[#16402A] font-heading mb-4">
          Admin Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#205A3B] text-white hover:bg-[#16402A] transition font-bold text-xs cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#DFBA5C]" />
            <span>Manage Products</span>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F0EBDD] text-[#16402A] hover:bg-[#FAF8F2] border border-[#CFA13A]/40 transition font-bold text-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#205A3B]" />
            <span>Manage Orders</span>
          </button>

          <button
            onClick={() => onNavigate('categories')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F0EBDD] text-[#16402A] hover:bg-[#FAF8F2] border border-[#CFA13A]/40 transition font-bold text-xs cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-[#205A3B]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#F0EBDD] text-[#16402A] hover:bg-[#FAF8F2] border border-[#CFA13A]/40 transition font-bold text-xs cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#205A3B]" />
            <span>Shop Settings &amp; Notice</span>
          </button>
        </div>
      </div>

      {/* Recent Orders with Accept / Reject Quick Controls */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#16402A] font-heading">
              Recent Store Orders
            </h3>
            <p className="text-xs text-gray-500">
              Live status and quick order acceptance
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-[#205A3B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders ({orders.length}) &rarr;</span>
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0EBDD] text-gray-500 font-bold bg-[#FAF8F2]/60">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Pricing Mode</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBDD]">
                {recentOrders.map(order => {
                  const s = norm(order.status);
                  return (
                    <tr key={order._id || order.id} className="hover:bg-[#FAF8F2]/30">
                      <td className="py-3 px-3 font-extrabold text-[#16402A]">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#2B2B2B]">{order.customer?.name}</p>
                        <p className="text-[11px] text-gray-500">{order.customer?.phone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#F0EBDD] text-[#16402A]">
                          {order.pricingMode || 'retail'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#16402A]">
                        ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : s === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {s === 'PENDING' ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => onUpdateOrderStatus(order._id || order.id || '', 'CONFIRMED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                const reason = window.prompt('Optional cancellation reason:');
                                onUpdateOrderStatus(order._id || order.id || '', 'CANCELLED', reason || undefined);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onNavigate('orders')}
                            className="px-3 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#F0EBDD] border border-[#F0EBDD] text-[#16402A] font-semibold text-[11px] cursor-pointer"
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
