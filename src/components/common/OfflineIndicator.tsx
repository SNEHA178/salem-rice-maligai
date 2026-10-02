import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#2B2B2B] text-[#FAF8F2] px-4 py-2.5 text-xs font-medium shadow-xl border border-[#CFA13A]"
    >
      <WifiOff className="w-4 h-4 text-[#DFBA5C] animate-pulse" />
      <span>Offline Mode — Showing cached rice &amp; grocery catalog.</span>
    </div>
  );
};
