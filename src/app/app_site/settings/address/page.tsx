'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';

interface UserAddress {
  id: string;
  label: string;
  recipient_name: string;
  address_line: string;
  postcode: string;
  phone: string;
  is_default: boolean;
}

export default function MultiAddressSettingsPage() {
  const router = useRouter();
  const { dbUser, userProfile, isLoading: isLiffLoading } = useLiff();
  
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Partial<UserAddress> | null>(null);
  
  // Form State
  const [label, setLabel] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!dbUser) return;
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dbUser]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => {
    setCurrentAddress(null);
    setLabel('บ้าน');
    setRecipientName(userProfile?.displayName || '');
    setAddressLine('');
    setPostcode('');
    setPhone('');
    setIsDefault(addresses.length === 0);
    setIsEditing(true);
  };

  const openEdit = (addr: UserAddress) => {
    setCurrentAddress(addr);
    setLabel(addr.label);
    setRecipientName(addr.recipient_name);
    setAddressLine(addr.address_line);
    setPostcode(addr.postcode);
    setPhone(addr.phone);
    setIsDefault(addr.is_default);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (currentAddress?.id) {
        // Update
        const { error } = await supabase
          .from('user_addresses')
          .update({
            label,
            recipient_name: recipientName,
            address_line: addressLine,
            postcode,
            phone,
            is_default: isDefault
          })
          .eq('id', currentAddress.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('user_addresses')
          .insert({
            user_id: dbUser.id,
            label,
            recipient_name: recipientName,
            address_line: addressLine,
            postcode,
            phone,
            is_default: isDefault
          });
        if (error) throw error;
      }
      
      await fetchAddresses();
      setIsEditing(false);
    } catch (err) {
      console.error('Save address error:', err);
      alert('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันบันทึกที่อยู่นี้?')) return;
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAddresses();
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    }
  };

  if (isLiffLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <i className="fa-solid fa-spinner fa-spin text-primary text-[40px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all font-sans"
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">ที่อยู่จัดส่ง</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             {isEditing ? (currentAddress ? 'Edit Address' : 'New Address') : 'Saved Addresses'}
          </p>
        </div>
        <div className="w-10" />
      </header>

      <main className="max-w-md mx-auto p-6">
         <AnimatePresence mode="wait">
           {!isEditing ? (
             <motion.div
               key="list"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-4"
             >
                {addresses.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                     <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                        <i className="fa-solid fa-map-location-dot text-[32px]" />
                     </div>
                     <p className="text-slate-400 font-bold">ยังไม่มีที่อยู่ที่บันทึกไว้</p>
                     <button 
                        onClick={openAdd}
                        className="mt-2 text-primary font-black text-sm uppercase tracking-widest bg-white px-6 py-3 rounded-2xl border border-primary/20 shadow-sm"
                     >
                        + เพิ่มที่อยู่แรก
                     </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-2 mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สมุดที่อยู่ของคุณ</span>
                       <button onClick={openAdd} className="text-xs font-black text-primary">เพิ่มที่อยู่ใหม่</button>
                    </div>
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm group">
                         <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                               <span className="bg-slate-100 text-[10px] font-black px-2 py-0.5 rounded-full uppercase text-slate-500">{addr.label}</span>
                               {addr.is_default && (
                                 <span className="bg-primary/10 text-[10px] font-black px-2 py-0.5 rounded-full uppercase text-primary">ที่อยู่หลัก</span>
                               )}
                            </div>
                            <div className="flex items-center gap-1">
                               <button onClick={() => openEdit(addr)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-sky-500">
                                  <i className="fa-solid fa-pen-to-square text-sm" />
                               </button>
                               <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                                  <i className="fa-solid fa-trash-can text-sm" />
                               </button>
                            </div>
                         </div>
                         <h4 className="font-bold text-slate-800 mb-1">{addr.recipient_name}</h4>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">{addr.address_line} {addr.postcode}</p>
                         <div className="flex items-center gap-2 text-slate-400">
                            <i className="fa-solid fa-phone text-[10px]" />
                            <span className="text-[11px] font-bold tracking-tight">{addr.phone}</span>
                         </div>
                      </div>
                    ))}
                  </>
                )}
             </motion.div>
           ) : (
             <motion.div
               key="form"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
             >
                <form onSubmit={handleSave} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อเรียกที่อยู่ (Label)</label>
                      <input 
                        type="text" 
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="เช่น บ้าน, ที่ทำงาน..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all"
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อผู้รับ</label>
                      <input 
                        type="text" 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all"
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ที่อยู่สำหรับการนำส่ง</label>
                      <textarea 
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all resize-none"
                        required
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">รหัสไปรษณีย์</label>
                        <input 
                          type="text" 
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เบอร์ติดต่อ</label>
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all"
                          required
                        />
                      </div>
                   </div>

                   <button 
                      type="button"
                      onClick={() => setIsDefault(!isDefault)}
                      className="flex items-center gap-3 pt-2"
                   >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isDefault ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                         {isDefault && <i className="fa-solid fa-check text-[10px]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-500">ตั้งเป็นที่อยู่หลัก</span>
                   </button>

                   <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-lg"
                      >
                         {isSubmitting ? <i className="fa-solid fa-spinner fa-spin" /> : (currentAddress ? 'บันทึกการแก้ไข' : 'เพิ่มที่อยู่')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="w-full text-slate-400 font-bold py-3 hover:text-slate-600 transition-colors"
                      >
                         ยกเลิก
                      </button>
                   </div>
                </form>
             </motion.div>
           )}
         </AnimatePresence>
      </main>

      {/* FAB - Add Address (only list view) */}
      {!isEditing && addresses.length > 0 && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={openAdd}
          className="fixed bottom-32 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-20"
        >
           <i className="fa-solid fa-plus text-[24px]" />
        </motion.button>
      )}
    </div>
  );
}
