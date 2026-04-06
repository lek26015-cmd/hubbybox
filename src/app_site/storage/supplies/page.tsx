'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const PRODUCTS = [
  {
    id: 'set-s',
    name: 'Hubby Starter Set (S)',
    desc: 'สำหรับของจุกจิก ของสะสม หรือเครื่องประดับ',
    price: 199,
    image: '/box-s.png', // Placeholder or generated later
    color: 'bg-sky-400',
    tags: ['5 กล่อง', 'ขนาด 20x30 ซม.']
  },
  {
    id: 'set-m',
    name: 'Hubby Standard Set (M)',
    desc: 'ขนาดมาตรฐานสำหรับเสื้อผ้า หรืออุปกรณ์ไอที',
    price: 399,
    image: '/box-m.png',
    color: 'bg-indigo-500',
    tags: ['5 กล่อง', 'ขนาด 40x50 ซม.']
  },
  {
    id: 'set-l',
    name: 'Hubby Jumbo Set (L)',
    desc: 'สำหรับผ้านวม หมอน หรือของชิ้นใหญ่น้ำหนักเบา',
    price: 599,
    image: '/box-l.png',
    color: 'bg-slate-800',
    tags: ['3 กล่อง', 'ขนาด 60x80 ซม.']
  }
];

export default function HubbySuppliesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
        >
          <i className="fa-notdog fa-solid fa-arrow-left text-sm" aria-hidden="true"></i>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">Hubby Supplies</h1>
          <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mt-1">สั่งซื้ออุปกรณ์จัดเก็บ</p>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
          <i className="fa-notdog fa-solid fa-cart-shopping text-sm" aria-hidden="true"></i>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
              <i className="fa-notdog fa-solid fa-bag-shopping text-[100px]" aria-hidden="true"></i>
           </div>
           <h2 className="text-2xl font-black mb-2 relative z-10">ชุดกล่องมาตรฐาน</h2>
           <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium relative z-10">
              แข็งแรง ทนทาน และมีรหัส QR Code<br/>รองรับระบบการสแกนของ HubbyBox โดยเฉพาะ
           </p>
           <div className="flex items-center gap-2 relative z-10">
              <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">แข็งแรงพิเศษ</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">กันความชื้นได้</div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {PRODUCTS.map((product, i) => (
             <motion.div 
               key={product.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col gap-6"
             >
                <div className="flex gap-5">
                   <div className={`w-28 h-28 ${product.color} rounded-3xl shrink-0 flex items-center justify-center text-white relative overflow-hidden shadow-inner`}>
                      <div className="absolute inset-0 bg-white/10 rotate-45 translate-x-12 -translate-y-12"></div>
                      <i className="fa-notdog fa-solid fa-box text-4xl" aria-hidden="true"></i>
                   </div>
                   <div className="flex flex-col justify-center gap-1">
                      <h3 className="font-black text-lg text-slate-800 leading-tight">{product.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{product.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                         {product.tags.map(tag => (
                           <span key={tag} className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-tighter">
                              {tag}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ราคาเพียง</span>
                      <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                         ฿{product.price} <span className="text-[10px] text-slate-400 font-bold uppercase">/ ชุด</span>
                      </p>
                   </div>
                   <button 
                     onClick={() => alert(`คุณได้สั่งซื้อ ${product.name} เรียบร้อย! ทีมงานจะติดต่อกลับเพื่อยืนยันการจัดส่งภายใน 24 ชม. ครับ 🙏`)}
                     className="bg-primary text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                   >
                      สั่งซื้อเลย
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </main>

      <div className="px-8 mt-4">
         <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
               <i className="fa-notdog fa-solid fa-truck-fast text-xl" aria-hidden="true"></i>
            </div>
            <p className="text-[11px] text-indigo-900 font-bold leading-relaxed">
               จัดส่งฟรี! ทั่วประเทศเมื่อสั่งซื้อครบ 500 บาทขึ้นไป<br/>
               <span className="text-indigo-400 font-medium">จัดส่งด่วนภายใน 1-3 วันทำการ</span>
            </p>
         </div>
      </div>
    </div>
  );
}
