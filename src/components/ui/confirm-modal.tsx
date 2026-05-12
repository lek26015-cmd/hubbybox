'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (title: string, message: string, defaultValue?: string) => Promise<string | null>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
  prompt: () => Promise.resolve(null),
});

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { resolve: (v: boolean) => void }) | null
  >(null);

  const [promptState, setPromptState] = useState<
    { title: string; message: string; defaultValue: string; resolve: (v: string | null) => void } | null
  >(null);

  const [promptValue, setPromptValue] = useState('');

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const prompt = useCallback((title: string, message: string, defaultValue = '') => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(defaultValue);
      setPromptState({ title, message, defaultValue, resolve });
    });
  }, []);

  const handleConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const handlePromptSubmit = () => {
    promptState?.resolve(promptValue);
    setPromptState(null);
  };

  const handlePromptCancel = () => {
    promptState?.resolve(null);
    setPromptState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => handleConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-white/50 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ${
                confirmState.variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'
              }`}>
                <i className={`fa-solid ${confirmState.variant === 'danger' ? 'fa-trash-can' : 'fa-circle-question'} text-2xl`} aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmState.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 px-2">{confirmState.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl active:scale-95 transition-all"
                >
                  {confirmState.cancelLabel || 'ยกเลิก'}
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all ${
                    confirmState.variant === 'danger'
                      ? 'bg-rose-500 shadow-rose-500/20'
                      : 'bg-primary shadow-primary/20'
                  }`}
                >
                  {confirmState.confirmLabel || 'ยืนยัน'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prompt Modal */}
      <AnimatePresence>
        {promptState && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handlePromptCancel}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-white/50"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">{promptState.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 text-center px-2">{promptState.message}</p>
              <input
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePromptSubmit(); }}
                autoFocus
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 text-slate-800 font-bold focus:outline-none focus:border-primary/30 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePromptCancel}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl active:scale-95 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePromptSubmit}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  ตกลง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
