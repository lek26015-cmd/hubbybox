'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VoiceSearch() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียงครับ');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'th-TH'; // ตั้งค่าเป็นภาษาไทย

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        setError('กรุณาอนุญาตให้แอปเข้าถึงไมโครโฟนเพื่อใช้งานครับ');
      } else {
        setError('เกิดข้อผิดพลาดในการฟังเสียง ลองใหม่อีกครั้งนะ');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      // If we have a transcript, redirect after a short delay
      if (transcript.trim()) {
        setTimeout(() => {
          router.push(`/search/results?q=${encodeURIComponent(transcript.trim())}`);
        }, 1000);
      }
    };

    recognitionRef.current = recognition;
  }, [transcript, router]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col p-6 overflow-hidden">
       <header className="flex items-center gap-4 mb-20 pt-4 relative z-10">
          <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
             <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-bold italic tracking-tight">ค้นหาด้วยเสียง Hubby</h1>
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

          <div className="relative z-10 flex flex-col items-center gap-12 max-w-sm text-center w-full">
             <div 
               onClick={toggleRecording}
               className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer relative overflow-hidden group ${
                  isRecording ? 'bg-red-500 scale-110' : 'bg-primary hover:scale-105 active:scale-95 shadow-primary/30'
               }`}
             >
                <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-5xl text-white drop-shadow-lg`}></i>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>

             <div className="space-y-4 px-4 min-h-[120px] flex flex-col items-center justify-center text-center w-full">
                {error ? (
                  <p className="text-rose-400 font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 w-full animate-in fade-in duration-300">
                    {error}
                  </p>
                ) : !isRecording && !transcript ? (
                   <>
                      <h2 className="text-3xl font-bold mb-2 animate-in fade-in zoom-in duration-500">พูดสิ่งที่ต้องการหา</h2>
                      <p className="text-slate-500 font-medium italic break-words max-w-xs">กดปุ่มไมโครโฟนแล้วเริ่มพูดได้เลยครับ</p>
                   </>
                ) : (
                   <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300 w-full">
                      {isRecording && (
                        <div className="flex gap-1 items-end h-8">
                           {[1,2,3,4,5,6,3,2,1].map((h, i) => (
                              <div key={i} className="w-1.5 bg-primary rounded-full animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                           ))}
                        </div>
                      )}
                      
                      <div className="w-full">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">{isRecording ? 'กำลังฟัง...' : 'ได้ยินว่า:'}</p>
                        <p className={`text-2xl font-bold italic transition-all ${isRecording ? 'text-primary animate-pulse' : 'text-white'}`}>
                          {transcript || '...'}
                        </p>
                      </div>

                      {!isRecording && transcript && (
                        <p className="text-xs text-sky-400 font-bold animate-pulse">กำลังพาคุณไปดูผลลัพธ์...</p>
                      )}
                   </div>
                )}
             </div>
          </div>
       </main>

       <footer className="py-12 flex flex-col items-center gap-4 text-center opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">ระบบประมวลผลเสียงอัจฉริยะ</p>
       </footer>
    </div>
  );
}

