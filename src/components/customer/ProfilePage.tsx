import React from 'react';
import { User as UserIcon, Phone, MapPin, Mail, ShoppingBag, LogOut, ShieldCheck, Building2 } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { User, Order } from '../../types';

interface ProfilePageProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onViewOrders: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  orders,
  onLogout,
  onViewOrders,
}) => {
  const isWholesaleCustomer = user.businessName || orders.some(o => o.pricingMode === 'WHOLESALE');

  return (
    <PageContainer className="py-6 sm:py-10 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
            Customer Profile
          </h2>
          <p className="text-xs text-gray-500">
            Account details, orders, and delivery preferences
          </p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* User Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#205A3B] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#16402A] leading-tight">
              {user.name}
            </h3>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.businessName && (
              <p className="text-xs font-semibold text-[#205A3B] mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{user.businessName}</span>
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0EBDD] space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#205A3B]" />
              <span>{user.phone}</span>
            </div>
            {user.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#205A3B] shrink-0 mt-0.5" />
                <span>
                  {user.address}, {user.city} - {user.pincode}
                </span>
              </div>
            )}
          </div>

          {/* Wholesale Status Badge */}
          <div className="pt-3 border-t border-[#F0EBDD]">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isWholesaleCustomer
                  ? 'bg-[#CFA13A]/20 text-[#16402A]'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#CFA13A]" />
              <span>{isWholesaleCustomer ? 'Wholesale & Retail Buyer' : 'Retail Customer'}</span>
            </span>
          </div>

          {/* PWA Install */}
          <div className="pt-2">
            <PWAInstallButton variant="full" />
          </div>
        </div>

        {/* Order Statistics & Quick Actions */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs">
              <span className="text-xs text-gray-500 font-semibold block">Total Orders</span>
              <span className="text-3xl font-extrabold text-[#16402A] mt-1 block">
                {orders.length}
              </span>
              <button
                onClick={onViewOrders}
                className="text-xs font-bold text-[#205A3B] hover:underline mt-2 inline-block cursor-pointer"
              >
                View History &rarr;
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs">
              <span className="text-xs text-gray-500 font-semibold block">Lifetime Spending</span>
              <span className="text-3xl font-extrabold text-[#16402A] mt-1 block">
                ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-400 mt-2 block">
                Across {orders.length} deliveries
              </span>
            </div>
          </div>

          {/* Recent Order Preview */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#16402A]">Latest Order</h4>
              <button
                onClick={onViewOrders}
                className="text-xs font-bold text-[#205A3B] hover:underline"
              >
                All Orders &rarr;
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#16402A]">#{orders[0].orderNumber}</p>
                  <p className="text-gray-500 text-[11px]">
                    {orders[0].items.length} {orders[0].items.length === 1 ? 'item' : 'items'} &bull; Status:{' '}
                    <span className="font-bold text-[#205A3B]">{orders[0].status}</span>
                  </p>
                </div>
                <span className="text-base font-extrabold text-[#16402A]">
                  ₹{orders[0].total.toLocaleString('en-IN')}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
