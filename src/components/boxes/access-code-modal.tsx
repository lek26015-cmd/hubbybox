'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AccessCodeModalProps {
  isOpen: boolean;
  accessCode: string | null;
  onClose: () => void;
}

export function AccessCodeModal({ isOpen, accessCode, onClose }: AccessCodeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-10 text-center shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="bg-sky-50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-sky-500 mx-auto mb-8 shadow-inner">
              <i className="fa-solid fa-key text-3xl" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
              รหัสผ่านสำหรับเจ้าหน้าที่
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10 px-4">
              แจ้งรหัสนี้ให้เจ้าหน้าที่เพื่ออนุญาตให้เปิดกล่องและจัดการของด้านในได้ชั่วคราว
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 mb-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors" />
              <span className="text-5xl font-bold text-primary tracking-[0.1em] drop-shadow-sm tabular-nums">
                {accessCode}
              </span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                <i className="fa-solid fa-clock-rotate-left fa-spin-reverse" aria-hidden="true" />
                Valid for 15 minutes
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
