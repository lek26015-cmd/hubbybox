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
        {dbUser ? children : null}
      </div>
    </>
  );
}
