'use client';

import { useLiff } from '@/components/providers/liff-provider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function AppAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, dbUser } = useLiff();

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative">
               <motion.div
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center"
               >
                  <Image src="/logo-hubbybox.png" alt="HubbyBox" width={48} height={48} className="object-contain" />
               </motion.div>
               <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-[2.5rem] animate-spin" />
            </div>
            <div className="mt-8 text-center">
               <h2 className="text-xl font-black text-slate-800 tracking-tight">HubbyBox.</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Connecting to HUB...</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        {dbUser ? children : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center font-sans">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-400 mb-6 shadow-sm border border-rose-100">
              <i className="fa-solid fa-plug-circle-xmark text-[32px]" aria-hidden="true"></i>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">เชื่อมต่อระบบไม่สำเร็จ</h2>
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed mb-4">
              ไม่สามารถซิงค์ข้อมูลผู้ใช้กับระบบหลังบ้านได้<br/>กรุณาลองใหม่อีกครั้ง หรือเข้าใช้งานใหม่ภายหลัง
            </p>
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-8 w-full max-w-xs">
                <p className="text-[10px] font-bold text-rose-500 font-mono break-words">Error: {error.message || JSON.stringify(error)}</p>
              </div>
            )}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
                ลองใหม่อีกครั้ง
              </button>
              <button
                onClick={() => { if (typeof window !== 'undefined') window.location.href = '/'; }}
                className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl active:scale-95 transition-all text-sm"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
