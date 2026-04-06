'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiff } from '@/components/providers/liff-provider';
import { supabase } from '@/lib/supabase';

export default function PremiumPage() {
  const { dbUser, refreshDbUser } = useLiff();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleBuy = async (amount: number) => {
    if (!dbUser) return alert('กรุณาล็อกอินก่อนทำรายการ');
    
    // In reality, this would initiate a Stripe / PromptPay checkout flow
    // For now, we mock the success and give quota directly.
    const confirmed = window.confirm(`[โหมดทดสอบ] ยืนยันการชำระเงินจำลอง?\nระบบจะเพิ่มโควต้ากล่องให้ ${amount} กล่องทันที`);
    if (!confirmed) return;

    setIsLoading(amount);
    try {
      const newQuota = (dbUser.box_quota || 3) + amount;
      const { error } = await supabase
        .from('users')
        .update({ box_quota: newQuota })
        .eq('id', dbUser.id);
        
      if (error) throw error;
      
      await refreshDbUser();
      alert(`สำเร็จ! ขอบคุณที่สนับสนุน 💖\nโควต้ากล่องของคุณเพิ่มเป็น ${newQuota} กล่องแล้ว 🎉`);
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0e7ff] via-[#f5f3ff] to-white text-slate-800 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-white/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/settings" className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-50 hover:text-primary">
           <i className="fa-solid fa-arrow-left text-[20px]"></i>
        </Link>
        <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Hubbybox Premium</h1>
        </div>
        <div className="w-11"></div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col pt-8">
        <div className="flex justify-center mb-6">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] border-4 border-white">
              <i className="fa-solid fa-gem text-white text-[48px] -rotate-12 drop-shadow-md"></i>
           </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-slate-800 mb-2">ซื้อกล่องอัจฉริยะ</h2>
        <p className="text-center text-slate-500 font-medium mb-8 leading-relaxed">
            พื้นที่เริ่มต้น 3 กล่องแรกใช้ <strong>ฟรีตลอดชีพ!</strong><br />
            สแกนรูปด้วย AI และค้นหาของฟรีไม่มีอั้น<br />
            <span className="text-xs text-indigo-400 font-bold mt-1 block">(จ่ายเพิ่มเฉพาะตอนกล่องเต็มเท่านั้น จ่ายครั้งเดียวจบ)</span>
        </p>
        
        {/* Pack 1 */}
        <section className="bg-white/90 backdrop-blur-md shadow-sm border-2 border-indigo-100 rounded-[2.5rem] p-6 mb-5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all font-bold text-indigo-500 text-6xl">
               <i className="fa-solid fa-boxes-stacked"></i>
           </div>
           <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                   <h3 className="font-bold text-xl text-slate-800">เซ็ตมินิมอล</h3>
                   <p className="text-sm font-medium text-slate-500">ซื้อเพิ่ม 5 กล่องดิจิทัล</p>
               </div>
               <div className="bg-indigo-50 text-indigo-600 font-black text-xl px-4 py-2 rounded-2xl border border-indigo-100">
                   49.-
               </div>
           </div>
           <ul className="flex flex-col gap-2 relative z-10 mb-6">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <i className="fa-solid fa-circle-check text-indigo-400"></i> AI สแกนของเข้ากล่องไม่จำกัด
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                 <i className="fa-solid fa-circle-check text-indigo-400"></i> AI Search หาของฟรีตลอดชีพ
              </li>
           </ul>
           <button 
             onClick={() => handleBuy(5)}
             disabled={isLoading !== null}
             className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white font-bold text-lg py-4 rounded-[1.5rem] transition-colors active:scale-[0.98] disabled:active:scale-100 shadow-sm flex items-center justify-center gap-2"
           >
               {isLoading === 5 ? <i className="fa-solid fa-spinner fa-spin text-[20px]"></i> : null}
               {isLoading === 5 ? 'กำลังทำรายการ...' : 'ซื้อเซ็ตมินิมอล'}
           </button>
        </section>

        {/* Pack 2 */}
        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] border border-indigo-400 rounded-[2.5rem] p-6 mb-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all font-bold text-white text-[80px] -rotate-6">
               <i className="fa-solid fa-house-chimney"></i>
           </div>
           
           {/* Popular Badge */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold text-[10px] px-4 py-1 rounded-b-xl shadow-sm tracking-widest">
               เซ็ตคุ้มค่าที่สุด
           </div>

           <div className="flex justify-between items-start mb-4 relative z-10 mt-2">
               <div>
                   <h3 className="font-bold text-2xl text-white drop-shadow-sm">เซ็ตจัดบ้านใหม่</h3>
                   <p className="text-sm font-medium text-indigo-100">ซื้อเพิ่มทีเดียว 15 กล่องดิจิทัล</p>
               </div>
               <div className="bg-white/20 backdrop-blur-sm text-white font-black text-2xl px-4 py-2 rounded-2xl border border-white/30 shadow-inner">
                   99.-
               </div>
           </div>
           <ul className="flex flex-col gap-2 relative z-10 mb-6">
              <li className="flex items-center gap-3 text-sm font-medium text-indigo-50">
                 <i className="fa-solid fa-circle-check text-yellow-300"></i> AI สแกนของเข้ากล่องไม่จำกัด
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-indigo-50">
                 <i className="fa-solid fa-circle-check text-yellow-300"></i> AI Search หาของฟรีตลอดชีพ
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-indigo-50">
                 <i className="fa-solid fa-circle-check text-yellow-300"></i> พื้นที่เก็บรูปเพียงพอสำหรับทั้งบ้าน
              </li>
           </ul>
           <button 
             onClick={() => handleBuy(15)}
             disabled={isLoading !== null}
             className="w-full bg-white hover:bg-indigo-50 disabled:bg-slate-200 text-indigo-600 disabled:text-slate-400 font-bold text-lg py-4 rounded-[1.5rem] transition-colors active:scale-[0.98] disabled:active:scale-100 shadow-sm flex items-center justify-center gap-2"
           >
               {isLoading === 15 ? <i className="fa-solid fa-spinner fa-spin text-[20px]"></i> : null}
               {isLoading === 15 ? 'กำลังทำรายการ...' : 'ซื้อเซ็ตจัดบ้านใหม่'}
           </button>
        </section>
        
        <p className="text-center text-xs font-bold text-slate-400 mb-4">
           จ่ายครั้งเดียวจบ ไม่มีรายเดือน<br/>ผูกติดกับบัญชี LINE ของคุณถาวร
        </p>
      </main>
    </div>
  );
}
