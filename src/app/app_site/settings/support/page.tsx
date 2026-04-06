'use client';

import Link from 'next/link';

export default function SupportPage() {
  const faqs = [
    { q: 'เพิ่มกล่องได้สูงสุดกี่ใบ?', a: 'สำหรับผู้ใช้ทั่วไป สามารถเพิ่มได้ 3 ใบ หากต้องการเพิ่มมากกว่านั้นสามารถอัปเกรดเป็น Premium ได้ครับ' },
    { q: 'Hubby AI ค้นหาของจากอะไร?', a: 'Hubby AI ใช้ทั้งข้อความ รูปภาพ และเสียง ในการวิเคราะห์และจดจำตำแหน่งของของแต่ละชิ้นครับ' },
    { q: 'ข้อมูลเลือนหายถ้าลบไลน์ไหม?', a: 'ข้อมูลผูกกับ LINE ID ครับ หากล็อกอินด้วยบัญชีเดิมข้อมูลจะยังอยู่ครบถ้วน' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white text-slate-800 font-sans pb-12">
       {/* Header */}
       <header className="flex items-center gap-4 p-6 pt-10">
          <Link href="/settings" className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all">
             <i className="fa-solid fa-arrow-left text-slate-400 text-sm" aria-hidden="true"></i>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">ช่วยเหลือและแนะนำ</h1>
       </header>

       <main className="px-6 space-y-8">
          {/* Support Hero Section */}
          <section>
             <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white text-center mb-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 scale-150 text-sky-400">
                    <i className="fa-solid fa-headset text-[120px]" aria-hidden="true"></i>
                </div>
                <div className="relative z-10 bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center text-sky-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <i className="fa-solid fa-headset text-2xl" aria-hidden="true"></i>
                </div>
                <h2 className="relative z-10 text-xl font-black mb-2">เจ้าหน้าที่ Hubby Support</h2>
                <p className="relative z-10 text-sm text-slate-500 font-medium mb-6">พบปัญหาการใช้งานหรือมีข้อเสนอแนะ?<br/>ทักแชทหาพวกเราผ่าน LINE ได้เลยครับ</p>
                <button className="relative z-10 w-full bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all">
                   แชทกับเจ้าหน้าที่
                </button>
             </div>
          </section>

          {/* FAQs Section */}
          <section>
             <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest mb-4 px-2">คำถามที่พบบ่อย (FAQ)</h3>
             <div className="space-y-3">
                {faqs.map((faq, i) => (
                   <div key={i} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white shadow-sm hover:bg-white transition-colors duration-500">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-start gap-4">
                         <span className="text-sky-500 mt-1">
                            <i className="fa-solid fa-circle-question" aria-hidden="true"></i>
                         </span>
                         {faq.q}
                      </h4>
                      <div className="pl-8">
                         <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {faq.a}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* Footer Info */}
          <section className="pt-4">
             <div className="bg-white/40 p-6 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-400 font-bold mb-1">Hubbybox Service Center</p>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Version 1.0.0 (Building 2026.04.05)</p>
             </div>
          </section>
       </main>
    </div>
  );
}
