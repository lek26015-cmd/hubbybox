'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiff } from '@/components/providers/liff-provider';
import { supabase } from '@/lib/supabase';

export default function SupportPage() {
  const { dbUser } = useLiff();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const faqs = [
    { q: 'เพิ่มกล่องได้สูงสุดกี่ใบ?', a: 'สำหรับผู้ใช้ทั่วไป สามารถเพิ่มได้ 3 ใบ หากต้องการเพิ่มมากกว่านั้นสามารถอัปเกรดเป็น Premium ได้ครับ' },
    { q: 'Hubby AI ค้นหาของจากอะไร?', a: 'Hubby AI ใช้ทั้งข้อความ รูปภาพ และเสียง ในการวิเคราะห์และจดจำตำแหน่งของของแต่ละชิ้นครับ' },
    { q: 'ข้อมูลเลือนหายถ้าลบไลน์ไหม?', a: 'ข้อมูลผูกกับ LINE ID ครับ หากล็อกอินด้วยบัญชีเดิมข้อมูลจะยังอยู่ครบถ้วน' },
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) {
      alert('กรุณารอระบบโหลดข้อมูลสักครู่...');
      return;
    }
    if (!subject || !description) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: dbUser.id,
          subject,
          description,
          priority,
          status: 'open'
        });

      if (error) throw error;
      setSuccess(true);
      setSubject('');
      setDescription('');
    } catch (err) {
      console.error('Failed to send ticket:', err);
      alert('ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* Support Ticket Form */}
          <section>
             <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white mb-10 shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6">
                   <div className="bg-sky-50 w-12 h-12 rounded-2xl flex items-center justify-center text-sky-500 group-hover:rotate-12 transition-transform">
                      <i className="fa-solid fa-headset text-xl" aria-hidden="true"></i>
                   </div>
                   <h2 className="text-lg font-black">แจ้งปัญหาการใช้งาน</h2>
                </div>

                {success ? (
                   <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                         <i className="fa-solid fa-check text-2xl"></i>
                      </div>
                      <p className="font-bold text-slate-800">ส่งข้อความเรียบร้อย!</p>
                      <p className="text-xs text-slate-500 mt-1">เจ้าหน้าที่จะเร่งดำเนินการตรวจสอบให้ครับ</p>
                      <button 
                        onClick={() => setSuccess(false)}
                        className="mt-6 text-sky-500 font-black text-xs uppercase tracking-widest"
                      >
                        ส่งเรื่องเพิ่ม
                      </button>
                   </div>
                ) : (
                   <form onSubmit={handleSubmitTicket} className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หัวข้อเรื่อง</label>
                         <input 
                            type="text" 
                            placeholder="เช่น แจ้งของพัง, สอบถามคลัง"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-sky-200 transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รายละเอียด</label>
                         <textarea 
                            rows={3}
                            placeholder="ระบุปัญหาที่พบ..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-sky-200 transition-all resize-none"
                         />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              priority === p ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button 
                        disabled={isSubmitting}
                        className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                      >
                         {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                         ส่งข้อความหา Support
                      </button>
                   </form>
                )}
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
          <section className="pt-4 pb-12">
             <div className="bg-white/40 p-6 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-400 font-bold mb-1">Hubbybox Service Center</p>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Version 2.0.4 (Active Sync)</p>
             </div>
          </section>
       </main>
    </div>
  );
}

