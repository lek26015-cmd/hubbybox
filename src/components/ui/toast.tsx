'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

let toastId = 0;

const ICON_MAP: Record<ToastType, string> = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info',
  warning: 'fa-triangle-exclamation',
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  info: 'bg-primary',
  warning: 'bg-amber-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-6">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto w-full"
            >
              <div
                onClick={() => dismiss(t.id)}
                className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl shadow-slate-900/10 rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className={`w-9 h-9 ${COLOR_MAP[t.type]} rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
                  <i className={`fa-solid ${ICON_MAP[t.type]} text-sm`} aria-hidden="true"></i>
                </div>
                <p className="text-sm font-bold text-slate-700 flex-1 leading-snug">{t.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
