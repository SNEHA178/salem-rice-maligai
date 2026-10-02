import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export const Register = ({
  onNavigate = () => {},
}) => {
  const { register, user } = useAuth();
  const { t, isTamil } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in
  if (user) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-[#16402A] font-heading">
              {isTamil ? 'கணக்கு செயலில் உள்ளது' : 'Account Active'}
            </h2>
            <p className="text-xs text-[#5A5A5A]">
              {isTamil ? 'நீங்கள் உள்நுழைந்துள்ள கணக்கு:' : 'You are currently signed in as'}{' '}
              <strong className="text-[#16402A]">{user.name}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full py-2.5 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
              >
                {t('returnToStore')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/profile')}
                className="w-full py-2 rounded-xl border border-[#F0EBDD] text-xs font-semibold text-[#5A5A5A] hover:bg-[#FAF8F2] transition cursor-pointer"
              >
                {t('profile')}
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const validate = () => {
    const errs = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      errs.name = isTamil ? 'முழு பெயர் கட்டாயமாகும்.' : 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = isTamil ? 'சரியான பெயரை உள்ளிடவும்.' : 'Please enter your real full name.';
    }

    // 2. Phone validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = isTamil ? 'தொலைபேசி எண் கட்டாயமாகும்.' : 'Phone number is required.';
    } else if (cleanPhone.length < 10) {
      errs.phone = isTamil ? 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit mobile number.';
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = isTamil ? 'மின்னஞ்சல் முகவரி கட்டாயமாகும்.' : 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.' : 'Please enter a valid email address (e.g. name@gmail.com).';
    }

    // 4. Password validation
    if (!formData.password) {
      errs.password = isTamil ? 'கடவுச்சொல் கட்டாயமாகும்.' : 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = isTamil ? 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.' : 'Password must be at least 6 characters.';
    }

    // 5. Confirm Password validation
    if (!formData.confirmPassword) {
      errs.confirmPassword = isTamil ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்.' : 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match. Please verify both fields.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // STRICT SECURITY: Public registration ALWAYS assigns role = 'CUSTOMER'.
      const res = await register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        address: formData.address.trim() || 'Salem, Tamil Nadu',
      });

      if (res.success && res.user) {
        setSuccessMessage(isTamil ? 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! வருக சேலம் அரிசி & மளிகைக்கு.' : 'Account created successfully! Welcome to Salem Rice & Maligai.');
        setTimeout(() => {
          onNavigate('/');
        }, 600);
      } else {
        setGeneralError(res.error || (isTamil ? 'கணக்கு உருவாக்குவது தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.' : 'Failed to create account. Please check your information.'));
      }
    } catch (err) {
      setGeneralError(isTamil ? 'இணைப்பு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'An unexpected network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-[#F0EBDD] p-6 sm:p-9 shadow-sm">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2.5 mx-auto cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#205A3B] p-2 border border-[#CFA13A]/50 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <img
                  src="/icon.svg"
                  alt="Salem Rice & Maligai"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-base tracking-tight text-[#16402A] font-heading">
                    SALEM RICE
                  </span>
                  <span className="text-[10px] font-bold text-[#CFA13A] tracking-wider uppercase">
                    &amp; MALIGAI
                  </span>
                </div>
                <p className="font-tamil text-[11px] text-[#205A3B] font-medium leading-none">
                  சேலம் அரிசி &amp; மளிகை
                </p>
              </div>
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading tracking-tight">
                {t('createAccount')}
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A5A] mt-1">
                {t('registerSubtitle')}
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {generalError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Field 1: Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold text-[#16402A]"
              >
                {t('fullName')} <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={isTamil ? 'எ.கா. ரமேஷ் குமார்' : 'e.g. Ramesh Kumar'}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  disabled={loading}
                  className={`w-full bg-[#FAF8F2] border ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-[#F0EBDD]'
                  } focus:border-[#205A3B] focus:bg-white pl-10 pr-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60`}
                />
                <User className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-600 font-medium pl-1">{errors.name}</p>
              )}
            </div>

            {/* Grid: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 2: Phone */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-semibold text-[#16402A]"
                >
                  {t('phoneNumber')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder={isTamil ? '10 இலக்க எண்' : '10-digit mobile'}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    disabled={loading}
                    className={`w-full bg-[#FAF8F2] border ${
                      errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-[#F0EBDD]'
                    } focus:border-[#205A3B] focus:bg-white pl-10 pr-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60`}
                  />
                  <Phone className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{errors.phone}</p>
                )}
              </div>

              {/* Field 3: Email */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#16402A]"
                >
                  {t('emailAddress')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={loading}
                    className={`w-full bg-[#FAF8F2] border ${
                      errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-[#F0EBDD]'
                    } focus:border-[#205A3B] focus:bg-white pl-10 pr-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60`}
                  />
                  <Mail className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Grid: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 4: Password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-[#16402A]"
                >
                  {t('password')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder={isTamil ? 'குறைந்தது 6 எழுத்துகள்' : 'Min 6 characters'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    disabled={loading}
                    className={`w-full bg-[#FAF8F2] border ${
                      errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-[#F0EBDD]'
                    } focus:border-[#205A3B] focus:bg-white pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60`}
                  />
                  <Lock className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#16402A] cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{errors.password}</p>
                )}
              </div>

              {/* Field 5: Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-semibold text-[#16402A]"
                >
                  {t('confirmPassword')} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder={isTamil ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Repeat password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    disabled={loading}
                    className={`w-full bg-[#FAF8F2] border ${
                      errors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-[#F0EBDD]'
                    } focus:border-[#205A3B] focus:bg-white pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60`}
                  />
                  <Lock className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#16402A] cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Optional Field: Delivery Locality in Salem */}
            <div className="space-y-1">
              <label
                htmlFor="reg-address"
                className="block text-xs font-semibold text-[#16402A]"
              >
                {t('addressLine')} <span className="text-gray-400 font-normal">({isTamil ? 'விருப்பத்தேர்வு' : 'Optional'})</span>
              </label>
              <div className="relative">
                <input
                  id="reg-address"
                  type="text"
                  placeholder={isTamil ? 'எ.கா. செவ்வாய்பேட்டை, பேர்லேண்ட்ஸ், சேலம்' : 'e.g. Fairlands, Shevapet, Suramangalam'}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading}
                  className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-10 pr-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60"
                />
                <MapPin className="w-4 h-4 text-[#5A5A5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] text-[11px] text-[#5A5A5A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#205A3B] shrink-0" />
              <span>{isTamil ? 'வாடிக்கையாளர் கணக்குகள் கடுமையான பாதுகாப்புடன் பராமரிக்கப்படுகின்றன.' : 'Customer accounts are protected with strict role-based access.'}</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-sm tracking-wide transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('createAccount')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="text-center mt-6 pt-5 border-t border-[#F0EBDD]">
            <p className="text-xs text-[#5A5A5A]">
              {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-bold text-[#205A3B] hover:underline cursor-pointer ml-1"
              >
                {t('login')}
              </button>
            </p>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs text-[#5A5A5A] hover:text-[#16402A] font-medium transition cursor-pointer"
          >
            ← {t('returnToStore')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
