'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateBoxDrawer } from '@/components/boxes/create-box-drawer';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import type { BoxListRow } from '@/lib/box-types';

const WAREHOUSE_ADDRESS = {
  name: 'Hubbybox Central Warehouse (ชั้น 1)',
  address: '123/45 ซอยสุขุมวิท 101/1 แขวงบางนาเหนือ เขตบางนา กรุงเทพฯ 10260',
  phone: '02-xxx-xxxx',
};

export default function DepositFlowPage() {
  const router = useRouter();
  const { dbUser, isLoading: isLiffLoading } = useLiff();
  
  const [step, setStep] = useState(1);
  const [boxes, setBoxes] = useState<BoxListRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refId, setRefId] = useState('');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [submitHint, setSubmitHint] = useState<string | null>(null);

  const fetchBoxes = useCallback(async () => {
    if (!dbUser?.id) return;
    try {
      setIsLoading(true);
      // We want to fetch all boxes that are NOT in the warehouse.
      // In Supabase, .neq() excludes NULL values, so we use a more robust approach.
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });

      if (!error) {
        const rows = (data || []) as BoxListRow[];
        const filtered = rows.filter((box) => box.location !== HUBBYBOX_WAREHOUSE_LOCATION);
        setBoxes(filtered);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dbUser?.id]);

  useEffect(() => {
    if (dbUser?.id) fetchBoxes();
    else if (!isLiffLoading) setIsLoading(false);
  }, [dbUser?.id, isLiffLoading, fetchBoxes]);

  const toggleBox = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleConfirmBoxes = () => {
    if (selectedIds.size === 0) return;
    // Generate a short, human-friendly 6-character alphanumeric reference code
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRefId(`HB-${suffix}`);
    setStep(2);
    setSubmitHint(null);
    setCarrier('');
    setTrackingNumber('');
  };

  const handleFinalConfirm = async () => {
    if (selectedIds.size === 0 || isSubmitting || !dbUser?.id) return;
    if (!dbUser?.id || dbUser.id === 'fallback-id') {
      setIsSubmitting(false);
      alert('ฐานข้อมูลยังไม่พร้อมใช้งานชั่วคราว ขัดข้องที่การซิงค์ User ID (กรุณาไปรันคำสั่ง SQL เพื่อปลดล็อก RLS ใน Supabase ก่อนครับ)');
      return;
    }
    setSubmitHint(null);

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('boxes')
        .update({ 
          location: HUBBYBOX_WAREHOUSE_LOCATION,
          status: BOX_STATUS.SHIPPING_TO_WAREHOUSE,
          shipping_carrier: carrier.trim(),
          tracking_number: trackingNumber.trim() || null
        })
        .in('id', Array.from(selectedIds))
        .eq('user_id', dbUser.id);

      if (error) {
        console.error('Supabase Update Error detail:', JSON.stringify(error, null, 2));
        throw error;
      }
      setStep(3);
    } catch (err: any) {
      console.error('Final confirm error (Full Object):', err);
      console.log('Error Code:', err?.code);
      console.log('Error Details:', err?.details);
      console.log('Error Hint:', err?.hint);
      const message = err?.message || 'โปรดตรวจสอบการเชื่อมต่อหรือสิทธิ์ (RLS) ในฐานข้อมูล';
      alert(`เกิดข้อผิดพลาด: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAddressToClipboard = async () => {
    const text = `${WAREHOUSE_ADDRESS.name}\n${WAREHOUSE_ADDRESS.address}\nโทร: ${WAREHOUSE_ADDRESS.phone}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      alert('คัดลอกไม่สำเร็จ กรุณาลองคัดลอกด้วยตนเอง');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 font-sans bg-slate-50">
        <i className="fa-solid fa-spinner fa-spin text-primary text-[48px]" aria-hidden="true"></i>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">กำลังเตรียมขั้นตอน...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => step === 1 ? router.back() : setStep(step - 1)}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all font-sans"
        >
          <i className="fa-solid fa-arrow-left text-sm" aria-hidden="true"></i>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">แจ้งฝากกล่อง</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Step {step} of 3</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto p-6 pt-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <i className="fa-solid fa-box-open text-[48px] text-sky-400 mb-4" aria-hidden="true"></i>
                <h2 className="text-2xl font-black text-slate-900">เลือกกล่องที่ต้องการฝาก</h2>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">เลือกกล่องที่คุณต้องการส่งมาเก็บไว้ที่<br/>{HUBBYBOX_WAREHOUSE_LOCATION} ของเราครับ</p>
              </div>

              {boxes.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                    <i className="fa-solid fa-box-open text-[32px]" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">ไม่พบกล่องนอกคลังสินค้า</h3>
                  <p className="text-sm text-slate-500 font-medium mb-10 max-w-[240px]">คุณยังไม่มีกล่องใบไหนที่อยู่นอกคลังสินค้าเลยครับ<br/>สร้างกล่องเพื่อบันทึกของ หรือสั่งซื้อจากเราได้ทันที</p>
                  
                  <div className="flex flex-col gap-4 w-full">
                    <button 
                      onClick={() => setIsCreateDrawerOpen(true)}
                      className="w-full bg-primary text-white font-black py-5 rounded-xl shadow-xl shadow-primary/10 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                    >
                       <i className="fa-solid fa-plus text-xl" aria-hidden="true"></i> สร้างกล่องใหม่
                    </button>
                    
                    <Link href="/storage/supplies" className="w-full">
                      <button className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-black py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                         <i className="fa-solid fa-bag-shopping" aria-hidden="true"></i> สั่งซื้อชุดกล่อง Hubbybox 🛍️
                      </button>
                    </Link>
                    
                    <Link href="/" className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
                      ยกเลิกและย้อนกลับ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* Create New Box Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCreateDrawerOpen(true)}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-100 transition-all text-left group"
                  >
                    <div className="w-14 h-14 rounded-xl shrink-0 border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <i className="fa-solid fa-plus text-xl" aria-hidden="true"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg leading-tight mb-1 text-slate-600 group-hover:text-slate-900 transition-colors">สร้างกล่องใหม่</h4>
                      <p className="text-xs text-slate-400 font-medium">เพิ่มกล่องใบอื่นเพื่อส่งเข้าคลัง</p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300 mr-2 group-hover:text-slate-400 transition-colors" aria-hidden="true"></i>
                  </button>

                  {boxes.map(box => (
                    <button
                      type="button"
                      key={box.id}
                      onClick={() => toggleBox(box.id)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                        selectedIds.has(box.id)
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                          : 'border-white bg-white text-slate-700 shadow-sm'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl shrink-0 border flex items-center justify-center overflow-hidden ${selectedIds.has(box.id) ? 'border-primary/20' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                        {box.cover_image_url ? (
                          <img src={box.cover_image_url} alt={box.name} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fa-solid fa-box text-xl" aria-hidden="true"></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg leading-tight mb-1">{box.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">ปัจจุบัน: {box.location || 'ที่บ้าน'}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(box.id) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                        {selectedIds.has(box.id) && <i className="fa-solid fa-check text-[10px]" aria-hidden="true"></i>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmBoxes}
                disabled={selectedIds.size === 0}
                className="w-full bg-primary text-white font-black py-5 rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:grayscale"
              >
                เลือกแล้ว {selectedIds.size} กล่อง ต่อไป <i className="fa-solid fa-arrow-right ml-2" aria-hidden="true"></i>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <i className="fa-solid fa-parachute-box text-[48px] text-indigo-500 mb-4" aria-hidden="true"></i>
                <h2 className="text-2xl font-black text-slate-900">บันทึกที่อยู่จัดส่ง</h2>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">กรุณาส่งกล่องของคุณมาตามที่อยู่นี้ครับ</p>
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 scale-150">
                   <i className="fa-solid fa-warehouse text-[80px]" aria-hidden="true"></i>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อผู้รับ</span>
                    <p className="font-bold text-slate-800">{WAREHOUSE_ADDRESS.name}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่</span>
                    <p className="font-bold text-slate-700 leading-relaxed text-sm">{WAREHOUSE_ADDRESS.address}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เบอร์ติดต่อ</span>
                    <p className="font-bold text-slate-800">{WAREHOUSE_ADDRESS.phone}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => void copyAddressToClipboard()}
                  className="w-full mt-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-regular fa-copy" aria-hidden="true"></i>{' '}
                  {copyDone ? 'คัดลอกแล้ว' : 'คัดลอกที่อยู่'}
                </button>
              </div>

              {/* Logistics Choice */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                      <i className="fa-solid fa-truck-fast"></i>
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-800">ข้อมูลการจัดส่ง</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logistic Information</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เลือกผู้มอบอำนาจส่งของ (Carrier)</label>
                    <select 
                      value={carrier} 
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 px-4 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all cursor-pointer"
                    >
                       <option value="">-- เลือกผู้ให้บริการ --</option>
                       <option value="Flash">Flash Express</option>
                       <option value="J&T">J&T Express</option>
                       <option value="Kerry">Kerry Express</option>
                       <option value="ThaiPost">ไปรษณีย์ไทย (EMS)</option>
                       <option value="Other">อื่นๆ (มาส่งเอง / Lalamove)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสพัสดุ (Tracking Number)</label>
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="ใส่รหัสพัสดุ (ถ้ามี)"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 px-4 font-bold text-slate-700 placeholder-slate-300 focus:border-primary/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ref ID Card */}
              <div className="bg-indigo-900 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">เขียนรหัสนี้ไว้บนกล่อง</span>
                  <div className="text-4xl font-black my-3 tracking-tighter tabular-nums drop-shadow-lg">{refId}</div>
                  <p className="text-[11px] text-white/60 font-medium">รหัสอ้างอิงสำคัญ สำหรับให้พนักงานสแกนรับของเข้าคลัง</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-4">
                <i className="fa-solid fa-circle-info text-amber-400 text-lg shrink-0 mt-1" aria-hidden="true"></i>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                   กรุณาชำระราคาต้นทางกับบริษัทขนส่งที่คุณเลือก (Flash, J&T, ปณ.ไทย ฯลฯ) และเขียนรหัสอ้างอิงให้ชัดเจน
                </p>
              </div>

              {submitHint && (
                <p className="text-center text-sm font-bold text-rose-500" role="alert">
                  {submitHint}
                </p>
              )}

              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-xl shadow-xl shadow-slate-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> : 'ฉันส่งของแล้ว / เตรียมส่งแล้ว'}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 pt-10"
            >
              <div className="relative">
                <motion.div 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                   className="w-32 h-32 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white shadow-2xl shadow-green-200"
                >
                  <i className="fa-solid fa-check text-[64px]" aria-hidden="true"></i>
                </motion.div>
                <div className="absolute inset-0 bg-green-300 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">แจ้งฝากสำเร็จ!</h2>
                <p className="text-slate-500 font-medium leading-relaxed px-6">
                  ทีมงานกำลังรอรับกล่องของคุณมาดูแลอย่างดีครับ<br/>เมื่อของถึงเรา จะมีการยืนยันผ่านแอปอีกครั้ง
                </p>
              </div>

              <div className="flex flex-col gap-3 px-4">
                 <Link href="/storage" className="w-full">
                    <button className="w-full bg-primary text-white font-black py-5 rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg">
                       ตกลง
                    </button>
                 </Link>
                 <Link href="/" className="w-full">
                    <button className="w-full bg-slate-100 text-slate-500 font-bold py-5 rounded-xl active:scale-95 transition-all text-lg">
                       กลับหน้าหลัก
                    </button>
                 </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Box Drawer */}
      <CreateBoxDrawer 
        isOpen={isCreateDrawerOpen} 
        onClose={() => setIsCreateDrawerOpen(false)} 
        onBoxCreated={() => {
          fetchBoxes();
          setIsCreateDrawerOpen(false);
        }}
      />
    </div>
  );
}
