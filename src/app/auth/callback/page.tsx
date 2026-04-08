'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';

/**
 * The inner handler that consumes searchParams.
 * Must be wrapped in <Suspense> for Next.js static generation.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('กำลังยืนยันตัวตน...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Check for 'code' (PKCE Flow)
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/admin_site';

        if (code) {
          console.log('[Auth] Exchanging code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 2. Check if we have a session (handles both PKCE and Implicit flow tokens in the fragment)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          setStatus('เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าหลัก...');
          router.replace(next);
        } else {
          // If no session and no code, it might still be processing or failed
          console.warn('[Auth] No session found after callback');
          const timeout = setTimeout(() => {
             setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
          }, 3000);
          return () => clearTimeout(timeout);
        }
      } catch (err: any) {
        console.error('[Auth Error]', err);
        setError(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
      }
    };

    void handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">เกิดข้อผิดพลาด</h1>
        <p className="text-slate-400 mb-8">{error}</p>
        <button 
          onClick={() => router.push('/login')}
          className="w-full bg-white text-slate-950 font-black py-4 rounded-xl active:scale-95 transition-all"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-sky-500/30 border-t-sky-500 rounded-full mx-auto mb-6"
      />
      <p className="text-sky-400 font-bold tracking-widest animate-pulse">{status}</p>
    </div>
  );
}

/**
 * Main Page component with Suspense boundary
 */
export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-slate-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Auth...</p>
        </div>
      }>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
