'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        
        <h1 className="text-2xl font-black text-white mb-4">เข้าสู่ระบบไม่สำเร็จ</h1>
        <p className="text-slate-400 font-medium leading-relaxed mb-10">
          ขออภัยครับ ระบบไม่สามารถยืนยันตัวตนได้ในขณะนี้ <br/>
          รหัสยืนยัน (Auth Code) อาจหมดอายุ หรือการเชื่อมต่อผิดพลาด
        </p>

        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full bg-white text-slate-950 font-black py-4 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
          >
            ลองใหม่อีกครั้ง
          </Link>
          <Link 
            href="https://hubbybox.app" 
            className="block w-full bg-slate-800 text-slate-300 font-black py-4 rounded-xl hover:bg-slate-700 transition-all active:scale-95"
          >
            กลับหน้าหลัก
          </Link>
        </div>

        <p className="mt-10 text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
          Error: AUTH_CODE_EXCHANGE_FAILED
        </p>
      </motion.div>
    </div>
  );
}
