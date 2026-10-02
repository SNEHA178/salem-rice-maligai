import React from 'react';
import { Home, Grid, ShoppingBag, User as UserIcon } from 'lucide-react';

export interface MobileBottomNavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  cartCount?: number;
  user?: { name: string } | null;
  onOpenAuth?: () => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  currentPath = '/',
  onNavigate = () => {},
  cartCount = 0,
  user = null,
  onOpenAuth = () => {},
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#F0EBDD] py-1.5 px-3 shadow-lg"
    >
      <div className="grid grid-cols-4 gap-1 text-center">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentPath === '/' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Home</span>
        </button>

        {/* 2. Categories */}
        <button
          type="button"
          onClick={() => onNavigate('/categories')}
          className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentPath === '/categories' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Categories</span>
        </button>

        {/* 3. Cart */}
        <button
          type="button"
          onClick={() => onNavigate('/cart')}
          className={`relative flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentPath === '/cart' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#CFA13A] text-[#16402A] text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">Cart</span>
        </button>

        {/* 4. Profile / Login */}
        <button
          type="button"
          onClick={() => (user ? onNavigate('/profile') : onOpenAuth())}
          className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            currentPath === '/profile' || currentPath === '/orders' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">{user ? 'Profile' : 'Login'}</span>
        </button>
      </div>
    </nav>
  );
};
