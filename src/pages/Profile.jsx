import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import {
  ArrowLeft,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Shield,
  ShoppingBag,
  LogOut,
  Edit3,
  CheckCircle2,
  X,
  Store,
  Globe,
} from 'lucide-react';

export const Profile = ({
  onNavigate = () => {},
  user: propUser,
  onLogout: propLogout,
}) => {
  const auth = useAuth();
  const { t, isTamil, language } = useLanguage();
  const user = propUser || auth?.user;
  const logout = propLogout || auth?.logout;
  const updateProfile = auth?.updateProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditAddress(user.address || '');
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (logout) {
      await logout();
    }
    onNavigate('/login');
  };

  return (
    <div className="w-full py-8 sm:py-12">
      <PageContainer variant="narrow">
        {/* Header Breadcrumb */}
        <div className="space-y-1 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('returnToStore')}</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading">
                {t('myProfile')}
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A5A] mt-0.5">
                {isTamil
                  ? 'உங்கள் கணக்கு விவரங்கள், தொடர்பு தகவல் மற்றும் ஆர்டர்களை நிர்வகிக்கவும்.'
                  : 'Manage your account credentials, contact information and orders.'}
              </p>
            </div>
            {user && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF8F2] text-[#205A3B] border border-[#F0EBDD]">
                {t('customerAccount')}
              </span>
            )}
          </div>
        </div>

        {user ? (
          <div className="space-y-6">
            {/* Primary Profile Card */}
            <div className="rounded-3xl bg-white border border-[#F0EBDD] p-6 sm:p-8 space-y-6 shadow-xs">
              {/* User avatar & summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBDD] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#205A3B] text-white flex items-center justify-center font-extrabold text-2xl shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#16402A] font-heading">
                      {user.name}
                    </h2>
                    <p className="text-xs text-[#5A5A5A] flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-[#205A3B]" />
                      <span>{user.email || 'No email provided'}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16402A] bg-[#FAF8F2] px-2 py-0.5 rounded-md border border-[#F0EBDD]">
                        <Shield className="w-3 h-3 text-[#CFA13A]" />
                        <span>{t('customerAccount')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#205A3B] text-xs font-semibold text-[#205A3B] hover:bg-[#205A3B] hover:text-white transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('editProfile')}</span>
                  </button>
                </div>
              </div>

              {/* Contact & Address Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-1.5">
                  <span className="font-semibold text-[#16402A] block">{t('contactPhone')}</span>
                  <p className="text-[#2B2B2B] font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#CFA13A]" />
                    <span>{user.phone || '8973203053'}</span>
                  </p>
                  <p className="text-[11px] text-[#5A5A5A]">
                    {isTamil ? 'ஆர்டர் விநியோக உறுதிப்படுத்தலுக்கு பயன்படுகிறது' : 'Used for order delivery confirmations'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-1.5">
                  <span className="font-semibold text-[#16402A] block">{t('savedAddress')}</span>
                  <p className="text-[#2B2B2B] font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#CFA13A]" />
                    <span>{user.address || 'Shevapet, Salem - 636002'}</span>
                  </p>
                  <p className="text-[11px] text-[#5A5A5A]">
                    {isTamil ? 'சேலத்தில் முதன்மை டெலிவரி முகவரி' : 'Default shipping destination in Salem'}
                  </p>
                </div>
              </div>

              {/* Dedicated Bilingual Language Preference Section per requirement 6 */}
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-3">
                <div className="flex items-center gap-2 text-[#16402A]">
                  <Globe className="w-4 h-4 text-[#205A3B]" />
                  <span className="font-bold text-xs">{t('languagePreference')}</span>
                </div>
                <LanguageSelector variant="full" />
              </div>

              {/* Action Buttons: My Orders & Logout */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F0EBDD]">
                <button
                  type="button"
                  onClick={() => onNavigate('/orders')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#205A3B] text-white hover:bg-[#16402A] text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('myOrders')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated state fallback */
          <div className="rounded-3xl bg-white border border-[#F0EBDD] p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <UserIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#16402A] font-heading">
              {t('welcomeBack')}
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A5A] max-w-sm mx-auto leading-relaxed">
              {t('loginSubtitle')}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="px-6 py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs"
              >
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="px-6 py-2.5 rounded-xl border border-[#205A3B] text-[#205A3B] hover:bg-[#205A3B]/5 font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                {t('createAccount')}
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-[#F0EBDD] shadow-xl relative animate-scaleUp">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-lg font-bold text-[#16402A] font-heading">
                  {t('editProfile')}
                </h3>
                <p className="text-xs text-[#5A5A5A] mt-0.5">
                  {isTamil ? 'உங்கள் தொடர்பு விவரங்கள் மற்றும் டெலிவரி முகவரியை மாற்றவும்.' : 'Update your contact details and default delivery address.'}
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isTamil ? 'சுயவிவரம் வெற்றிகரமாக மாற்றப்பட்டது!' : 'Profile updated successfully!'}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#16402A]">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] px-3.5 py-2.5 rounded-xl text-xs text-[#2B2B2B] outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#16402A]">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] px-3.5 py-2.5 rounded-xl text-xs text-[#2B2B2B] outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#16402A]">
                    {t('savedAddress')}
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] px-3.5 py-2 rounded-xl text-xs text-[#2B2B2B] outline-hidden resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EBDD]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-[#F0EBDD] text-xs font-semibold text-[#5A5A5A] hover:bg-[#FAF8F2] transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                  >
                    {saving ? t('saving') : t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Profile;
