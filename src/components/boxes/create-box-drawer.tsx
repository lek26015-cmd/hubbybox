'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import { useLiff } from '@/components/providers/liff-provider';
import Image from 'next/image';

interface CreateBoxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBoxCreated: () => void;
}

export function CreateBoxDrawer({ isOpen, onClose, onBoxCreated }: CreateBoxDrawerProps) {
  const [name, setName] = useState('');
  const [locationType, setLocationType] = useState<'home' | 'warehouse'>('home');
  const [homeLocation, setHomeLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dbUser } = useLiff();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!dbUser?.id || dbUser.id === 'fallback-id') {
      alert('ฐานข้อมูลยังไม่พร้อมใช้งานชั่วคราว ขัดข้องที่การซิงค์ User ID (กรุณาไปรันคำสั่ง SQL เพื่อปลดล็อก RLS ใน Supabase ก่อนครับ)');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalLocation = locationType === 'warehouse' ? HUBBYBOX_WAREHOUSE_LOCATION : (homeLocation.trim() || 'ที่บ้าน');
      
      const { error } = await supabase
        .from('boxes')
        .insert({
          user_id: dbUser.id,
          name: name.trim(),
          location: finalLocation
        });

      if (error) throw error;
      
      setName('');
      setHomeLocation('');
      setLocationType('home');
      onBoxCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create box (Full Object):', err);
      console.log('Error Code:', err?.code);
      console.log('Error Details:', err?.details);
      console.log('Error Hint:', err?.hint);
      alert(`เกิดข้อผิดพลาดในการสร้างกล่อง: ${err?.message || 'โปรดตรวจสอบสิทธิ์ (RLS) ในฐานข้อมูล'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-[100] max-w-md mx-auto font-sans"
          >
            <div className="bg-white border-t border-slate-100 rounded-t-3xl p-6 pb-20 shadow-[0_-15px_30px_rgba(0,0,0,0.06)] overflow-y-auto max-h-[90vh]">
              {/* Drag Handle indicator */}
              <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-14 h-14 overflow-hidden shrink-0">
                    <Image 
                      src="/tsconfig-01.png" 
                      alt="HubbyBox" 
                      width={56} 
                      height={56} 
                      className="object-contain w-full h-full"
                    />
                  </div>
                  สร้างกล่องใหม่
                </h2>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-[24px]" aria-hidden="true"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">ชื่อกล่อง / ป้ายกำกับ</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น เสื้อกันหนาว, อุปกรณ์ช่าง..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors text-base font-bold shadow-inner"
                  />
                </div>

                {/* Location Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">สถานที่เก็บกล่อง</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocationType('home')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        locationType === 'home' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <i className="fa-solid fa-house text-lg" aria-hidden="true"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest">ที่บ้าน</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('warehouse')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        locationType === 'warehouse' 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-500' 
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <i className="fa-solid fa-warehouse text-lg" aria-hidden="true"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">คลังกลาง<br/>Hubbybox</span>
                    </button>
                  </div>

                  {locationType === 'home' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <input
                        type="text"
                        value={homeLocation}
                        onChange={(e) => setHomeLocation(e.target.value)}
                        placeholder="ระบุพิกัดในบ้าน (เช่น ห้องพระ, ชั้น 2)"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors text-base font-medium shadow-inner"
                      />
                    </motion.div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className="w-full bg-primary hover:opacity-90 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-base py-4 rounded-xl transition-all shadow-md disabled:shadow-none flex items-center justify-center active:scale-95 mt-4"
                >
                  {isSubmitting ? <i className="fa-solid fa-spinner fa-spin text-[24px]" aria-hidden="true"></i> : 'สร้างกล่อง'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
