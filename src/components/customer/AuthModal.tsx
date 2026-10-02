import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, Building2, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onLoginApi: (data: { email: string; password?: string; phone?: string; role?: string }) => Promise<User>;
  onRegisterApi: (data: any) => Promise<User>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLoginApi,
  onRegisterApi,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await onLoginApi({ email, password });
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !phone) {
      setError('Please provide your name and phone number.');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await onRegisterApi({
        name,
        email: email || `${phone}@salemricestore.com`,
        phone,
        password: password || 'customer123',
        businessName: businessName || undefined,
        address: address || undefined,
        city: 'Salem',
        pincode: '636001',
      });
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail('karthik@example.com');
    setPassword('customer123');
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#FAF8F2] border-b border-[#F0EBDD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#205A3B] p-1.5 flex items-center justify-center">
              <img src="/icon.svg" alt="Salem Rice" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#16402A] font-heading">
                Salem Rice &amp; Maligai
              </h3>
              <p className="text-[11px] text-[#5A5A5A]">Customer Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#F0EBDD] bg-white">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              tab === 'login'
                ? 'border-[#205A3B] text-[#205A3B]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Customer Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              tab === 'register'
                ? 'border-[#205A3B] text-[#205A3B]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            New Registration
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Email or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter email or registered phone"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#205A3B] hover:bg-[#16402A] disabled:bg-gray-400 text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In'}
              </button>

              {/* Demo button */}
              <button
                type="button"
                onClick={fillCustomerDemo}
                className="w-full py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#F0EBDD] text-[#205A3B] text-xs font-semibold border border-[#CFA13A]/30 transition"
              >
                Fill Customer Demo Credentials
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meena Sundaram"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs bg-[#FAF8F2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Email (Opt)</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs bg-[#FAF8F2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Business / Hotel Name (If buying Wholesale)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salem Chettinad Mess"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Salem address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer mt-2"
              >
                {isSubmitting ? 'Registering...' : 'Create Customer Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
