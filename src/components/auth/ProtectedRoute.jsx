import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component for role-based access control.
 * Supports:
 * - Authenticated users only (redirects to /login if unauthenticated)
 * - Admin-only routes (redirects to /unauthorized or home if non-admin)
 * - Customer-only routes
 * - Custom role lists
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredRole,
  onNavigate = () => {},
  currentPath = window.location.pathname,
  fallback = null,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // 1. Loading state: Show clean branded loader while auth session is initializing
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#205A3B] p-2 flex items-center justify-center shadow-md animate-pulse">
            <img src="/icon.svg" alt="Salem Rice" className="w-10 h-10 object-contain" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
            <Loader2 className="w-4 h-4 text-[#CFA13A] animate-spin" />
          </div>
        </div>
        <p className="text-sm font-semibold text-[#16402A]">Verifying Account Security...</p>
        <p className="text-xs text-[#5A5A5A] mt-1">Salem Rice &amp; Maligai</p>
      </div>
    );
  }

  // 2. Unauthenticated check: Redirect to login with return redirect parameter
  if (!isAuthenticated || !user) {
    if (fallback) return fallback;

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
            <img src="/icon.svg" alt="Salem Rice" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#16402A] font-heading">
              Authentication Required
            </h2>
            <p className="text-xs text-[#5A5A5A] mt-1.5 leading-relaxed">
              Please sign in with your phone or email to access this page.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate(`/login?redirect=${encodeURIComponent(currentPath)}`)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              Sign In to Continue
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full py-2 px-4 rounded-xl border border-[#F0EBDD] hover:bg-[#FAF8F2] text-xs font-semibold text-[#5A5A5A] transition cursor-pointer"
            >
              Return to Store Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine allowed roles
  const effectiveRoles = allowedRoles || (requiredRole ? [requiredRole] : null);

  // 3. Role authorization check
  if (effectiveRoles && effectiveRoles.length > 0) {
    const userRole = user.role || 'CUSTOMER';
    const isAuthorized = effectiveRoles.includes(userRole);

    if (!isAuthorized) {
      if (fallback) return fallback;

      // Logged in user attempting unauthorized access (e.g. CUSTOMER trying /admin)
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#16402A] font-heading">
                Access Restricted
              </h2>
              <p className="text-xs text-[#5A5A5A] mt-2 leading-relaxed">
                Your account ({user.email || user.phone}) does not have permission to access this page. This area is reserved for store administrators.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Go to Home
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/profile')}
                className="w-full py-2 px-4 rounded-xl border border-[#F0EBDD] hover:bg-[#FAF8F2] text-xs font-semibold text-[#205A3B] transition cursor-pointer"
              >
                View My Profile
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
