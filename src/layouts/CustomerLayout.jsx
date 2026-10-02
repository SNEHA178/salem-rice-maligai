import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNavigation } from '../components/layout/MobileBottomNavigation';

export const CustomerLayout = ({
  children,
  headerProps,
  footerProps,
  bottomNavProps,
  currentPath = '/',
  onNavigate = () => {},
  cartCount = 0,
  user = null,
  onOpenAuth = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  pricingMode = 'RETAIL',
  onTogglePricingMode,
}) => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FAF8F2] text-[#2B2B2B]">
      {/* 1. Header */}
      <Header
        currentPath={currentPath}
        onNavigate={onNavigate}
        cartCount={cartCount}
        user={user}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        pricingMode={pricingMode}
        onTogglePricingMode={onTogglePricingMode}
        onOpenAuth={onOpenAuth}
        {...headerProps}
      />

      {/* 2. Main Page Content (Responsive, padded for mobile bottom navigation) */}
      <main className="w-full flex-1 pb-20 md:pb-12">
        {children}
      </main>

      {/* 3. Footer */}
      <Footer
        onNavigate={onNavigate}
        {...footerProps}
      />

      {/* 4. Mobile Bottom Navigation */}
      <MobileBottomNavigation
        currentPath={currentPath}
        onNavigate={onNavigate}
        cartCount={cartCount}
        user={user}
        onOpenAuth={onOpenAuth}
        {...bottomNavProps}
      />
    </div>
  );
};

export default CustomerLayout;
