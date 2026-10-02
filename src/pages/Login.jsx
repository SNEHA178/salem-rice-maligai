import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  X,
  Sparkles,
  Store,
  CheckCircle2,
} from 'lucide-react';

export const Login = ({
  onNavigate = () => {},
  redirectUrl = '/',
}) => {
  const { login, user } = useAuth();
  const { t, isTamil } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in, show status & redirect option
  if (user) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-[#16402A] font-heading">
              {isTamil ? 'ஏற்கனவே உள்நுழைந்துள்ளீர்கள்' : 'Already Signed In'}
            </h2>
            <p className="text-xs text-[#5A5A5A]">
              {isTamil ? 'நீங்கள் உள்நுழைந்துள்ள கணக்கு:' : 'You are signed in as'}{' '}
              <strong className="text-[#16402A]">{user.name}</strong> ({user.role}).
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage(isTamil ? 'தொலைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.' : 'Please enter your phone number or email address.');
      return;
    }

    if (!password) {
      setErrorMessage(isTamil ? 'கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(cleanId, password);
      if (res.success && res.user) {
        setSuccessMessage(isTamil ? 'உள்நுழைவு வெற்றிகரமானது! வழிமாற்றப்படுகிறது...' : 'Login successful! Redirecting...');
        setTimeout(() => {
          const target = (redirectUrl && redirectUrl !== '/admin' && redirectUrl !== '/login') 
            ? redirectUrl 
            : '/';
          onNavigate(target);
        }, 400);
      } else {
        setErrorMessage(res.error || (isTamil ? 'தவறான விவரங்கள். தயவுசெய்து சரிபார்க்கவும்.' : 'Invalid credentials. Please verify and try again.'));
      }
    } catch (err) {
      setErrorMessage(isTamil ? 'இணைப்பு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'Unable to connect to the authentication service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[#F0EBDD] p-6 sm:p-9 shadow-sm">
          {/* Header Brand */}
          <div className="text-center space-y-3 mb-7">
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
                {t('welcomeBack')}
              </h1>
              <p className="text-xs sm:text-sm text-[#5A5A5A] mt-1">
                {t('loginSubtitle')}
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="font-bold text-rose-600 mt-0.5">•</span>
              <span className="flex-1 leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Field 1: Phone or Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-identifier"
                className="block text-xs font-semibold text-[#16402A]"
              >
                {t('phoneOrEmail')}
              </label>
              <div className="relative">
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder={isTamil ? 'எ.கா. 9876543210 அல்லது name@gmail.com' : 'e.g. 9876543210 or yourname@gmail.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-10 pr-3.5 py-3 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] pointer-events-none">
                  {identifier.includes('@') ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#16402A]"
                >
                  {t('password')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#205A3B] hover:text-[#16402A] hover:underline cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder={isTamil ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your account password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] focus:bg-white pl-10 pr-11 py-3 rounded-2xl text-xs sm:text-sm text-[#2B2B2B] outline-hidden transition placeholder:text-gray-400 disabled:opacity-60"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#16402A] cursor-pointer p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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
                    <span>{t('signingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('login')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0EBDD]" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-[#5A5A5A] uppercase tracking-wider">
              {t('newToSalem')}
            </span>
          </div>

          {/* Create Account Secondary Button */}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="w-full py-3 px-4 rounded-2xl border-2 border-[#205A3B] text-[#205A3B] hover:bg-[#205A3B]/5 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t('createAccount')}</span>
          </button>
        </div>

        {/* Back to store navigation */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs text-[#5A5A5A] hover:text-[#16402A] font-medium transition cursor-pointer inline-flex items-center gap-1"
          >
            ← {t('returnToStore')}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-[#F0EBDD] shadow-xl relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#16402A] font-heading">
                {t('forgotPassword')}
              </h3>
              <p className="text-xs text-[#5A5A5A] mt-1 leading-relaxed">
                {isTamil
                  ? 'பாதுகாப்பு காரணங்களுக்காக கடவுச்சொல் மாற்றம் எங்கள் கடை உதவி எண் மூலம் கையாளப்படுகிறது.'
                  : 'For security reasons, direct password resets are handled via our store helpline.'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#16402A] font-semibold">
                <Store className="w-4 h-4 text-[#CFA13A]" />
                <span>Salem Rice &amp; Maligai</span>
              </div>
              <p className="text-[#5A5A5A]">
                {t('phone')}: <strong className="text-[#16402A]">8973203053</strong>
              </p>
              <p className="text-[#5A5A5A]">
                {t('altPhone')}: <strong className="text-[#16402A]">8946071718</strong>
              </p>
              <p className="text-[#5A5A5A]">
                {t('address')}: Shevapet, Salem - 636002
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
            >
              {isTamil ? 'மூடு' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
