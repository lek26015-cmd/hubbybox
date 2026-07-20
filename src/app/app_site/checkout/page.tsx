'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

// Load Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── PromptPay QR Display ──
function PromptPayQR() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrUrl = searchParams.get('qr');
  const amount = searchParams.get('amount');
  const name = searchParams.get('name');
  const piId = searchParams.get('pi');
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'pending' | 'succeeded' | 'failed'>('pending');
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 min

  // Poll payment status
  useEffect(() => {
    if (!piId || status !== 'pending') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?id=${piId}`);
        const data = await res.json();
        if (data.status === 'succeeded') {
          setStatus('succeeded');
          clearInterval(interval);
          // Redirect to success page
          setTimeout(() => {
            router.push(`/checkout/success?order_id=${orderId}`);
          }, 1500);
        } else if (data.status === 'canceled' || data.status === 'requires_payment_method') {
          setStatus('failed');
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [piId, status, orderId, router]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'pending') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!qrUrl) {
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

  // Save QR image to device
  const handleSaveQR = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(decodeURIComponent(qrUrl));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptpay-qr-${amount}thb.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(decodeURIComponent(qrUrl), '_blank');
    }
  };

  if (!qrUrl) {
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
    <div className="min-h-screen bg-gradient-to-b from-[#003B71] via-[#00508F] to-[#0066B3] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-10 pb-4">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:bg-white/20 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
        </button>
        <div className="flex items-center gap-2">
          {/* PromptPay Logo */}
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="white"/>
            <path d="M30 35 L50 25 L70 35 L70 65 L50 75 L30 65 Z" fill="#003B71" stroke="#003B71" strokeWidth="2"/>
            <path d="M50 25 L50 75" stroke="white" strokeWidth="2"/>
            <path d="M30 35 L70 35" stroke="white" strokeWidth="2" opacity="0.5"/>
            <path d="M30 50 L70 50" stroke="white" strokeWidth="2" opacity="0.5"/>
            <path d="M30 65 L70 65" stroke="white" strokeWidth="2" opacity="0.5"/>
          </svg>
          <h1 className="text-lg font-black tracking-tight text-white">PromptPay</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-4">
        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">ยอดชำระ</p>
          <p className="text-5xl font-black text-white drop-shadow-lg">฿{Number(amount || 0).toLocaleString()}</p>
          {name && <p className="text-sm text-blue-200 font-medium mt-2">{decodeURIComponent(name)}</p>}
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-xs">
          {status === 'pending' && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={decodeURIComponent(qrUrl)}
                alt="PromptPay QR Code"
                className="w-full aspect-square rounded-2xl"
              />
              
              {/* Timer */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[#003B71]">
                <i className="fa-solid fa-clock text-xs" aria-hidden="true"></i>
                <span className="text-sm font-bold font-mono">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <p className="text-center text-xs text-slate-400 font-medium mt-1">
                สแกน QR ด้วยแอปธนาคาร
              </p>

              {/* Save QR Button */}
              <button
                onClick={handleSaveQR}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#003B71] hover:bg-[#002D57] text-white font-bold py-3.5 rounded-2xl active:scale-[0.98] transition-all shadow-md shadow-blue-900/20"
              >
                <i className="fa-solid fa-download text-sm" aria-hidden="true"></i>
                บันทึก QR
              </button>
            </>
          )}

          {status === 'succeeded' && (
            <div className="py-10 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-200">
                <i className="fa-solid fa-check text-[40px]" aria-hidden="true"></i>
              </div>
              <p className="text-xl font-black text-slate-800">ชำระเงินสำเร็จ!</p>
              <p className="text-sm text-slate-500 font-medium mt-1">กำลังพาไปหน้าถัดไป...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="py-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                <i className="fa-solid fa-xmark text-[40px]" aria-hidden="true"></i>
              </div>
              <p className="text-xl font-black text-slate-800 mb-2">QR หมดอายุ</p>
              <button
                onClick={() => window.history.back()}
                className="bg-[#003B71] text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-transform text-sm"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* Waiting indicator */}
        {status === 'pending' && (
          <div className="mt-6 flex items-center gap-2 text-blue-200">
            <i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true"></i>
            <span className="text-sm font-bold">กำลังรอการชำระเงิน...</span>
          </div>
        )}

        {/* PromptPay branding */}
        <div className="mt-6 flex items-center gap-3 opacity-60">
          <span className="text-xs font-bold text-blue-100">Powered by</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" fill="white"/>
              <path d="M30 35 L50 25 L70 35 L70 65 L50 75 L30 65 Z" fill="#003B71"/>
            </svg>
            <span className="text-xs font-black text-white">PromptPay</span>
          </div>
          <span className="text-blue-300">×</span>
          <span className="text-xs font-black text-white">Stripe</span>
        </div>
      </main>
    </div>
  );
}

// ── Card Checkout (Stripe Embedded) ──
function CardCheckout() {
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

// ── Main Page: routes to PromptPay QR or Card based on params ──
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const isPromptPay = searchParams.has('qr');

  if (isPromptPay) {
    return <PromptPayQR />;
  }

  return <CardCheckout />;
}
