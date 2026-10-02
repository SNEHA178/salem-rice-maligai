import React from 'react';
import { PageContainer } from './PageContainer';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = ({
  onNavigate = () => {},
}) => {
  const { t, isTamil } = useLanguage();

  return (
    <footer className="bg-[#16402A] text-[#FAF8F2] pt-12 pb-24 md:pb-12 border-t border-[#205A3B] mt-auto">
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Message */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#205A3B] p-1 border border-[#CFA13A]">
                <img src="/icon.svg" alt="Salem Rice Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide font-heading text-white">
                  SALEM RICE
                </h3>
                <p className="text-xs font-semibold text-[#DFBA5C] uppercase">
                  &amp; Maligai
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              {isTamil
                ? 'அசல் சேலம் ஆலை அரிசி ரகங்கள் மற்றும் தூய அன்றாட மளிகைப் பொருட்கள். கலப்படமில்லா தரம், துல்லியமான எடை, நேரடி ஆலை விலை.'
                : 'Authentic Salem rice varieties and pure daily grocery provisions. Pure quality, honest weights, and direct mill rates for household kitchens and commercial stores.'}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#DFBA5C]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isTamil ? 'தூய தரம். அன்றாட அத்தியாவசியம்.' : 'Pure Quality. Everyday Essentials.'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  {t('home')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/categories')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  {t('categories')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  {t('products')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/orders')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  {t('orders')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  {t('profile')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Information */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              {t('storeInfo')}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#CFA13A] shrink-0 mt-0.5" />
                <span>Shevapet, Salem - 636002</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#CFA13A] shrink-0" />
                <a href="tel:8973203053" className="hover:text-white transition">
                  8973203053
                </a>
                <span className="text-gray-400">/</span>
                <a href="tel:8946071718" className="hover:text-white transition">
                  8946071718
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CFA13A] shrink-0" />
                <span>{t('workingHours')}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality & Promise */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              {t('ourPromise')}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {isTamil
                ? 'நேரடி ஆலை கொள்முதல், பாரம்பரிய மரச்செக்கு ஆட்டுதல், தீட்டப்படாத இயற்கை ஊட்டச்சத்து, வெளிப்படையான மொத்த மற்றும் சில்லறை விலை.'
                : 'Direct mill procurement, traditional stone milling, unpolished nutrition, and transparent wholesale pricing.'}
            </p>
          </div>
        </div>

        {/* Bottom copyright and Tamil slogan */}
        <div className="pt-6 border-t border-[#205A3B] text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Salem Rice &amp; Maligai. {t('allRightsReserved')}</p>
          <p className="font-tamil text-[11px] text-[#DFBA5C]/90">
            சேலம் பாரம்பரிய அரிசி மற்றும் தூய மளிகைப் பொருட்கள்
          </p>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
