'use client';

import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import Link from 'next/link';

// Load Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EmbeddedCheckoutPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('session');

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-sm">
          <i className="fa-solid fa-triangle-exclamation text-2xl" aria-hidden="true"></i>
        </div>
        <h1 className="text-xl font-black text-slate-800 mb-2">ไม่พบข้อมูลการชำระเงิน</h1>
        <p className="text-slate-500 font-medium text-sm mb-6">กรุณากลับไปทำรายการใหม่อีกครั้ง</p>
        <Link href="/" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="flex items-center justify-between p-6 pt-10 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
        </button>
        <h1 className="text-lg font-black tracking-tight text-slate-800">ชำระเงิน (Secure Checkout)</h1>
        <div className="w-10 flex justify-end text-slate-300">
          <i className="fa-brands fa-stripe text-3xl" aria-hidden="true"></i>
        </div>
      </header>
      
      <main className="flex-1 p-2 md:p-6 w-full max-w-2xl mx-auto pb-safe">
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 min-h-[500px]">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </main>
    </div>
  );
}
