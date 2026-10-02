import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const { login, logout, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated as ADMIN, redirect to /admin/dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      onNavigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success && res.user) {
        if (res.user.role !== 'ADMIN') {
          // Non-admin attempting to log into admin portal -> reject and logout
          await logout();
          setErrorMessage('Access denied. This account does not possess administrator privileges.');
          return;
        }
        onNavigate('/admin/dashboard');
      } else {
        setErrorMessage(res.error || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16402A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#205A3B] border border-[#CFA13A]/50 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-9 h-9 text-[#DFBA5C]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-white">
            Salem Rice &amp; Maligai
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#DFBA5C] font-semibold">
            Admin Management Portal
          </p>
          <p className="text-xs text-emerald-200/80">
            Authorized administrative access only.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-[#205A3B]/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-[#CFA13A]/30">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/60 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@salemrice.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16402A]/80 border border-emerald-600/50 text-white placeholder-emerald-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#CFA13A] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#16402A]/80 border border-emerald-600/50 text-white placeholder-emerald-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#CFA13A] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-300 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#CFA13A] hover:bg-[#DFBA5C] text-[#16402A] font-extrabold text-sm tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#16402A]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

          {/* Secure Return Navigation */}
          <div className="mt-6 pt-5 border-t border-emerald-700/50 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-emerald-300 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
