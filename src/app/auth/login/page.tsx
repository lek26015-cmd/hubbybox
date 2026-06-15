'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [liff, setLiff] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    // Clear bypass cookies if any to ensure fresh login
    if (typeof document !== 'undefined') {
      document.cookie = 'hubby_liff_logged_in=; path=/; max-age=0;';
      document.cookie = 'hubby_bypass=; path=/; max-age=0;';
      localStorage.removeItem('hubby_skip_liff');
    }

    import('@line/liff').then((liffModule) => {
      const liffObj = liffModule.default;
      liffObj.init({ 
        liffId: process.env.NEXT_PUBLIC_LIFF_ID || 'YOUR_LIFF_ID_HERE', 
        withLoginOnExternalBrowser: true 
      }).then(() => {
        setLiff(liffObj);
        setIsInit(true);
        if (liffObj.isLoggedIn()) {
           // If they are already logged in, send them back to the app root
           window.location.href = '/';
        }
      }).catch(err => {
        console.error('LIFF init failed', err);
        setIsInit(true);
      });
    });
  }, []);

  const handleLogin = () => {
    if (liff && !liff.isLoggedIn()) {
      setIsLoggingIn(true);
      const redirectUri = window.location.origin + '/';
      liff.login({ redirectUri });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="beam-card p-8 w-full max-w-sm flex flex-col items-center text-center"
      >
        <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-6">
          <Image src="/logo-hubbybox.png" alt="HubbyBox" width={48} height={48} className="object-contain" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">เข้าสู่ระบบ</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          เข้าใช้งาน HubbyBox เพื่อจัดการกล่องเก็บของส่วนตัวของคุณ
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn || !isInit || !liff}
          className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-[18px] rounded-[16px] shadow-[0_4px_12px_rgba(6,199,85,0.3)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
        >
          {isLoggingIn || !isInit ? (
            <><i className="fa-solid fa-spinner fa-spin text-lg"></i> รอสักครู่...</>
          ) : (
            <>
              <i className="fa-brands fa-line text-2xl"></i>
              <span>เข้าสู่ระบบด้วย LINE</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
