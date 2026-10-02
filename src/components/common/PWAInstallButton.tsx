import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          id="pwa-install-header-btn"
          onClick={install}
          aria-label="Install Salem Rice & Maligai App"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#16402A] bg-[#DFBA5C] hover:bg-[#CFA13A] transition shadow-xs ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-full-btn"
        onClick={install}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-[#205A3B] hover:bg-[#16402A] transition shadow-sm ${className}`}
      >
        <Download className="w-4 h-4 text-[#DFBA5C]" />
        <span>Install Salem Rice &amp; Maligai App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#205A3B] bg-[#F0EBDD] hover:bg-[#FAF8F2] border border-[#CFA13A]/40 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#CFA13A]" />
          <span>Install App (iOS)</span>
        </button>

        {showIOSGuide && (
          <div
            id="pwa-ios-guide-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#F0EBDD]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBDD]">
                <h3 className="text-base font-bold text-[#16402A]">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-[#2B2B2B]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FAF8F2] text-[#205A3B] font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <p>Open this page in <strong>Safari</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FAF8F2] text-[#205A3B] font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <p>Tap the <strong>Share</strong> button (box with an upward arrow) at the bottom.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FAF8F2] text-[#205A3B] font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <p>Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#205A3B] text-white text-sm font-semibold hover:bg-[#16402A] transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
