'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/components/auth/admin-auth-provider';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const { signInWithPasscode } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const passcode = (document.getElementById('passcode-input') as HTMLInputElement)?.value;
    if (!passcode) {
      setError('กรุณาใส่รหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await signInWithPasscode(passcode);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vora-accent/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-vora-accent/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-3xl border border-slate-800 p-10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/5 mb-6">
            <Image 
              src="/tsconfig-01.png" 
              alt="HubbyBox" 
              width={40} 
              height={40} 
              className="object-contain" 
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">HubbyBox. Admin</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Management System Portal</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              ยินดีต้อนรับเข้าสู่ระบบจัดการ HubbyBox คลังสินค้าอัจฉริยะ<br/>
              กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-xs font-bold">
              <i className="fa-solid fa-triangle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
             <input 
               type="password" 
               placeholder="รหัสผ่าน (Passcode)" 
               id="passcode-input"
               className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 font-bold text-white placeholder-slate-600 focus:border-vora-accent focus:outline-none transition-all text-center tracking-[0.2em]"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') handleLogin();
               }}
             />
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-vora-accent text-white font-black py-4 rounded-xl flex items-center justify-center gap-4 transition-all active:scale-95 group shadow-xl shadow-vora-accent/20"
            >
              {isLoading ? (
                <i className="fa-solid fa-spinner fa-spin text-xl" />
              ) : (
                <>
                  <i className="fa-solid fa-unlock text-xl" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="w-8 h-1 bg-slate-800 rounded-full" />
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Authorized Access Only</p>
        </div>
      </motion.div>

      {/* Version Tag */}
      <div className="absolute bottom-6 right-6">
         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">HubbyBox v2.0.4</span>
      </div>
    </div>
  );
}
