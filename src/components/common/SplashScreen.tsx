import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Keep splash snappy and elegant (1.8 seconds)
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      id="salem-splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F2] px-6 select-none overflow-hidden"
    >
      {/* Subtle Background Radial Aura */}
      <div className="absolute w-96 h-96 rounded-full bg-[#DFBA5C]/15 blur-3xl pointer-events-none" />

      {/* Brand Icon & Rice Grain Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6 flex items-center justify-center"
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#205A3B] p-4 shadow-xl border-2 border-[#CFA13A]/50 flex items-center justify-center">
          <img
            src="/icon.svg"
            alt="Salem Rice & Maligai Icon"
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#16402A] font-heading">
          SALEM RICE
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#B58A2B] mt-0.5 uppercase">
          &amp; Maligai
        </p>
        <p className="font-tamil text-xs text-[#205A3B] font-medium mt-1">
          சேலம் அரிசி &amp; மளிகை
        </p>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-6 text-sm text-[#5A5A5A] font-medium tracking-wide text-center max-w-xs"
      >
        Pure Quality. Everyday Essentials.
      </motion.p>

      {/* Refined Progress Bar */}
      <motion.div
        className="mt-8 h-1 w-32 bg-[#F0EBDD] rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-linear-to-r from-[#205A3B] via-[#CFA13A] to-[#205A3B]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Skip button for immediate entry */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 text-xs text-[#5A5A5A] hover:text-[#16402A] underline underline-offset-4 cursor-pointer transition"
      >
        Enter Store &rarr;
      </button>
    </motion.div>
  );
};
