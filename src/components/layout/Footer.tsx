import React from 'react';
import { PageContainer } from './PageContainer';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate = () => {},
}) => {
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
              Authentic Salem rice varieties and pure daily grocery provisions. Pure quality, honest weights, and direct mill rates for household kitchens and commercial stores.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#DFBA5C]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Pure Quality. Everyday Essentials.</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/categories')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/orders')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Information */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              Store Information
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#CFA13A] shrink-0 mt-0.5" />
                <span>14/2, Bazaar Street, Shevapet Market, Salem – 636002, Tamil Nadu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#CFA13A] shrink-0" />
                <a href="tel:9842712345" className="hover:text-white transition">
                  +91 98427 12345
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CFA13A] shrink-0" />
                <span>Mon – Sat: 7:30 AM – 9:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality & Portal Access */}
          <div>
            <h4 className="font-bold text-sm text-[#DFBA5C] mb-3 uppercase tracking-wider font-heading">
              Our Promise
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Direct mill procurement, traditional stone milling, unpolished nutrition, and transparent wholesale pricing.
            </p>
          </div>
        </div>

        {/* Bottom copyright and Tamil slogan */}
        <div className="pt-6 border-t border-[#205A3B] text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Salem Rice &amp; Maligai. All rights reserved.</p>
          <p className="font-tamil text-[11px] text-[#DFBA5C]/90">
            பாரம்பரிய தரம் • நியாயமான விலை • சேலத்தின் பெருமை
          </p>
        </div>
      </PageContainer>
    </footer>
  );
};
