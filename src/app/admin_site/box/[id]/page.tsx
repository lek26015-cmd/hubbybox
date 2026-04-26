'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminBoxDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const boxId = unwrappedParams.id;

  const [box, setBox] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBox() {
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', boxId)
        .single();
      
      if (error || !data) {
        setError('ไม่พบข้อมูลกล่องนี้');
        setIsLoading(false);
      } else {
        setBox(data);
        setIsLoading(false);
      }
    }
    fetchBox();
  }, [boxId]);

  const handleVerifyAccess = async () => {
    if (!accessCode || accessCode.length !== 6) return;
    setIsVerifying(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('boxes')
        .select('access_code, access_code_expires_at')
        .eq('id', boxId)
        .single();

      if (error) throw error;

      const now = new Date();
      const expiry = new Date(data.access_code_expires_at);

      if (data.access_code === accessCode && now < expiry) {
        // Success: Fetch items
        const { data: itemsData } = await supabase
          .from('items')
          .select('*')
          .eq('box_id', boxId)
          .order('created_at', { ascending: false });
        
        setItems(itemsData || []);
        setIsLocked(false);
      } else if (now >= expiry) {
        setError('รหัสผ่านหมดอายุแล้ว กรุณาขอรหัสใหม่จากลูกค้า');
      } else {
        setError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบรหัส');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-admin-bg">
        <i className="fa-solid fa-spinner fa-spin text-vora-accent text-4xl"></i>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-full bg-admin-bg flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-12 shadow-2xl border border-admin-border text-center">
           <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-vora-accent mx-auto mb-8 shadow-2xl shadow-black/10">
              <i className="fa-solid fa-lock text-4xl"></i>
           </div>
           <h2 className="text-2xl font-black text-admin-text-primary mb-2 tracking-tight">Box is Private</h2>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-12">Admin Consent Required</p>
           
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter 6-Digit Access Code</label>
                 <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 text-center text-4xl font-black text-admin-text-primary tracking-[0.2em] focus:outline-none focus:border-vora-accent/30 transition-all shadow-inner"
                 />
                 <p className="text-[10px] text-slate-400 font-medium italic">* รหัสนี้ต้องขอจากลูกค้าโดยตรง (มีอายุ 15 นาที)</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100 animate-shake">
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                   onClick={() => router.back()}
                   className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Go Back
                 </button>
                 <button 
                   onClick={handleVerifyAccess}
                   disabled={isVerifying || accessCode.length !== 6}
                   className="flex-[2] py-4 bg-vora-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                 >
                   {isVerifying ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-key mr-2"></i>}
                   Verify & Unlock
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 bg-admin-bg">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-10 border-b border-admin-border">
            <div className="flex items-center gap-6">
               <Link href="/admin_site/warehouse" className="w-12 h-12 bg-white border border-admin-border rounded-xl flex items-center justify-center text-slate-400 hover:text-vora-accent hover:border-vora-accent/30 transition-all shadow-sm">
                  <i className="fa-solid fa-arrow-left"></i>
               </Link>
               <div>
                  <h2 className="text-3xl font-black text-admin-text-primary tracking-tighter">Inventory Audit</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                     Inspecting: <span className="text-vora-accent">{box.name}</span>
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest border border-emerald-200">
                  <i className="fa-solid fa-shield-check mr-2"></i>
                  Access Verified
               </span>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Box Summary */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white rounded-3xl p-8 border border-admin-border shadow-sm">
                  {box.cover_image_url ? (
                    <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-6 border border-admin-border">
                       <img src={box.cover_image_url} alt={box.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-admin-border border-dashed">
                       <i className="fa-solid fa-box-open text-[100px]"></i>
                    </div>
                  )}
                  <h3 className="text-xl font-black text-admin-text-primary mb-2 tracking-tight">{box.name}</h3>
                  <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-vora-accent"></i>
                        {box.location}
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-user text-vora-accent"></i>
                        Owner ID: {box.user_id.slice(0, 15)}...
                     </span>
                  </div>
               </div>
            </div>

            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-3xl border border-admin-border shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-admin-border flex items-center justify-between bg-slate-50/50">
                     <h3 className="font-black text-lg text-admin-text-primary">รายการของภายใน ({items.length})</h3>
                     <div className="w-10 h-10 bg-white rounded-xl border border-admin-border flex items-center justify-center text-slate-400">
                        <i className="fa-solid fa-list-ul"></i>
                     </div>
                  </div>
                  <div className="divide-y divide-admin-border max-h-[600px] overflow-y-auto custom-scrollbar">
                     {items.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 italic">
                           <p>กล่องนี้ยังไม่มีรายการของ</p>
                        </div>
                     ) : (
                        items.map((item) => (
                           <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                              <div className="flex items-center gap-5">
                                 {item.image_url ? (
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-admin-border shadow-sm group-hover:scale-105 transition-transform">
                                       <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                 ) : (
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 border border-admin-border group-hover:scale-105 transition-transform">
                                       <i className="fa-solid fa-image"></i>
                                    </div>
                                 )}
                                 <div>
                                    <p className="font-black text-admin-text-primary text-sm group-hover:text-vora-accent transition-colors">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {item.id.slice(0, 8).toUpperCase()}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="w-9 h-9 rounded-lg bg-white border border-admin-border text-slate-400 hover:text-vora-accent transition-all flex items-center justify-center">
                                    <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                 </button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
