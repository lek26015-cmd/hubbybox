'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiff } from '@/components/providers/liff-provider';

export function OnboardingForm() {
  const { refreshDbUser } = useLiff();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !agreed) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/app_site/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      // Success, refresh DB user to get new fields and pass the guard
      await refreshDbUser();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col justify-center items-center p-6 sm:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 w-full max-w-md border border-slate-100"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
          <i className="fa-solid fa-mobile-screen-button text-2xl"></i>
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">ยืนยันข้อมูลผู้ใช้</h2>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          กรุณากรอกเบอร์โทรศัพท์และยอมรับเงื่อนไขการบริการ เพื่อเข้าใช้งาน HubbyBox อย่างเต็มรูปแบบ
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
            <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-bold text-slate-700">เบอร์โทรศัพท์ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <i className="fa-solid fa-phone"></i>
              </div>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800 font-medium text-sm placeholder:text-slate-400"
                placeholder="08X-XXX-XXXX"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary/20 cursor-pointer"
                required
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-slate-700 cursor-pointer select-none">
                ฉันยอมรับ<a href="#" className="text-primary hover:underline ml-1">เงื่อนไขการใช้บริการ</a> และ<a href="#" className="text-primary hover:underline ml-1">นโยบายความเป็นส่วนตัว</a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneNumber || !agreed || phoneNumber.length < 9}
            className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...</>
            ) : (
              <><i className="fa-solid fa-check"></i> ยืนยันข้อมูล</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
