import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const SplashScreen = ({
  onComplete = () => {},
  autoDurationMs = 2400,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / autoDurationMs) * 100));
      setProgress(pct);

      if (elapsed >= autoDurationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [autoDurationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FAF8F2] text-[#2B2B2B] p-6 sm:p-10 select-none">
      {/* Top subtle decorative tag */}
      <div className="w-full flex justify-end">
        <span className="text-[11px] font-semibold tracking-wider text-[#B58A2B] uppercase bg-[#F0EBDD] px-3 py-1 rounded-full border border-[#DFBA5C]/30 flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3 text-[#CFA13A]" />
          <span>EST. 1988 • SALEM</span>
        </span>
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-sm w-full -mt-6">
        {/* Rice / Grain-inspired Visual Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#205A3B] p-4 shadow-xl border-2 border-[#CFA13A] flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
            <img
              src="/icon.svg"
              alt="Salem Rice & Maligai"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          {/* Subtle gold halo glow */}
          <div className="absolute inset-0 rounded-3xl bg-[#CFA13A]/20 blur-xl -z-10" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#16402A] font-heading leading-tight">
          SALEM RICE
        </h1>
        <div className="text-sm sm:text-base font-bold text-[#CFA13A] tracking-widest uppercase mt-0.5 font-heading">
          &amp; MALIGAI
        </div>

        {/* Tamil Brand Subtext */}
        <p className="font-tamil text-sm text-[#205A3B] font-medium mt-2">
          சேலம் அரிசி &amp; மளிகை
        </p>

        {/* Mandatory Tagline */}
        <p className="text-xs sm:text-sm text-[#5A5A5A] mt-3 font-medium tracking-wide">
          "Pure Quality. Everyday Essentials."
        </p>

        {/* Minimal Progress Line */}
        <div className="w-48 h-1 bg-[#F0EBDD] rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#205A3B] via-[#CFA13A] to-[#205A3B] rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Skip/Enter CTA */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3 px-6 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <span>Enter Store</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-gray-400">
          Direct Mill Rice • Wholesale &amp; Retail Provisions
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
