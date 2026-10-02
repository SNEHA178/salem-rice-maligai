import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'advertisements'
  | 'orders'
  | 'customers'
  | 'settings';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  onLogout?: () => void;
  onReturnToStore?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  onTabChange = () => {},
  onLogout = () => {},
  onReturnToStore = () => {},
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'advertisements', label: 'Advertisements', icon: ImageIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF8F2] text-[#2B2B2B]">
      {/* MOBILE DRAWER BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR & MOBILE DRAWER */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#16402A] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Admin Header / Brand */}
          <div className="h-18 px-5 border-b border-[#205A3B] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#205A3B] p-1 border border-[#CFA13A]/50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#DFBA5C]" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide font-heading text-white block">
                  SALEM RICE
                </span>
                <span className="text-[10px] font-semibold text-[#DFBA5C] uppercase tracking-wider block">
                  Admin Control Portal
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1" aria-label="Admin Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#205A3B] text-white shadow-xs'
                      : 'text-gray-300 hover:bg-[#205A3B]/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#DFBA5C]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Return to Store & Logout */}
        <div className="p-3 border-t border-[#205A3B] space-y-1">
          <button
            type="button"
            onClick={onReturnToStore}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#DFBA5C] hover:bg-[#205A3B]/60 transition cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Return to Store</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#F0EBDD] px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#2B2B2B] hover:bg-[#FAF8F2]"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-base sm:text-lg text-[#16402A] capitalize font-heading">
              {activeTab} Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReturnToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#205A3B] text-xs font-semibold text-[#205A3B] hover:bg-[#205A3B] hover:text-white transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Customer Store</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#F0EBDD]">
              <div className="w-8 h-8 rounded-full bg-[#16402A] text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="text-xs font-medium text-[#2B2B2B] hidden md:inline">Admin</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
