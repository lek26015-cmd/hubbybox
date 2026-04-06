'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/components/providers/liff-provider';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecallBoxPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const boxId = unwrappedParams.id;
  
  const [box, setBox] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const { dbUser, isLoading: isLiffLoading } = useLiff();

  useEffect(() => {
    async function fetchBox() {
      if (isLiffLoading) return;
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('boxes')
          .select('*')
          .eq('id', boxId)
          .single();
          
        if (error || !data) throw new Error('Box not found');
        
        // Ownership Check
        if (dbUser && data.user_id !== dbUser.id) {
           router.push('/');
           return;
        }

        if (data.location !== HUBBYBOX_WAREHOUSE_LOCATION) {
           // Not in warehouse, nothing to recall
           router.push(`/box/${boxId}`);
           return;
        }

        setBox(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBox();
  }, [boxId, dbUser, isLiffLoading, router]);

  const handleConfirmRecall = async () => {
    if (isSubmitting || !box) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('boxes')
        .update({ 
          status: 'returning',
          location: 'กำลังส่งคืน' // Temporary status-like location
        })
        .eq('id', boxId);

      if (error) throw error;
      setStep(2);
    } catch (err: any) {
      console.error('Recall error:', err);
      alert('เรียกคืนไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
     return (
        <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4 font-sans text-slate-400 font-bold uppercase tracking-widest text-xs">
           <i className="fa-solid fa-spinner fa-spin text-primary text-[48px]" aria-hidden="true"></i>
           <span>กำลังจัดเตรียมข้อมูล...</span>
        </div>
     );
  }

  if (!box) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => step === 1 ? router.back() : router.push(`/box/${boxId}`)}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-arrow-left text-sm" aria-hidden="true"></i>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">เรียกกล่องคืน</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             {step === 1 ? 'ยืนยันการเรียกคืน' : 'แจ้งรับเรื่องสำเร็จ'}
          </p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto p-6 pt-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Box Preview */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150 transition-transform duration-1000 group-hover:rotate-45">
                    <i className="fa-solid fa-parachute-box text-[100px]" aria-hidden="true"></i>
                 </div>
                 
                 <div className="w-24 h-24 rounded-3xl border-4 border-slate-50 overflow-hidden shadow-inner mb-6 relative z-10 bg-slate-50 flex items-center justify-center text-slate-200">
                    {box.cover_image_url ? (
                      <Image src={box.cover_image_url} alt={box.name} fill className="object-cover" />
                    ) : (
                      <i className="fa-solid fa-box-open text-4xl" aria-hidden="true"></i>
                    )}
                 </div>
                 
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{box.name}</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{boxId.substring(0, 8).toUpperCase()}</p>
                 
                 <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                    <i className="fa-solid fa-warehouse" aria-hidden="true"></i>
                    Stored in Warehouse
                 </div>
              </div>

              {/* Fee & Delivery Info */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
                 <div className="absolute -bottom-6 -right-6 p-4 opacity-10 rotate-[-15deg] scale-125">
                    <i className="fa-solid fa-truck-fast text-[120px]" aria-hidden="true"></i>
                 </div>

                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-sky-400 border border-white/20">
                       <i className="fa-solid fa-credit-card text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                       <h4 className="font-bold text-lg">ค่าบริการจัดส่งคืน</h4>
                       <p className="text-sky-400 font-black text-2xl tracking-tighter">150.- <span className="text-xs text-white/50 font-bold tracking-normal italic">Fixed Rate</span></p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                    <div className="flex gap-4 items-start">
                       <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0"></div>
                       <p className="text-sm text-white/70 font-medium leading-relaxed">
                          ทีมงานจะจัดส่งกล่องคืนให้ผ่าน <span className="text-white font-bold underline decoration-sky-400">Hubby Express</span> หรือขนส่งเอกชนยอดนิยม
                       </p>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0"></div>
                       <p className="text-sm text-white/70 font-medium leading-relaxed">
                          คุณจะได้รับข้อมูลการติดตามพัสดุ (Tracking) ทันทีที่ของเริ่มออกจากคลัง
                       </p>
                    </div>
                 </div>
              </div>

              {/* Address Review */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">ที่อยู่รับของคืน</h4>
                      <p className="text-slate-400 font-medium text-xs mt-0.5 italic">จัดส่งตามข้อมูลที่ลงทะเบียนไว้แรกเริ่ม</p>
                    </div>
                    <i className="fa-solid fa-location-dot text-rose-500" aria-hidden="true"></i>
                 </div>
                 
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                       เลขที่ 123/456 หมู่บ้านฮับบี้ หมู่ 7 แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900
                    </p>
                 </div>
                 <p className="text-[10px] text-center text-slate-400 font-bold px-2">
                    * ต้องการเปลี่ยนที่อยู่จัดส่ง? กรุณาแจ้ง Admin ผ่านแชทก่อนกดยืนยันครับ
                 </p>
              </div>

              {/* Final Confirm */}
              <button
                onClick={handleConfirmRecall}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/95 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 border-b-4 border-black/10 outline-none"
              >
                {isSubmitting ? (
                   <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                ) : (
                   <>
                     ยืนยันเรียกคืนกล่องนี้ <i className="fa-solid fa-chevron-right text-sm" aria-hidden="true"></i>
                   </>
                )}
              </button>

              <button 
                onClick={() => router.back()}
                className="w-full text-center py-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิกและย้อนกลับ
              </button>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div
               key="step2"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center space-y-10 pt-10"
             >
               <div className="relative">
                 <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                    className="w-40 h-40 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white shadow-2xl shadow-green-200"
                 >
                   <i className="fa-solid fa-truck-ramp-box text-[80px]" aria-hidden="true"></i>
                 </motion.div>
                 <div className="absolute inset-0 bg-green-300 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
               </div>

               <div>
                 <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">ขอบคุณที่ใช้บริการครับ!</h2>
                 <p className="text-slate-500 font-medium leading-relaxed px-6 text-lg">
                   ทีมงานได้รับคำร้องเรียกคืนเรียบร้อยแล้ว<br/>เราจะรีบตรวจสอบและจัดเตรียมการส่งคืน<br/>ให้ถึงหน้าบ้านท่านโดยเร็วที่สุดครับ
                 </p>
               </div>

               <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mx-4">
                  <p className="text-sm text-indigo-600 font-bold">
                     ท่านสามารถเช็กสถานะการส่งคืนได้ที่หน้าหลักแอป หรือผ่านทาง LINE Chat ครับ
                  </p>
               </div>

               <div className="flex flex-col gap-4 px-4">
                  <button 
                    onClick={() => router.push(`/box/${boxId}`)}
                    className="w-full bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all text-xl"
                  >
                     ไปที่หน้ากล่อง
                  </button>
                  <Link href="/" className="w-full">
                     <button className="w-full bg-slate-100 text-slate-500 font-bold py-5 rounded-[2rem] active:scale-95 transition-all text-base uppercase tracking-widest">
                        กลับหน้าหลัก
                     </button>
                  </Link>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
