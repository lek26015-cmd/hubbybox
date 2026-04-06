'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';

export default function HubbyStoragePage() {
  const { dbUser, isLoading: isLiffLoading } = useLiff();
  const [storedBoxes, setStoredBoxes] = useState<any[]>([]);
  const [isLoadingStored, setIsLoadingStored] = useState(true);

  const fetchStoredBoxes = useCallback(async () => {
    if (!dbUser?.id) return;
    try {
      setIsLoadingStored(true);
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('user_id', dbUser.id)
        .eq('location', 'คลังกลาง Hubbybox')
        .order('created_at', { ascending: false });

      if (!error) setStoredBoxes(data || []);
    } finally {
      setIsLoadingStored(false);
    }
  }, [dbUser?.id]);

  useEffect(() => {
    if (dbUser?.id) fetchStoredBoxes();
    else if (!isLiffLoading) setIsLoadingStored(false);
  }, [dbUser?.id, isLiffLoading, fetchStoredBoxes]);
  const benefits = [
    { title: 'ความปลอดภัยสูง', desc: 'คลังสินค้าอัจฉริยะ ควบคุมอุณหภูมิและมีระบบความปลอดภัย 24 ชม.', icon: 'fa-shield-halved' },
    { title: 'เช็กของได้ตลอด', desc: 'อยากรู้ว่าในคลังมีกล่องไหนบ้าง หรืออยากได้ใบไหนคืน แค่กดสั่งในแอป!', icon: 'fa-mobile-screen' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-24 overflow-x-hidden">
       {/* Hero Image Section */}
       <div className="relative w-full h-[45vh] overflow-hidden">
          <Image 
            src="/storage-hero.png" 
            alt="Hubby Smart Warehouse" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
          
          <Link href="/" className="absolute top-10 left-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/50 active:scale-95 transition-all">
             <i className="fa-notdog fa-solid fa-arrow-left text-slate-700 text-sm" aria-hidden="true"></i>
          </Link>

          <div className="absolute top-10 right-6 px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
             Coming Soon
          </div>
       </div>

       <main className="px-8 -mt-24 relative z-10">
          {/* Pricing & Call to Action Card (Moved to Top) */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-2xl shadow-slate-200 mb-8 border border-white/10 group">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 transition-transform duration-1000 group-hover:rotate-45">
                <i className="fa-notdog fa-solid fa-box-archive text-[100px]" aria-hidden="true"></i>
             </div>
             
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 tracking-tight">เริ่มฝากกล่องแรกของคุณ</h3>
                <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed max-w-[240px]">แจ้งความประสงค์นำฝาก และรับรหัสอ้างอิง<br/>เพื่อเริ่มส่งกล่องเข้าคลังได้ทันที</p>
                
                <Link href="/storage/deposit" className="block w-full">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all text-base uppercase tracking-widest border border-white/20">
                     เริ่มแจ้งฝากกล่อง 📦
                  </button>
                </Link>
             </div>
             
             <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-1 relative z-10">
                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">ค่าบริการเพียง</span>
                <p className="text-3xl font-black text-white">99.- <span className="text-xs text-slate-500 font-bold">/ กล่อง / เดือน</span></p>
                <div className="mt-2 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
                   <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Ready to store</span>
                </div>
             </div>
          </section>
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-50 mb-10">
             <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-1 bg-slate-200 rounded-full mb-6"></div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Hubby Storage</h1>
                <p className="text-lg font-bold text-sky-500 mb-4">บริการฝากกล่องอัจฉริยะ</p>
                <div className="h-1 w-12 bg-sky-100 rounded-full"></div>
             </div>

             <p className="text-slate-500 font-medium leading-relaxed mb-10 text-center">
                เปลี่ยนบ้านที่วุ่นวายให้กลายเป็นพื้นที่โปร่งสบาย<br/>ด้วยบริการส่งของไปฝากที่คลังสินค้าของพวกเรา<br/>
                <span className="text-slate-800 font-bold italic mt-2 block">"ฝากง่าย ค้นหาไว เหมือนวางไว้ในบ้าน"</span>
             </p>

             {/* Service Options Phase 1 */}
             <div className="space-y-4 mb-10">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 mb-4">รูปแบบการให้บริการ</h4>
                
                <div className="grid grid-cols-1 gap-4">
                   {/* Option 2: Self-Drop (PRIMARY IN PHASE 1) */}
                   <div className="bg-sky-50/70 border-2 border-sky-400 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 py-2 px-6 bg-sky-400 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                         เปิดให้บริการแล้ว
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm border border-sky-100 group-hover:scale-110 transition-transform">
                            <i className="fa-notdog fa-solid fa-parachute-box text-[22px]" aria-hidden="true"></i>
                         </div>
                         <h5 className="font-bold text-slate-800 text-lg">ส่งเข้าคลังกลางเอง</h5>
                      </div>
                      <p className="text-sm text-slate-600 font-medium">
                         นำส่งกล่องมาที่คลังกลางของ HubbyBox ด้วยตัวเอง หรือใช้บริการขนส่งเจ้าใดก็ได้ที่คุณสะดวก
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                         <i className="fa-solid fa-clock" aria-hidden="true"></i>
                         ระยะเวลาตามขั้นตอนของบริษัทขนส่งที่ท่านเลือก
                      </div>
                   </div>

                   {/* Option 1: Pickup (COMING SOON IN PHASE 2) */}
                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
                            <i className="fa-notdog fa-solid fa-truck-fast text-[20px]" aria-hidden="true"></i>
                         </div>
                         <div className="flex flex-col">
                            <h5 className="font-bold text-slate-400 text-lg">Hubby Pickup</h5>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Soon</span>
                         </div>
                      </div>
                      <p className="text-sm text-slate-400 font-medium">
                         เตรียมพบกับบริการรับกล่องถึงหน้าบ้าน เร็วๆ นี้
                      </p>
                   </div>
                </div>
             </div>

             {/* Steps Guide */}
             <div className="mb-10 px-2">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">ขั้นตอนการฝากของ (Phase 1)</h4>
                <div className="space-y-6 relative ml-4">
                   <div className="absolute left-[-17px] top-2 bottom-6 w-0.5 bg-slate-100"></div>
                   
                   <div className="relative">
                      <div className="absolute left-[-22px] top-0 w-3 h-3 bg-sky-400 rounded-full border-4 border-white"></div>
                      <h6 className="font-bold text-slate-800 text-sm mb-1">1. แพ็คและระบุเลขรหัส</h6>
                      <p className="text-[11px] text-slate-500 font-medium">แพ็คกล่องให้เรียบร้อย และเขียนเลขรหัสที่ได้รับจากแอปไว้บนกล่อง</p>
                   </div>
                   
                   <div className="relative">
                      <div className="absolute left-[-22px] top-0 w-3 h-3 bg-sky-400 rounded-full border-4 border-white"></div>
                      <h6 className="font-bold text-slate-800 text-sm mb-1">2. นำส่งผ่านขนส่งที่คุณเลือก</h6>
                      <p className="text-[11px] text-slate-500 font-medium font-sans">ส่งมาที่คลังกลางผ่าน Flash, J&T, ปณ.ไทย ฯลฯ ระยะเวลาตามมาตรฐานแต่ละเจ้า</p>
                   </div>

                   <div className="relative">
                      <div className="absolute left-[-22px] top-0 w-3 h-3 bg-sky-400 rounded-full border-4 border-white"></div>
                      <h6 className="font-bold text-slate-800 text-sm mb-1">3. ยืนยันการรับฝาก</h6>
                      <p className="text-[11px] text-slate-500 font-medium">เมื่อของถึงคลัง เราจะสแกนและยืนยันสถานะ "ฝากไว้ในคลัง" ให้ทันที</p>
                   </div>
                </div>
             </div>

             {/* Shipping Rate Comparison (NEW) */}
             <div className="mb-10 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">ประมาณการค่าส่ง (ส่งเอง)</h4>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-yellow-400 rounded-full" aria-hidden="true"></div>
                         <span className="text-xs font-bold text-slate-700">Flash Express</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">45 - 75.-</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></div>
                         <span className="text-xs font-bold text-slate-700">J&T / ปณ.ไทย</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">50 - 90.-</span>
                   </div>
                </div>
                <p className="mt-4 text-[9px] text-slate-400 font-medium italic text-center">
                   * ราคาประมาณการต่อ 1 กล่องขนาดมาตรฐาน (M)<br/>ชำระเงินโดยตรงกับผู้ให้บริการขนส่งที่คุณเลือก
                </p>
             </div>

             {/* Stored Boxes Section (NEW) */}
             {storedBoxes.length > 0 && (
               <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
                    <i className="fa-notdog fa-solid fa-warehouse" aria-hidden="true"></i>
                    กล่องที่คุณฝากไว้ ({storedBoxes.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {storedBoxes.map(box => (
                      <Link key={box.id} href={`/box/${box.id}`}>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all group">
                           <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                              {box.cover_image_url ? (
                                <img src={box.cover_image_url} alt={box.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white flex items-center justify-center text-slate-300">
                                  <i className="fa-notdog fa-solid fa-box" aria-hidden="true"></i>
                                </div>
                              )}
                           </div>
                           <div className="flex-1">
                              <h5 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{box.name}</h5>
                              <p className="text-[10px] text-slate-400 font-medium">รหัสฝาก: #{box.id.substring(0, 8).toUpperCase()}</p>
                           </div>
                           <i className="fa-notdog fa-solid fa-chevron-right text-slate-300 text-xs" aria-hidden="true"></i>
                        </div>
                      </Link>
                    ))}
                  </div>
               </div>
             )}

             {/* Benefits Grid */}
             <div className="space-y-6 pt-6 border-t border-slate-50">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 mb-2">ทำไมต้อง Hubby Storage?</h4>
                {benefits.map((item, i) => (
                   <div key={i} className="flex gap-5 items-start">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                         <i className={`fa-notdog fa-solid ${item.icon} text-sm`} aria-hidden="true"></i>
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-sm mb-0.5">{item.title}</h3>
                         <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>


          <p className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 HubbyBox Smart Logistics</p>
       </main>
    </div>
  );
}
