import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Home,
  Grid,
  ClipboardList,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from './PageContainer';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { User, PricingMode } from '../../types';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'categories' | 'cart' | 'orders' | 'profile';
  setActiveTab: (tab: 'home' | 'categories' | 'cart' | 'orders' | 'profile') => void;
  cartCount: number;
  user: User | null;
  pricingMode: PricingMode;
  setPricingMode: (mode: PricingMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAuth: () => void;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  cartCount,
  user,
  pricingMode,
  setPricingMode,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
}) => {
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-[#2B2B2B]">
      {/* Top Notification / Wholesale Announcement Bar */}
      <div className="bg-[#16402A] text-[#FAF8F2] text-xs py-1.5 px-4">
        <PageContainer className="flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#CFA13A] text-[#16402A] font-bold px-1.5 py-0.5 rounded-sm text-[10px]">
              DIRECT MILL
            </span>
            <span className="hidden sm:inline">
              Salem Rice &amp; Everyday Maligai • Dual Retail &amp; Wholesale Pricing
            </span>
            <span className="sm:hidden">Salem Rice &amp; Maligai Store</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-gray-300">Mode:</span>
              <button
                onClick={() => setPricingMode(pricingMode === 'RETAIL' ? 'WHOLESALE' : 'RETAIL')}
                className="font-bold text-[#DFBA5C] hover:underline cursor-pointer flex items-center gap-1"
                title="Click to toggle store pricing mode"
              >
                <span>{pricingMode}</span>
                <span className="text-[10px] text-gray-300">(switch)</span>
              </button>
            </div>
            <a
              href="tel:9842712345"
              className="hidden md:flex items-center gap-1 text-[#DFBA5C] hover:text-white transition"
            >
              <Phone className="w-3 h-3" />
              <span>+91 98427 12345</span>
            </a>
          </div>
        </PageContainer>
      </div>

      {/* Main Responsive Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0EBDD] shadow-xs">
        <PageContainer>
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            {/* Brand Logo & Name */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer shrink-0"
              aria-label="Salem Rice & Maligai Home"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#205A3B] p-1.5 border border-[#CFA13A]/50 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/icon.svg"
                  alt="Salem Rice & Maligai Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-xl font-extrabold tracking-tight text-[#16402A] font-heading leading-tight">
                    SALEM RICE
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#CFA13A] tracking-wider uppercase">
                    &amp; MALIGAI
                  </span>
                </div>
                <p className="font-tamil text-[10px] sm:text-xs text-[#205A3B] font-medium leading-none">
                  சேலம் அரிசி &amp; மளிகை
                </p>
              </div>
            </button>

            {/* Desktop / Tablet Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input
                id="desktop-header-search"
                type="text"
                placeholder="Search Ponni rice, Toor dal, Chekku oil, Atta..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'home' && activeTab !== 'categories') {
                    setActiveTab('home');
                  }
                }}
                className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-10 pr-4 py-2 rounded-xl text-sm transition outline-hidden text-[#2B2B2B]"
              />
              <Search className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
                className="md:hidden p-2 text-[#2B2B2B] hover:text-[#205A3B]"
                aria-label="Search items"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* In-App PWA Install Prompt */}
              <div className="hidden sm:block">
                <PWAInstallButton variant="header" />
              </div>

              {/* Pricing Mode Pill Toggle */}
              <div className="hidden lg:flex items-center rounded-xl bg-[#FAF8F2] p-1 border border-[#F0EBDD]">
                <button
                  onClick={() => setPricingMode('RETAIL')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    pricingMode === 'RETAIL'
                      ? 'bg-[#205A3B] text-white shadow-xs'
                      : 'text-[#5A5A5A] hover:text-[#16402A]'
                  }`}
                >
                  Retail
                </button>
                <button
                  onClick={() => setPricingMode('WHOLESALE')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    pricingMode === 'WHOLESALE'
                      ? 'bg-[#CFA13A] text-[#16402A] shadow-xs'
                      : 'text-[#5A5A5A] hover:text-[#16402A]'
                  }`}
                >
                  Wholesale
                </button>
              </div>

              {/* Cart Button with Counter */}
              <button
                id="header-cart-button"
                onClick={() => setActiveTab('cart')}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-[#205A3B] text-white'
                    : 'bg-[#FAF8F2] hover:bg-[#F0EBDD] text-[#16402A]'
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-current" />
                <span className="hidden sm:inline font-semibold text-sm">Cart</span>
                {cartCount > 0 && (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#CFA13A] text-[#16402A] text-xs font-bold shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile / Login */}
              {user ? (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#205A3B] text-white'
                      : 'bg-[#FAF8F2] hover:bg-[#F0EBDD] text-[#2B2B2B]'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#205A3B] hover:bg-[#F0EBDD] transition cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Expandable Bar */}
          {isSearchOpenMobile && (
            <div className="pb-3 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rice, dal, oils, spices..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'home' && activeTab !== 'categories') {
                      setActiveTab('home');
                    }
                  }}
                  autoFocus
                  className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] pl-9 pr-4 py-2 rounded-xl text-sm outline-hidden"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </PageContainer>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>

      {/* Modern Responsive Footer */}
      <footer className="bg-[#16402A] text-[#FAF8F2] pt-12 pb-24 md:pb-12 border-t border-[#205A3B]">
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#205A3B] p-1 border border-[#CFA13A]">
                  <img src="/icon.svg" alt="Salem Rice" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide font-heading text-white">
                    SALEM RICE
                  </h3>
                  <p className="text-xs font-semibold text-[#DFBA5C] uppercase">
                    &amp; Maligai
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Authentic Salem rice varieties and pure daily grocery provisions. Serving home kitchens, caterers, and retail stores since 1988 with transparent Retail and Wholesale prices.
              </p>
              <div className="pt-2">
                <PWAInstallButton variant="header" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
                Store Categories
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li>
                  <button onClick={() => setActiveTab('categories')} className="hover:text-white transition">
                    Salem Rice Varieties (சேலம் அரிசி)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('categories')} className="hover:text-white transition">
                    Dals &amp; High-Protein Pulses
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('categories')} className="hover:text-white transition">
                    Cold Pressed Chekku Oils
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('categories')} className="hover:text-white transition">
                    Stone-Ground Flours &amp; Rava
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('categories')} className="hover:text-white transition">
                    Pure Jaggery &amp; Festival Specials
                  </button>
                </li>
              </ul>
            </div>

            {/* Business Details */}
            <div>
              <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
                Visit &amp; Contact
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#CFA13A] shrink-0 mt-0.5" />
                  <span>14/2, Bazaar Street, Shevapet Market, Salem – 636002, Tamil Nadu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#CFA13A] shrink-0" />
                  <a href="tel:9842712345" className="hover:text-white">+91 98427 12345 / 94432 12345</a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#CFA13A] shrink-0" />
                  <span>Mon – Sat: 7:30 AM – 9:30 PM (Sun: 8:00 AM – 1:00 PM)</span>
                </li>
              </ul>
            </div>

            {/* Quality Commitment & Authorized Portal Link */}
            <div>
              <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
                Our Guarantee
              </h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DFBA5C]" />
                  <span>100% Unadulterated Grains</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBA5C]" />
                  <span>Honest Measure &amp; Weighing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBA5C]" />
                  <span>Direct Mill Wholesale Rates</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#205A3B] text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>&copy; {new Date().getFullYear()} Salem Rice &amp; Maligai. All rights reserved.</p>
            <p className="font-tamil text-[11px] text-[#DFBA5C]/90">
              பாரம்பரிய தரம் • நியாயமான விலை • சேலத்தின் பெருமை
            </p>
          </div>
        </PageContainer>
      </footer>

      {/* Mobile Bottom Navigation (Feels like a real native app) */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#F0EBDD] py-2 px-3 shadow-lg"
      >
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'home' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'categories' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
            }`}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`relative flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'cart' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
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
            <span className="text-[11px]">Cart</span>
          </button>

          <button
            onClick={() => {
              if (user) setActiveTab('profile');
              else onOpenAuth();
            }}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'profile' || activeTab === 'orders' ? 'text-[#205A3B] font-bold' : 'text-[#5A5A5A]'
            }`}
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">{user ? 'Profile' : 'Login'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
