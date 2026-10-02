import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomerLayout } from './layouts/CustomerLayout';
import { SplashScreen } from './pages/SplashScreen';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { AdminTab } from './layouts/AdminLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { PricingProvider, usePricing } from './context/PricingContext';
import { LanguageProvider } from './context/LanguageContext';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { addToCart, getCartCount } = useCart();
  const { user, logout, loading } = useAuth();
  const { pricingMode, togglePricingMode } = usePricing();

  // 1. App Lifecycle: Splash Screen (Phase 1 preserved)
  const [showSplash, setShowSplash] = useState(true);

  // 2. Routing Foundation supporting path params & query strings:
  // e.g. /, /categories, /products, /products?category=rice, /products/prod_1, /cart, /checkout, /login, /register, /profile, /admin, /unauthorized
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const full = window.location.pathname + window.location.search;
      return full || '/';
    }
    return '/';
  });

  const navigate = useCallback((path: string) => {
    setCurrentRoute(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const full = window.location.pathname + window.location.search;
      setCurrentRoute(full || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse path and query params
  const { pathname, searchParams } = useMemo(() => {
    const parts = currentRoute.split('?');
    const path = parts[0] || '/';
    const query = parts[1] || '';
    const params = new URLSearchParams(query);
    return { pathname: path, searchParams: params };
  }, [currentRoute]);

  // Check if route is a product detail view (/products/:id)
  const productDetailId = useMemo(() => {
    if (pathname.startsWith('/products/') && pathname.length > '/products/'.length) {
      return pathname.replace('/products/', '');
    }
    return null;
  }, [pathname]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Keep search state in sync when URL changes
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const handleAddToCart = useCallback((product: any, quantity: number = 1, mode?: string) => {
    addToCart(product, quantity, mode || pricingMode);
  }, [addToCart, pricingMode]);

  // Splash Screen view
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
        autoDurationMs={1800}
      />
    );
  }

  // Branded Loading State during auth verification
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-3xl bg-[#205A3B] p-3 flex items-center justify-center shadow-lg border border-[#CFA13A]/50 animate-pulse">
            <img src="/icon.svg" alt="Salem Rice & Maligai" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
            <Loader2 className="w-4 h-4 text-[#CFA13A] animate-spin" />
          </div>
        </div>
        <h2 className="text-lg font-extrabold text-[#16402A] font-heading">SALEM RICE &amp; MALIGAI</h2>
        <p className="text-xs text-[#5A5A5A] mt-1">Initializing secure session...</p>
      </div>
    );
  }

  // Private Admin Routes
  if (pathname === '/admin') {
    if (!user) {
      return <AdminLogin onNavigate={navigate} />;
    }
    if (user.role === 'ADMIN') {
      return (
        <Admin
          initialTab="dashboard"
          onReturnToStore={() => navigate('/')}
          onNavigate={navigate}
        />
      );
    }
    // Authenticated as CUSTOMER -> deny access
    return <Unauthorized onNavigate={navigate} />;
  }

  if (pathname.startsWith('/admin/')) {
    if (!user) {
      return <AdminLogin onNavigate={navigate} />;
    }
    if (user.role !== 'ADMIN') {
      return <Unauthorized onNavigate={navigate} />;
    }

    let tab: AdminTab = 'dashboard';
    if (pathname === '/admin/products') tab = 'products';
    else if (pathname === '/admin/categories') tab = 'categories';
    else if (pathname === '/admin/orders') tab = 'orders';
    else if (pathname === '/admin/customers') tab = 'customers';
    else if (pathname === '/admin/ads' || pathname === '/admin/advertisements') tab = 'advertisements';
    else if (pathname === '/admin/settings') tab = 'settings';

    return (
      <Admin
        initialTab={tab}
        onReturnToStore={() => navigate('/')}
        onNavigate={navigate}
      />
    );
  }

  const categoryParam = searchParams.get('category') || 'all';

  return (
    <CustomerLayout
      currentPath={pathname}
      onNavigate={navigate}
      cartCount={getCartCount()}
      user={user}
      onOpenAuth={() => navigate('/login')}
      pricingMode={pricingMode}
      onTogglePricingMode={togglePricingMode}
      searchQuery={searchQuery}
      onSearchChange={q => {
        setSearchQuery(q);
        if (pathname === '/products') {
          const url = q ? `/products?search=${encodeURIComponent(q)}` : '/products';
          window.history.replaceState({}, '', url);
        }
      }}
    >
      {/* Route / : Home */}
      {pathname === '/' && (
        <Home
          onNavigate={navigate}
          pricingMode={pricingMode}
          onTogglePricingMode={togglePricingMode}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Route /categories : Categories */}
      {pathname === '/categories' && (
        <Categories onNavigate={navigate} />
      )}

      {/* Route /products/:id : Product Details */}
      {productDetailId && (
        <ProductDetails
          productId={productDetailId}
          onNavigate={navigate}
          pricingMode={pricingMode}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Route /products : Products Listing with Filters */}
      {!productDetailId && pathname === '/products' && (
        <Products
          onNavigate={navigate}
          pricingMode={pricingMode}
          onAddToCart={handleAddToCart}
          initialCategory={categoryParam}
          initialSearch={searchQuery}
        />
      )}

      {/* Route /cart : Cart */}
      {pathname === '/cart' && (
        <Cart onNavigate={navigate} pricingMode={pricingMode} />
      )}

      {/* Route /checkout : Checkout */}
      {pathname === '/checkout' && (
        <Checkout onNavigate={navigate} />
      )}

      {/* Route /orders : Orders */}
      {pathname === '/orders' && (
        <Orders onNavigate={navigate} />
      )}

      {/* Route /profile : Profile (Role Protected: CUSTOMER or ADMIN) */}
      {pathname === '/profile' && (
        <ProtectedRoute
          allowedRoles={['CUSTOMER', 'ADMIN']}
          onNavigate={navigate}
          currentPath="/profile"
        >
          <Profile
            onNavigate={navigate}
            user={user}
            onLogout={logout}
            onOpenAuth={() => navigate('/login')}
          />
        </ProtectedRoute>
      )}

      {/* Route /login : Login Page */}
      {pathname === '/login' && (
        <Login
          onNavigate={navigate}
          redirectUrl={searchParams.get('redirect') || '/'}
        />
      )}

      {/* Route /register : Register Page */}
      {pathname === '/register' && (
        <Register
          onNavigate={navigate}
        />
      )}

      {/* Route /unauthorized : Unauthorized Page */}
      {pathname === '/unauthorized' && (
        <Unauthorized
          onNavigate={navigate}
        />
      )}
    </CustomerLayout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PricingProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </PricingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
