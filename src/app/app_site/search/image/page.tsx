'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchByImage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsAnalyzing(true);
      // Simulate AI Analysis
      setTimeout(() => setIsAnalyzing(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col p-6">
       <header className="flex items-center gap-4 mb-10 pt-4">
          <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
             <i className="fa-notdog fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-black">ค้นหาด้วยรูปภาพ</h1>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center gap-8">
          {!previewUrl ? (
             <div className="w-full max-w-sm aspect-square bg-slate-800 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-primary/20 w-24 h-24 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                   <i className="fa-notdog fa-solid fa-camera text-4xl"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">ถ่ายรูปหรือเลือกภาพ</h2>
                <p className="text-slate-400 text-sm mb-8 px-4 font-medium italic">ส่งภาพของที่คุณต้องการหา แล้วปล่อยให้ Hubby AI จัดการ!</p>
                
                <label className="bg-white text-slate-900 font-black px-8 py-4 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                   เลือกไฟล์ภาพ
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
             </div>
          ) : (
             <div className="w-full max-w-sm flex flex-col items-center gap-6">
                <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-lg font-black tracking-widest text-primary animate-pulse">กำลังวิเคราะห์...</p>
                         <p className="text-xs text-white/70 italic mt-2">Hubby AI กำลังระบุตัวตนสิ่งของของคุณ</p>
                      </div>
                   )}
                </div>
                
                {!isAnalyzing && (
                   <div className="w-full bg-slate-800 rounded-3xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="bg-emerald-500/20 text-emerald-400 w-10 h-10 rounded-full flex items-center justify-center">
                            <i className="fa-notdog fa-solid fa-check"></i>
                         </div>
                         <h3 className="font-black">พบเจอแล้ว!</h3>
                      </div>
                      <p className="text-slate-300 text-sm mb-6 leading-relaxed">พบว่าของชิ้นนี้อยู่ใน <strong>"กล่องอุปกรณ์เครื่องเขียน"</strong> ลำดับที่ 4 ชั้นวางบนสุด</p>
                      <Link href="/" className="block w-full bg-primary text-white text-center font-black py-4 rounded-2xl hover:opacity-90 transition-all">
                         นำทางไปที่กล่อง
                      </Link>
                   </div>
                )}
                
                <button 
                  onClick={() => setPreviewUrl(null)}
                  className="text-slate-500 font-bold hover:text-white transition-colors"
                >
                   ลองภาพอื่น
                </button>
             </div>
          )}
       </main>
       
       <footer className="py-8 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">ขับเคลื่อนด้วย Hubby AI Vision</p>
       </footer>
    </div>
  );
}
