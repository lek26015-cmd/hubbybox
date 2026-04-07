'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';
import Link from 'next/link';

interface UserAddress {
  id: string;
  label: string;
  recipient_name: string;
  address_line: string;
  postcode: string;
  phone: string;
  is_default: boolean;
}

function RecallFlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dbUser, userProfile, isLoading: isLiffLoading } = useLiff();
  
  const boxId = searchParams.get('box_id');
  const itemIdsParam = searchParams.get('item_ids');
  const itemIds = itemIdsParam ? itemIdsParam.split(',') : [];
  const isItemLevel = itemIds.length > 0;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [targetBox, setTargetBox] = useState<any>(null);
  const [targetItems, setTargetItems] = useState<any[]>([]);
  
  // Multi-Address State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [isAddingNew, setIsAddingNew] = useState(true);

  // Form State (for new or editing)
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaveDefault, setIsSaveDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const RECALL_FEE = isItemLevel ? 29 : 0;

  const fetchData = useCallback(async () => {
    if (!boxId || !userProfile?.displayName) return;
    
    setIsLoading(true);
    try {
      // Fetch Box
      const { data: bData, error: bErr } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', boxId)
        .single();
      
      if (bErr) throw bErr;
      setTargetBox(bData);

      // Fetch Items if item-level
      if (isItemLevel && itemIds.length > 0) {
        const { data: iData, error: iErr } = await supabase
          .from('items')
          .select('*')
          .in('id', itemIds);
        if (iErr) throw iErr;
        setTargetItems(iData || []);
      }

      // Fetch Saved Addresses
      if (dbUser) {
        const { data: aData, error: aErr } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', dbUser.id)
          .order('is_default', { ascending: false });
        
        if (aErr) throw aErr;
        setAddresses(aData || []);
        
        if (aData && aData.length > 0) {
          const def = aData.find(a => a.is_default) || aData[0];
          setSelectedAddressId(def.id);
          setIsAddingNew(false);
          // Pre-fill hidden fields for Stripe metadata
          setRecipientName(def.recipient_name);
          setAddress(def.address_line);
          setPostcode(def.postcode);
          setPhone(def.phone);
        } else {
          setRecipientName(userProfile?.displayName || '');
        }
      }
    } catch (err: any) {
      console.error('Fetch data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [boxId, isItemLevel, itemIds.length, userProfile?.displayName, dbUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setIsAddingNew(false);
    setRecipientName(addr.recipient_name);
    setAddress(addr.address_line);
    setPostcode(addr.postcode);
    setPhone(addr.phone);
  };

  const handleSelectNew = () => {
    setSelectedAddressId('new');
    setIsAddingNew(true);
    setRecipientName(userProfile?.displayName || '');
    setAddress('');
    setPostcode('');
    setPhone('');
  };

  const handleFinalConfirm = async () => {
    if (!dbUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isItemLevel) {
        // Stripe Path
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              name: `ค่าบริการเรียกคืนของรายชิ้น (${itemIds.length} รายการ)`,
              amount: RECALL_FEE,
              quantity: 1
            }],
            userId: dbUser.id,
            orderId: `RECALL-${Date.now()}-${boxId ? boxId.slice(0,4) : 'BK'}`,
            metadata: {
                type: 'ITEM_RECALL',
                boxId: boxId || '',
                itemIds: itemIds.join(','),
                isSaveDefault: isSaveDefault ? 'true' : 'false',
                recipientName,
                address,
                postcode,
                phone
            }
          }),
        });

        const { url } = await response.json();
        if (url) window.location.href = url;
        else throw new Error('Failed to create checkout session');

      } else {
        // Free Path (Full Box)
        const { error } = await supabase
          .from('boxes')
          .update({ status: 'returning' })
          .eq('id', boxId);

        if (error) throw error;

        // If new address + save checked
        if (isAddingNew && isSaveDefault && dbUser?.id) {
          await supabase
            .from('user_addresses')
            .insert({
              user_id: dbUser.id,
              label: 'ที่อยู่ปัจจุบัน',
              recipient_name: recipientName,
              address_line: address,
              postcode: postcode,
              phone: phone,
              is_default: addresses.length === 0
            });
        }

        setStep(4);
      }
    } catch (err: any) {
      console.error('Confirm error:', err);
      alert('ดำเนินการไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLiffLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[48px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-32 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all font-sans"
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">เรียกคืนของ</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Item Retrieval Plan</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="max-w-md mx-auto p-6">
        {/* Progress Bar */}
        <div className="flex justify-between mb-10 px-4 relative">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
           <div className="absolute top-1/2 left-0 h-0.5 bg-sky-400 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 33.3}%` }} />
           {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${step >= i ? 'bg-sky-400 text-white shadow-lg shadow-sky-400/30 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                 {step > i ? <i className="fa-solid fa-check" /> : i}
              </div>
           ))}
        </div>

        <section className="min-h-[400px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                    <i className="fa-solid fa-parachute-box text-[80px]" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 mb-2">ตรวจสอบรายการ</h2>
                 <p className="text-sm text-slate-400 font-bold mb-8 uppercase tracking-widest leading-none">Review Selection</p>
                 
                 <div className="space-y-4 mb-8">
                    {isItemLevel ? (
                      <div className="space-y-2">
                        {targetItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-400 shadow-sm">
                                <i className="fa-solid fa-cube" />
                             </div>
                             <span className="font-bold text-slate-700">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50 flex flex-col items-center text-center gap-2">
                         <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-indigo-500 mb-2 shadow-sm shadow-indigo-200">
                            <i className="fa-solid fa-box text-[32px]" />
                         </div>
                         <h3 className="font-black text-indigo-900">{targetBox?.name || 'กล่องของคุณ'}</h3>
                         <p className="text-xs text-indigo-500 font-bold">เรียกคืนทั้งกล่องเดิม</p>
                      </div>
                    )}
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">ค่าบริการนำส่ง</span>
                        <span className="text-2xl font-black text-slate-800">{RECALL_FEE}.- <span className="text-sm font-bold text-slate-400 text-line ml-1">THB</span></span>
                    </div>
                    {RECALL_FEE === 0 ? (
                       <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter">FREE RECALL</span>
                    ) : (
                       <span className="bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter">SERVICE FEE</span>
                    )}
                 </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-lg relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 <span>ระบุที่อยู่จัดส่ง <i className="fa-solid fa-arrow-right ml-2" /></span>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-black text-slate-700 px-2 mb-6">เลือกที่อยู่จัดส่ง</h2>
              
              {/* Saved Addresses List */}
              {addresses.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-6 px-1 no-scrollbar -mx-6 pl-6 pr-6">
                   {addresses.map(addr => (
                     <button
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`min-w-[240px] p-6 rounded-3xl border-2 transition-all text-left relative ${selectedAddressId === addr.id ? 'bg-white border-sky-400 shadow-xl shadow-sky-400/10' : 'bg-slate-100 border-transparent text-slate-400'}`}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${selectedAddressId === addr.id ? 'bg-sky-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                             {addr.label}
                           </span>
                           {selectedAddressId === addr.id && <i className="fa-solid fa-circle-check text-sky-400" />}
                        </div>
                        <h4 className={`font-black text-sm mb-1 ${selectedAddressId === addr.id ? 'text-slate-800' : 'text-slate-400'}`}>{addr.recipient_name}</h4>
                        <p className={`text-[10px] font-bold line-clamp-2 leading-relaxed ${selectedAddressId === addr.id ? 'text-slate-500' : 'text-slate-400'}`}>{addr.address_line}</p>
                     </button>
                   ))}
                   <button 
                      onClick={handleSelectNew}
                      className={`min-w-[120px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isAddingNew ? 'bg-white border-sky-400 text-sky-400' : 'bg-slate-100 border-slate-200 text-slate-300'}`}
                   >
                      <i className="fa-solid fa-plus text-lg" />
                      <span className="text-[10px] font-black uppercase tracking-widest">เพิ่มใหม่</span>
                   </button>
                </div>
              )}

              {isAddingNew && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mt-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อผู้รับ</label>
                      <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all placeholder:text-slate-300" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ที่อยู่นำส่ง</label>
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="บ้านเลขที่, ถนน..." rows={2} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all placeholder:text-slate-300 resize-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">รหัสไปรษณีย์</label>
                        <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="00000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เบอร์ติดต่อ</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all" />
                      </div>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => setIsSaveDefault(!isSaveDefault)}
                      className="flex items-center gap-3 pt-2"
                    >
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSaveDefault ? 'bg-primary border-primary text-white' : 'border-slate-200 bg-white'}`}>
                          {isSaveDefault && <i className="fa-solid fa-check text-[10px]" />}
                       </div>
                       <span className="text-xs font-bold text-slate-500">บันทึกไว้ในสุมดที่อยู่</span>
                    </button>
                </div>
              )}

              {!isAddingNew && !isAddingNew && (
                <div className="bg-white p-6 rounded-3xl border border-sky-100 mt-6 flex gap-4 items-center">
                   <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
                      <i className="fa-solid fa-truck-fast text-lg" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-800">จัดส่งไปที่ {addresses.find(a => a.id === selectedAddressId)?.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{addresses.find(a => a.id === selectedAddressId)?.recipient_name}</p>
                   </div>
                </div>
              )}

              <button 
                onClick={() => setStep(3)} 
                disabled={!recipientName || !address || !postcode || !phone}
                className="w-full mt-8 bg-slate-900 text-white font-black py-5 rounded-[2rem] disabled:opacity-50 active:scale-95 transition-all text-lg"
              >
                 ดูสรุปรายการเรียกคืน
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-4">สรุปคำขอส่งคืน</h2>
                  
                  <div className="space-y-6 mb-10">
                     <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">รายละเอียดกล่อง</span>
                        <span className="text-slate-800">{targetBox?.name}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">จำนวนรายการ</span>
                        <span className="text-slate-800">{isItemLevel ? `${itemIds.length} ชิ้น` : 'ทั้งกล่อง'}</span>
                     </div>
                     <div className="flex justify-between items-start text-sm font-bold">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px] pt-1">ที่อยู่จัดส่ง</span>
                        <div className="text-right max-w-[180px]">
                           <span className="block text-slate-800 mb-0.5">{recipientName}</span>
                           <span className="block text-[11px] text-slate-400 font-medium leading-relaxed">{address} {postcode}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between text-white">
                     <span className="font-bold text-sm">ยอดชำระสุทธิ</span>
                     <span className="text-2xl font-black">{RECALL_FEE}.- <span className="text-xs opacity-50 ml-1">THB</span></span>
                  </div>
               </div>

               <button 
                  onClick={handleFinalConfirm} 
                  disabled={isSubmitting}
                  className="w-full bg-[#000] text-primary hover:bg-[#111] font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
               >
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner fa-spin" />
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-check" />
                      {RECALL_FEE > 0 ? 'ชำระเงินและเรียกของคืน' : 'ยืนยันเรียกของคืนฟรี'}
                    </>
                  )}
               </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-10 space-y-8">
               <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10 relative">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="relative z-10">
                     <i className="fa-solid fa-parachute-box text-[64px]" />
                  </motion.div>
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-emerald-200 rounded-[3rem]" />
               </div>
               
               <div>
                  <h2 className="text-4xl font-black text-slate-800 mb-3">ขอบคุณครับ!</h2>
                  <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed px-6">
                     เราได้รับคำขอเรียกคืนของคุณเรียบร้อยแล้ว ทีมงาน Hubbybox จะรีบนำส่งคืนภายในเวลาทำการครับ
                  </p>
               </div>

               <div className="w-full space-y-3 pt-6 px-4">
                  <button onClick={() => router.push('/')} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all text-lg">
                     กลับหน้าหลัก
                  </button>
                  <button onClick={() => router.push(`/box/${boxId}`)} className="w-full text-slate-400 font-bold py-4 hover:text-slate-600 transition-colors">
                     ดูความคืบหน้ากล่องนี้
                  </button>
               </div>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function RecallFlow() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-sky-400" /></div>}>
      <RecallFlowPage />
    </Suspense>
  );
}
