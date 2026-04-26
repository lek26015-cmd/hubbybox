'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 relative overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-sky-100 to-transparent -z-10"></div>
       <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -z-10"></div>
       <div className="absolute top-1/2 -left-24 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>

       {/* Header */}
       <header className="flex items-center justify-between p-6 pt-10">
          <Link href="/settings" className="w-11 h-11 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 hover:scale-110 active:scale-95 transition-all text-slate-400">
             <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl font-black tracking-tight text-slate-800">Support Hubbybox</h1>
          <div className="w-11"></div>
       </header>

       <main className="px-6 flex flex-col items-center">
          {/* Donation Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full text-center mb-8 mt-4"
          >
             <div className="relative inline-block mb-6 pt-4">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center relative z-10 border border-white">
                   <div className="w-14 h-14 bg-rose-50 rounded-[1.4rem] flex items-center justify-center">
                      <i className="fa-solid fa-heart text-rose-500 text-3xl animate-pulse" aria-hidden="true"></i>
                   </div>
                </div>
                <div className="absolute -inset-4 bg-rose-200/30 blur-2xl rounded-full"></div>
             </div>
             <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">เลี้ยงขนมน้อง Hubby</h2>
             <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-[280px] mx-auto opacity-80">
                ขอบคุณที่ช่วยให้ HubbyBox เติบโต<br/>ทุกยอดสนับสนุนคือพลังใจให้พวกเราครับ 💖
             </p>
          </motion.section>

          {/* Payment Card */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 15 }}
            className="w-full max-w-[340px]"
          >
             <div className="bg-white rounded-[3rem] p-10 shadow-[0_30px_70px_-20px_rgba(30,41,59,0.15)] border border-white relative overflow-hidden group">
                <div className="flex flex-col items-center mb-6">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="bg-[#003d6b] px-3 py-1 rounded-md">
                         <span className="text-white font-black text-[10px] tracking-widest uppercase">PromptPay / Credit Card</span>
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pay what you want</p>
                </div>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const amount = Number(formData.get('amount'));
                    if (!amount || amount < 20) {
                      alert('ยอดขั้นต่ำ 20 บาทครับ 🙏');
                      return;
                    }
                    
                    try {
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          productName: 'เลี้ยงขนมน้อง Hubby (Support)',
                          price: amount,
                          metadata: { type: 'SUPPORT' }
                        }),
                      });
                      const { url } = await res.json();
                      if (url) window.location.href = url;
                    } catch (err) {
                      alert('เกิดข้อผิดพลาด กรุณาลองใหม่ครับ');
                    }
                  }}
                  className="flex flex-col items-center"
                >
                   <div className="relative w-full mb-6">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">฿</span>
                      <input 
                        type="number" 
                        name="amount"
                        defaultValue="50"
                        min="20"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-14 pr-6 text-3xl font-black text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-400/20 transition-all text-center"
                        placeholder="0"
                      />
                   </div>
                   
                   <button 
                     type="submit"
                     className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-500/30 active:scale-95 transition-all text-sm uppercase tracking-widest"
                   >
                     สนับสนุนทีมงาน 💖
                   </button>
                </form>

                <div className="mt-8 flex flex-col items-center">
                   <div className="h-1 w-12 bg-slate-100 rounded-full mb-6"></div>
                   <p className="text-[10px] font-bold text-slate-400 italic">ขอบพระคุณจากใจทีมงาน 💖</p>
                </div>

                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-3xl -translate-y-16 translate-x-16 -z-10 group-hover:bg-sky-200/50 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-100/50 rounded-full blur-3xl translate-y-16 -translate-x-16 -z-10 group-hover:bg-rose-200/50 transition-colors"></div>
             </div>
          </motion.section>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hubbybox Donation Portal</p>
          </motion.div>
       </main>
    </div>
  );
}
