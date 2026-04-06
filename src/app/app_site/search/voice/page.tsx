'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VoiceSearch() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isDone, setIsDone] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscript('');
      setIsDone(false);
    } else {
      setIsRecording(false);
      setTranscript('กำลังค้นหา "กรรไกรตัดผม" ในกล่องต่างๆ...');
      setTimeout(() => setIsDone(true), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col p-6 overflow-hidden">
       <header className="flex items-center gap-4 mb-20 pt-4 relative z-10">
          <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
             <i className="fa-notdog fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-black italic tracking-tight">ค้นหาด้วยเสียง Hubby</h1>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center gap-12 relative">
          {/* Animated Ripples */}
          {isRecording && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
               {[1,2,3].map(i => (
                  <div 
                    key={i} 
                    className="absolute w-40 h-40 bg-primary/20 rounded-full animate-ping"
                    style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2s' }}
                  ></div>
               ))}
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center gap-12 max-w-sm text-center">
             <div 
               onClick={toggleRecording}
               className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer relative overflow-hidden group ${
                  isRecording ? 'bg-red-500 scale-110' : 'bg-primary hover:scale-105 active:scale-95'
               }`}
             >
                <i className={`fa-notdog fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-5xl text-white drop-shadow-lg`}></i>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>

             <div className="space-y-4 px-4 min-h-[100px] flex flex-col items-center justify-center text-center">
                {!isRecording && !isDone && (
                   <>
                      <h2 className="text-3xl font-black mb-2 animate-in fade-in zoom-in duration-500">พูดสิ่งที่ต้องการหา</h2>
                      <p className="text-slate-500 font-medium italic break-words max-w-xs">ลองพูดว่า "กรรไกรตัดผม" หรือ "ยาสามัญประจำบ้าน"</p>
                   </>
                )}
                
                {isRecording && (
                   <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                      <div className="flex gap-1 items-end h-8">
                         {[1,2,3,4,5,6,3,2,1].map((h, i) => (
                            <div key={i} className="w-1.5 bg-primary rounded-full animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                         ))}
                      </div>
                      <p className="text-xl font-bold italic text-primary animate-pulse">กำลังฟัง...</p>
                   </div>
                )}

                {isDone && (
                   <div className="bg-slate-800 rounded-3xl p-6 border border-white/10 animate-in slide-in-from-bottom-8 duration-500">
                      <h3 className="text-emerald-400 font-black mb-2 underline decoration-wavy">ค้นพบแล้ว!</h3>
                      <p className="text-white font-bold text-lg mb-6 leading-snug">"กรรไกรตัดผม" อยู่ในกล่อง <strong>"อุปกรณ์เครื่องใช้"</strong> ลำดับที่ 2</p>
                      <Link href="/" className="inline-block bg-primary text-white font-black px-10 py-3 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                         โอเค พาไปดู
                      </Link>
                   </div>
                )}
             </div>
          </div>
       </main>

       <footer className="py-12 flex flex-col items-center gap-4 text-center opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">ระบบประมวลผลเสียงอัจฉริยะ</p>
       </footer>
    </div>
  );
}
