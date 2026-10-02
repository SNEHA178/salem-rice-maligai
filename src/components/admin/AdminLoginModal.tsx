import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (user: User) => void;
  onAdminLoginApi: (data: { email: string; password?: string; adminSecret?: string }) => Promise<User>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onAdminLoginApi,
}) => {
  const [email, setEmail] = useState('admin@salemricestore.com');
  const [password, setPassword] = useState('salemadmin2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await onAdminLoginApi({
        email: email.trim(),
        password: password.trim(),
        adminSecret: password.trim(),
      });
      if (user.role !== 'ADMIN') {
        throw new Error('Unauthorized. This account does not possess Admin privileges.');
      }
      onAdminLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAccount = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('salemadmin2026');
  };

  return (
    <div
      id="admin-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#16402A] text-white rounded-3xl shadow-2xl border border-[#CFA13A]/50 overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#205A3B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#205A3B] p-1.5 border border-[#CFA13A] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#DFBA5C]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide font-heading text-white">
                Admin Management Portal
              </h3>
              <p className="text-[11px] text-[#DFBA5C]">Authorized Personnel Only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#205A3B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-[#205A3B]/50 border border-[#205A3B] text-xs text-gray-200">
            <p className="font-semibold text-[#DFBA5C] mb-1">Store Owner &amp; Admin Accounts:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAccount('admin@salemricestore.com')}
                className="px-2.5 py-1 rounded-lg bg-[#16402A] hover:bg-[#205A3B] text-[11px] font-mono border border-[#CFA13A]/40 text-white"
              >
                1. Main Admin
              </button>
              <button
                type="button"
                onClick={() => setAccount('father@salemricestore.com')}
                className="px-2.5 py-1 rounded-lg bg-[#16402A] hover:bg-[#205A3B] text-[11px] font-mono border border-[#CFA13A]/40 text-white"
              >
                2. Father / Store Owner
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-900/60 border border-red-500 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#205A3B] bg-[#205A3B]/40 focus:border-[#DFBA5C] text-sm text-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1">
                Admin Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#205A3B] bg-[#205A3B]/40 focus:border-[#DFBA5C] text-sm text-white outline-hidden"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#DFBA5C] hover:bg-[#CFA13A] disabled:bg-gray-600 text-[#16402A] font-extrabold text-sm transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Authenticate & Open Dashboard'}</span>
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center">
            Role checking protects all product updates, wholesale pricing, and order dispatch workflows.
          </p>
        </div>
      </div>
    </div>
  );
};
