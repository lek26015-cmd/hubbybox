'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchResultsPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const params = use(searchParams);
  const query = params.q || '';
  const { dbUser, isLoading: isLiffLoading } = useLiff();
  
  const [results, setResults] = useState<{ boxes: any[], items: any[] }>({ boxes: [], items: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!dbUser?.id || !query) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Search Boxes
        const { data: boxesData } = await supabase
          .from('boxes')
          .select('*')
          .eq('user_id', dbUser.id)
          .ilike('name', `%${query}%`);

        // Search Items (Join with boxes to show which box they are in)
        const { data: itemsData } = await supabase
          .from('items')
          .select('*, boxes!inner(name, id, user_id)')
          .eq('boxes.user_id', dbUser.id)
          .ilike('name', `%${query}%`);

        setResults({
          boxes: boxesData || [],
          items: itemsData || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (dbUser?.id) performSearch();
  }, [dbUser?.id, query]);

  const totalResults = results.boxes.length + results.items.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <Link 
          href="/"
          className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"
        >
          <i className="fa-notdog fa-solid fa-arrow-left text-sm" aria-hidden="true"></i>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-lg text-slate-800 leading-none">ผลการค้นหา</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">"{query}"</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto p-6 pt-8">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <i className="fa-notdog fa-solid fa-spinner fa-spin text-primary text-[48px]" aria-hidden="true"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">กำลังค้นหาในบ้านของคุณ...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 shadow-xl border border-slate-100">
                <i className="fa-notdog fa-solid fa-magnifying-glass text-4xl"></i>
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">ไม่พบสิ่งที่คุณหา</h2>
             <p className="text-slate-500 font-medium px-8 leading-relaxed italic">"ลองหาชื่ออื่น หรือสร้างกล่องใหม่ดูสิครับ"</p>
             <Link href="/" className="mt-10 bg-primary text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                กลับหน้าหลัก
             </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Box Results */}
            {results.boxes.length > 0 && (
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <i className="fa-notdog fa-solid fa-boxes-stacked" aria-hidden="true"></i>
                  กล่องที่พบ ({results.boxes.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {results.boxes.map(box => (
                    <Link key={box.id} href={`/box/${box.id}`}>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
                         <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                            {box.cover_image_url ? (
                              <img src={box.cover_image_url} alt={box.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <i className="fa-notdog fa-solid fa-box text-xl"></i>
                            )}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{box.name}</h4>
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                               <i className="fa-notdog fa-solid fa-location-dot"></i>
                               {box.location || 'ที่บ้าน'}
                            </p>
                         </div>
                         <i className="fa-notdog fa-solid fa-chevron-right text-slate-200 group-hover:text-primary transition-colors"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Item Results */}
            {results.items.length > 0 && (
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <i className="fa-notdog fa-solid fa-layer-group" aria-hidden="true"></i>
                  สิ่งของที่พบ ({results.items.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {results.items.map(item => (
                    <Link key={item.id} href={`/box/${item.box_id}`}>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
                         <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 transition-transform group-hover:scale-110">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <i className="fa-notdog fa-solid fa-tag text-xl"></i>
                            )}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{item.name}</h4>
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                               <i className="fa-notdog fa-solid fa-box-open scale-75"></i>
                               อยู่ในกล่อง: <span className="text-indigo-500 font-bold">{item.boxes?.name}</span>
                            </p>
                         </div>
                         <i className="fa-notdog fa-solid fa-arrow-right-to-bracket text-slate-200 group-hover:text-indigo-500 transition-colors"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
