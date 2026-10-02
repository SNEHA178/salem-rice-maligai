import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Megaphone,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { User, DbStatus } from '../../types';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'advertisements'
  | 'orders'
  | 'customers'
  | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  user: User;
  onLogout: () => void;
  onExitToStore: () => void;
  dbStatus?: DbStatus;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onExitToStore,
  dbStatus,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'advertisements', label: 'Advertisements', icon: Megaphone },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F0EBDD]/30 flex flex-col md:flex-row text-[#2B2B2B]">
      {/* Desktop Sidebar (Requirement #17: Left sidebar on Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#16402A] text-[#FAF8F2] shrink-0 border-r border-[#205A3B]">
        {/* Brand header */}
        <div className="p-5 border-b border-[#205A3B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#205A3B] p-1.5 border border-[#CFA13A]/50 flex items-center justify-center">
              <img src="/icon.svg" alt="Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-white font-heading leading-tight">
                SALEM RICE
              </h2>
              <p className="text-[11px] font-semibold text-[#DFBA5C] uppercase tracking-wider">
                Admin Control
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-3.5 bg-[#205A3B]/40 border-b border-[#205A3B] text-xs">
          <p className="font-bold text-white truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#DFBA5C]" />
            <span className="text-gray-300 text-[11px]">{user.email}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#205A3B] text-white shadow-xs font-semibold'
                    : 'text-gray-300 hover:bg-[#205A3B]/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#DFBA5C]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* DB Connection Indicator */}
        {dbStatus && (
          <div className="mx-3 mb-3 p-2.5 rounded-xl bg-[#205A3B]/30 border border-[#205A3B] text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-[#DFBA5C]">
              <Database className="w-3.5 h-3.5" />
              <span>{dbStatus.type === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Local Storage'}</span>
            </div>
            <p className="text-gray-300 text-[10px] mt-0.5 line-clamp-1">{dbStatus.databaseName}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#205A3B] space-y-1">
          <button
            onClick={onExitToStore}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#205A3B]/40 transition cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#DFBA5C]" />
            <span>Switch to Customer Store</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-300 hover:text-red-100 hover:bg-red-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header (Requirement #17: Hamburger drawer on mobile) */}
      <div className="md:hidden bg-[#16402A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-[#205A3B] text-white"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-sm font-heading">Salem Rice Admin</h2>
            <p className="text-[10px] text-[#DFBA5C] capitalize">{activeTab}</p>
          </div>
        </div>

        <button
          onClick={onExitToStore}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-[#205A3B] text-[#DFBA5C] font-semibold flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Store</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 bg-[#16402A] text-white h-full flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#205A3B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="Admin" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-sm">Salem Rice Admin</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 bg-[#205A3B]/30 border-b border-[#205A3B] text-xs">
              <p className="font-bold text-white">{user.name}</p>
              <p className="text-gray-300 text-[11px]">{user.email}</p>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive ? 'bg-[#205A3B] text-white font-bold' : 'text-gray-300 hover:bg-[#205A3B]/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#DFBA5C]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#205A3B] space-y-1">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onExitToStore();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200"
              >
                <Store className="w-4 h-4 text-[#DFBA5C]" />
                <span>Customer Store</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Content Wrapper (Uses available responsive width without side clipping) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white border-b border-[#F0EBDD] shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#16402A] font-heading capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-gray-500">
              Manage Salem Rice &amp; Maligai catalog, prices, and orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#16402A] bg-[#F0EBDD] hover:bg-[#FAF8F2] border border-[#CFA13A]/40 transition"
            >
              <Store className="w-3.5 h-3.5 text-[#205A3B]" />
              <span>View Customer Store</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
