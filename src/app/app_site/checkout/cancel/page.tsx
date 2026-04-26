'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-400"></div>
        
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-8 relative">
          <i className="fa-solid fa-xmark text-[48px]" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">ยกเลิกการชำระเงิน</h1>
        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed px-4">
          การทำรายการถูกยกเลิก คุณสามารถลองใหม่อีกครั้งได้ตลอดเวลาครับ 🙏
        </p>

        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            กลับหน้าหลัก
          </Link>
          <button 
            onClick={() => router.back()}
            className="block w-full text-slate-400 font-bold text-xs uppercase tracking-widest pt-2"
          >
            ลองทำรายการใหม่
          </button>
        </div>
      </motion.div>
    </div>
  );
}
