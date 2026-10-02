import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = ({
  message = '',
  type = 'success', // 'success' | 'error' | 'info'
  onClose = () => {},
  duration = 4000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-900/95 text-white border-emerald-700',
      icon: CheckCircle2,
      iconColor: 'text-emerald-300',
    },
    error: {
      bg: 'bg-rose-900/95 text-white border-rose-700',
      icon: AlertCircle,
      iconColor: 'text-rose-300',
    },
    info: {
      bg: 'bg-[#16402A]/95 text-white border-[#CFA13A]/50',
      icon: Info,
      iconColor: 'text-[#DFBA5C]',
    },
  }[type] || {
    bg: 'bg-[#16402A] text-white border-[#205A3B]',
    icon: CheckCircle2,
    iconColor: 'text-emerald-300',
  };

  const Icon = typeConfig.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md ${typeConfig.bg}`}
        role="alert"
      >
        <Icon className={`w-5 h-5 shrink-0 ${typeConfig.iconColor}`} />
        <span className="text-xs sm:text-sm font-medium leading-snug">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-white/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
