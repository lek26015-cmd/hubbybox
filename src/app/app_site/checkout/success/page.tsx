'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
      
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-100 relative">
        <motion.i 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="fa-solid fa-check text-[48px]" 
          aria-hidden="true"
        />
      </div>

      <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">ชำระเงินสำเร็จ!</h1>
      <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed px-4">
        ขอบคุณที่ไว้วางใจ HubbyBox ครับ<br/>
        คำสั่งซื้อ <span className="text-primary font-black">#{orderId?.slice(0, 8).toUpperCase()}</span> ของคุณกำลังอยู่ในการดำเนินการ
      </p>

      <div className="space-y-3">
        <Link 
          href="/storage"
          className="block w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          ไปที่คลังของฉัน
        </Link>
        <button 
          onClick={() => router.push('/')}
          className="block w-full text-slate-400 font-bold text-xs uppercase tracking-widest pt-2"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-primary text-[40px]" aria-hidden="true"></i>
          <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">กำลังโหลด...</p>
        </div>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
