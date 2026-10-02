import React from 'react';
import { Search, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';

export const Header = ({
  currentPath = '/',
  onNavigate = () => {},
  cartCount = 0,
  user = null,
  searchQuery = '',
  onSearchChange = () => {},
  pricingMode = 'RETAIL',
  onTogglePricingMode,
  onOpenAuth = () => {},
}) => {
  const { t, isTamil } = useLanguage();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/products');
    }
  };

  const isRetail = String(pricingMode).toUpperCase() === 'RETAIL';
  const pricingModeLabel = isRetail ? t('retail') : t('wholesale');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0EBDD] shadow-xs">
      {/* Top Wholesale/Retail Announcement Strip */}
      <div className="bg-[#16402A] text-[#FAF8F2] text-xs py-1 px-4">
        <PageContainer className="flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#CFA13A] text-[#16402A] font-bold px-1.5 py-0.2 rounded text-[10px]">
              AUTHENTIC
            </span>
            <span className="hidden sm:inline">
              Salem Rice &amp; Maligai • {t('heroTagline')}
            </span>
            <span className="sm:hidden">Salem Rice &amp; Maligai</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onTogglePricingMode && (
              <div className="flex items-center gap-1">
                <span className="text-gray-300 hidden xs:inline">{t('mode')}:</span>
                <button
                  type="button"
                  onClick={onTogglePricingMode}
                  className="font-bold text-[#DFBA5C] hover:underline cursor-pointer flex items-center gap-1"
                  title="Switch between Retail and Wholesale pricing"
                >
                  <span>{pricingModeLabel}</span>
                  <span className="text-[10px] text-gray-300">{t('switchMode')}</span>
                </button>
              </div>
            )}
          </div>
        </PageContainer>
      </div>

      <PageContainer>
        {/* DESKTOP HEADER (md and above) */}
        <div className="hidden md:flex items-center justify-between h-18 gap-5">
          {/* Left: Brand / Logo */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 text-left cursor-pointer shrink-0"
            aria-label="Salem Rice & Maligai Home"
          >
            <div className="w-11 h-11 rounded-xl bg-[#205A3B] p-1.5 border border-[#CFA13A]/50 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/icon.svg"
                alt="Salem Rice & Maligai Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-[#16402A] font-heading leading-tight">
                  SALEM RICE
                </span>
                <span className="text-xs font-bold text-[#CFA13A] tracking-wider uppercase">
                  &amp; MALIGAI
                </span>
              </div>
              <p className="font-tamil text-xs text-[#205A3B] font-medium leading-none">
                சேலம் அரிசி &amp; மளிகை
              </p>
            </div>
          </button>

          {/* Center: Search Bar with Accessible Label & Form */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Site search"
            className="flex-1 max-w-md relative"
          >
            <label htmlFor="desktop-search-input" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <input
              id="desktop-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm transition outline-hidden text-[#2B2B2B]"
            />
            <Search className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search text"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right: Quick Links, Language Selector, Cart, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Categories Navigation */}
            <button
              type="button"
              onClick={() => onNavigate('/categories')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                currentPath === '/categories'
                  ? 'bg-[#205A3B] text-white'
                  : 'text-[#2B2B2B] hover:bg-[#FAF8F2] hover:text-[#205A3B]'
              }`}
            >
              {t('categories')}
            </button>

            {/* Quick Products Navigation */}
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                currentPath === '/products'
                  ? 'bg-[#205A3B] text-white'
                  : 'text-[#2B2B2B] hover:bg-[#FAF8F2] hover:text-[#205A3B]'
              }`}
            >
              {t('products')}
            </button>

            {/* Language Selector in Desktop Header per spec */}
            <LanguageSelector className="shrink-0" />

            {/* Cart Button */}
            <button
              type="button"
              id="desktop-cart-btn"
              onClick={() => onNavigate('/cart')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition cursor-pointer ${
                currentPath === '/cart'
                  ? 'bg-[#205A3B] text-white'
                  : 'bg-[#FAF8F2] hover:bg-[#F0EBDD] text-[#16402A]'
              }`}
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
              <span className="font-semibold text-xs sm:text-sm">{t('cart')}</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#CFA13A] text-[#16402A] text-xs font-bold shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Auth Button */}
            {user ? (
              <button
                type="button"
                onClick={() => onNavigate('/profile')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                  currentPath === '/profile'
                    ? 'bg-[#205A3B] text-white'
                    : 'bg-[#FAF8F2] hover:bg-[#F0EBDD] text-[#2B2B2B]'
                }`}
              >
                <UserIcon className="w-4 h-4 text-[#205A3B]" />
                <span className="max-w-[90px] truncate">{user.name ? user.name.split(' ')[0] : t('profile')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#205A3B] bg-[#FAF8F2] hover:bg-[#F0EBDD] transition cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE HEADER (md:hidden) */}
        <div className="md:hidden py-2">
          {/* Top row: Brand/logo, Language Toggle, Cart, Profile */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 text-left cursor-pointer shrink-0"
              aria-label="Salem Rice & Maligai Home"
            >
              <div className="w-8 h-8 rounded-lg bg-[#205A3B] p-1 border border-[#CFA13A]/50 flex items-center justify-center shrink-0">
                <img
                  src="/icon.svg"
                  alt="Salem Rice Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-[#16402A] font-heading leading-tight">
                    SALEM RICE
                  </span>
                  <span className="text-[9px] font-bold text-[#CFA13A] uppercase">
                    &amp; MALIGAI
                  </span>
                </div>
                <p className="font-tamil text-[8px] text-[#205A3B] leading-none">
                  சேலம் அரிசி
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Language selector on mobile */}
              <LanguageSelector className="shrink-0" />

              <button
                type="button"
                onClick={() => onNavigate('/cart')}
                className="relative p-2 rounded-lg bg-[#FAF8F2] text-[#16402A] cursor-pointer"
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#CFA13A] text-[#16402A] text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => (user ? onNavigate('/profile') : onNavigate('/login'))}
                className="p-2 rounded-lg bg-[#FAF8F2] text-[#2B2B2B] cursor-pointer"
                aria-label={user ? t('profile') : t('login')}
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Below: Full-width responsive Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Mobile site search"
            className="relative"
          >
            <label htmlFor="mobile-search-input" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <input
              id="mobile-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] pl-9 pr-8 py-2 rounded-xl text-xs outline-hidden text-[#2B2B2B]"
            />
            <Search className="w-3.5 h-3.5 text-[#5A5A5A] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>
        </div>
      </PageContainer>
    </header>
  );
};

export default Header;
