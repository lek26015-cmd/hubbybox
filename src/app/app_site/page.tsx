'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/components/providers/liff-provider';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { CreateBoxDrawer } from '@/components/boxes/create-box-drawer';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import type { BoxListRow } from '@/lib/box-types';

export default function Home() {
  const router = useRouter();
  const { userProfile, dbUser, isLoading, error } = useLiff();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [boxes, setBoxes] = useState<BoxListRow[]>([]);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(true);
  const [boxesError, setBoxesError] = useState<string | null>(null);

  const fetchBoxes = useCallback(async () => {
    if (!dbUser?.id) {
      setBoxes([]);
      setBoxesError(null);
      setIsLoadingBoxes(false);
      return;
    }
    try {
      setIsLoadingBoxes(true);
      setBoxesError(null);

      const query = supabase
        .from('boxes')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });

      const timeoutMs = 15000;
      const { data, error } = await Promise.race([
        query,
        new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs)
        ),
      ]);

      if (error) {
        const msg =
          'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'โหลดกล่องไม่สำเร็จ';
        setBoxesError(msg);
        console.error('Error fetching boxes:', error);
        setBoxes([]);
      } else {
        setBoxes((data as BoxListRow[]) || []);
      }
    } catch (e: unknown) {
      setBoxes([]);
      setBoxesError(e instanceof Error && e.message === 'timeout' ? 'การเชื่อมต่อช้าเกินไป ลองใหม่อีกครั้ง' : 'โหลดกล่องไม่สำเร็จ');
      console.error('fetchBoxes:', e);
    } finally {
      setIsLoadingBoxes(false);
    }
  }, [dbUser?.id]);

  useEffect(() => {
    if (isLoading) return;
    void fetchBoxes();
  }, [dbUser?.id, isLoading, fetchBoxes]);

  useEffect(() => {
    if (!isLoadingBoxes || isLoading) return;
    const t = setTimeout(() => {
      setIsLoadingBoxes(false);
      setBoxesError((prev) => prev ?? 'โหลดนานผิดปกติ — ลองกดโหลดใหม่');
    }, 20000);
    return () => clearTimeout(t);
  }, [isLoadingBoxes, isLoading]);

  if (isLoading) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#e0f2fe] to-white font-sans gap-8">
          <div className="relative">
            <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[48px]" aria-hidden="true"></i>
            <div className="absolute inset-0 bg-white/40 blur-xl -z-10 rounded-full"></div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sky-600 font-bold tracking-widest text-sm animate-pulse uppercase">กำลังเตรียมความพร้อม...</span>
            {error && (
              <p className="text-rose-400 text-[10px] font-medium max-w-[200px] text-center italic">
                {error.message}
              </p>
            )}
          </div>

          <a 
            href="/?liff-bypass=1" 
            className="mt-8 text-xs text-sky-400 font-bold underline opacity-60 hover:opacity-100 transition-opacity"
          >
            เข้าไม่ได้? คลิกเพื่อเข้าหน้าแอปโดยตรง
          </a>
        </div>
      );
    }

  const quotaUsed = boxes.length;
  const quotaTotal = dbUser?.box_quota || 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white text-slate-800 font-sans pb-24">
      <main className="flex w-full flex-col px-6 py-8 max-w-md mx-auto">
        {/* Header Profile Area */}
        <header className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-16 h-16 transition-all">
               <Image 
                 src="/tsconfig-01.png" 
                 alt="HubbyBox" 
                 width={64} 
                 height={64} 
                 className="object-contain w-full h-full"
               />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">ยินดีต้อนรับ 👋</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 line-clamp-1">
                {userProfile?.displayName ? userProfile.displayName : 'พร้อมจัดกล่องหรือยัง?'}
              </h1>
            </div>
          </div>
          <Link href="/settings" className="relative w-12 h-12 flex items-center justify-center transition-all hover:scale-105 active:scale-95 rounded-full shadow-sm">
            {userProfile?.pictureUrl ? (
              <Image
                src={userProfile.pictureUrl}
                alt="Profile Settings"
                width={48}
                height={48}
                className="rounded-full flex-shrink-0 border-2 border-white shadow-sm object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-sky-100 shadow-sm">
                <i className="fa-solid fa-user text-sky-400 text-[20px]" aria-hidden="true"></i>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
               <i className="fa-solid fa-gear text-slate-400 text-[10px]" aria-hidden="true"></i>
            </div>
          </Link>
        </header>

        {/* 1. ค้นหาของ (Massive Multi-modal Search) */}
        <section className="mb-8 relative z-10 mt-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-4 text-center px-4 leading-tight">
            ต้องการค้นหาของในกล่องของคุณ<br/>
            <span className="text-primary/80">ให้ Hubby AI ช่วยหาได้เลย</span>
          </h2>
          <div className="relative shadow-sm rounded-2xl bg-white/70 backdrop-blur-2xl p-2 border border-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                const trimmed = q.trim();
                if (trimmed) router.push(`/search/results?q=${encodeURIComponent(trimmed)}`);
              }}
              className="relative"
            >
               <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-primary text-[26px]" aria-hidden="true"></i>
              <input 
                name="q"
                type="text" 
                placeholder="พิมพ์เพื่อค้นหาของ..."
                className="w-full bg-white border border-slate-100 focus:border-primary/20 focus:bg-white rounded-xl py-5 pl-[4.5rem] pr-6 text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              />
            </form>
            
            <div className="flex gap-2 mt-2">
                <Link 
                  href="/search/image"
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-primary/5 text-slate-600 hover:text-primary py-4 rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md border border-slate-100 hover:border-primary/10 active:scale-95 group"
                >
                   <div className="bg-primary/10 w-11 h-11 flex items-center justify-center rounded-xl text-primary group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-camera text-[22px]" aria-hidden="true"></i>
                   </div>
                   หาด้วยภาพ
                </Link>
                <Link 
                  href="/search/voice"
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-primary/5 text-slate-600 hover:text-primary py-4 rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md border border-slate-100 hover:border-primary/10 active:scale-95 group"
                >
                   <div className="bg-indigo-50 w-11 h-11 flex items-center justify-center rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-microphone text-[22px]" aria-hidden="true"></i>
                   </div>
                   สั่งด้วยเสียง
                </Link>
            </div>
          </div>
        </section>

        {/* 2. จัดกล่องใหม่ (Prominent Action Button) */}
        <section className="mb-8 z-0">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-full relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-[#2a7aeb] py-8 px-6 text-white hover:opacity-90 transition-all shadow-lg active:scale-[0.98] border border-white/20 group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 transition-transform duration-700 group-hover:rotate-45">
               <i className="fa-solid fa-box text-[120px]" aria-hidden="true"></i>
            </div>
            
            <div className="relative z-10 bg-white/20 w-16 h-16 flex items-center justify-center rounded-full backdrop-blur-md shadow-inner border border-white/30 mb-2">
               <i className="fa-solid fa-plus text-white text-[28px] drop-shadow-sm" aria-hidden="true"></i>
            </div>
            <span className="relative z-10 text-2xl font-bold tracking-wide text-white drop-shadow-sm">จัดกล่องใหม่</span>
            <p className="relative z-10 text-xs font-medium text-sky-50 opacity-90">แพ็คและบันทึกข้อมูลอย่างง่ายดาย</p>
          </button>
        </section>

        {/* Action Area (List) */}
        <section className="mb-4 flex-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-slate-700">กล่องของฉัน</h3>
            <span className="text-xs font-bold bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-slate-500 border border-slate-200 shadow-sm">
              โควต้า: {quotaUsed} / {quotaTotal} กล่อง
            </span>
          </div>

          {isLoadingBoxes ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-700">
               <div className="relative bg-white w-20 h-20 flex items-center justify-center rounded-2xl mb-6 shadow-lg ring-1 ring-slate-100 text-primary">
                <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[32px]" aria-hidden="true"></i>
                <div className="absolute inset-0 bg-sky-200/40 blur-xl -z-10 rounded-full pointer-events-none" aria-hidden />
               </div>
                <p className="text-sm font-medium text-slate-500 font-sans">กำลังโหลดกล่อง...</p>
                <button 
                  type="button"
                  onClick={() => void fetchBoxes()}
                  className="mt-2 text-xs text-sky-600 font-bold underline underline-offset-2 hover:text-primary"
                >
                  โหลดไม่ขึ้น? ลองใหม่
                </button>
            </div>
          ) : boxesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 py-10 px-6 text-center space-y-4 shadow-sm">
              <p className="text-sm font-bold text-rose-800 leading-relaxed">{boxesError}</p>
              {!dbUser?.id && (
                <p className="text-xs text-rose-600/90 font-medium">
                  ยังไม่มีข้อมูลผู้ใช้จากระบบ — ลองเปิดแอปจาก LINE หรือรีเฟรชหน้า
                </p>
              )}
              <button
                type="button"
                onClick={() => void fetchBoxes()}
                className="w-full max-w-xs mx-auto block rounded-xl bg-white border border-rose-200 text-rose-700 font-bold py-3 text-sm hover:bg-rose-100/50 transition-colors"
              >
                โหลดอีกครั้ง
              </button>
            </div>
          ) : boxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl md:rounded-3xl border border-dashed border-sky-300 bg-white/40 py-16 px-8 text-center backdrop-blur-md mt-4 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="bg-white w-20 h-20 flex items-center justify-center rounded-xl md:rounded-2xl mb-6 shadow-lg ring-1 ring-slate-100 text-primary">
                <i className="fa-solid fa-box-open text-[40px] opacity-40" aria-hidden="true"></i>
              </div>
              <h4 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีกล่อง</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">กดปุ่ม &ldquo;จัดกล่องใหม่&rdquo; ด้านบน<br/>เพื่อเริ่มบันทึกกล่องใบแรกเลย!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {boxes.map((box) => (
                <Link key={box.id} href={`/box/${box.id}`}>
                  <div className="group bg-white/80 backdrop-blur-md hover:bg-white border border-white/50 rounded-xl md:rounded-2xl p-5 transition-all flex items-center justify-between cursor-pointer active:scale-95 shadow-sm hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      {box.cover_image_url ? (
                        <div className="w-14 h-14 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-slate-100 overflow-hidden shrink-0">
                          <img src={box.cover_image_url} alt={box.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-primary/5 rounded-lg md:rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/10 shrink-0">
                          <i className="fa-solid fa-box text-[24px]" aria-hidden="true"></i>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-700 text-base leading-tight mb-1">{box.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                            box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
                              ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <i className={`fa-solid ${box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'fa-warehouse' : 'fa-location-dot'} text-[9px]`} aria-hidden="true"></i>
                            {box.location || 'ไม่ระบุสถานที่'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors border border-slate-100 group-hover:border-sky-100 group-hover:bg-sky-50">
                      <i className="fa-solid fa-chevron-right text-[18px]" aria-hidden="true"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <Link href="/settings/premium" className="mt-5 w-full relative overflow-hidden flex items-center justify-between gap-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 py-5 px-6 border border-indigo-100 shadow-sm transition-all group active:scale-[0.98]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                   <i className="fa-solid fa-gem text-[22px]" aria-hidden="true"></i>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 text-lg leading-tight mb-0.5">ซื้อกล่องเพิ่ม</h4>
                   <p className="text-xs font-medium text-indigo-400">ปลดล็อคข้อจำกัด เริ่มต้นแค่ 49.-</p>
                </div>
             </div>
             <i className="fa-solid fa-chevron-right text-indigo-300 group-hover:text-indigo-500 transition-colors" aria-hidden="true"></i>
          </Link>
        </section>
      </main>

      {/* Drawer */}
      <CreateBoxDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onBoxCreated={fetchBoxes} 
      />
    </div>
  );
}
