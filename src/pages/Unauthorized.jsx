import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ShieldAlert, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Unauthorized = ({
  onNavigate = () => {},
}) => {
  const { user, logout } = useAuth();
  const { t, isTamil } = useLanguage();

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4">
      <PageContainer variant="narrow">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 sm:p-10 text-center space-y-6 shadow-xs">
          {/* Visual Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading & Notice */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
              {isTamil ? 'அனுமதி தேவை' : 'Authorization Required'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading pt-1">
              {t('accessRestricted')}
            </h1>
            <p className="text-sm text-[#5A5A5A] leading-relaxed">
              {t('unauthorizedMessage')}
            </p>
          </div>

          {/* User badge */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] text-left text-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#205A3B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#16402A] truncate">{user.name}</p>
                <p className="text-[#5A5A5A] truncate text-[11px]">{user.email || user.phone}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#F0EBDD] text-[#16402A] font-semibold text-[10px] shrink-0">
                {user.role || 'CUSTOMER'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>{t('goToHome')}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                onNavigate('/login');
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#F0EBDD] hover:bg-[#FAF8F2] text-xs font-semibold text-[#5A5A5A] transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('switchAccount')}</span>
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default Unauthorized;
