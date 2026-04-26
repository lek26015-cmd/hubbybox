'use client';

import { useLiff } from '@/components/providers/liff-provider';
import Link from 'next/link';
import Image from 'next/image';

export default function SettingsPage() {
  const { userProfile, dbUser, liff, isLoading } = useLiff();

  const handleLogout = () => {
    if (liff && liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    } else {
      alert('คุณไม่ได้ล็อกอินผ่าน LINE ในขณะนี้ (หรืออยู่ในโหมดนักพัฒนา)');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#e0f2fe] to-white">
        <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[40px]" aria-hidden="true"></i>
      </div>
    );
  }

  const quotaUsed = '...'; // We would need boxes length here, but for now we can just show total quota or skip used
  const quotaTotal = dbUser?.box_quota || 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white text-slate-800 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-white/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-50 hover:text-primary">
           <i className="fa-solid fa-arrow-left text-[20px]" aria-hidden="true"></i>
        </Link>
        <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">ตั้งค่า</h1>
        </div>
        <div className="w-11"></div> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col pt-8">
        
        {/* Profile Card */}
        <section className="bg-white/80 backdrop-blur-md border border-white shadow-[0_15px_40px_-15px_rgba(56,189,248,0.3)] rounded-[1.5rem] p-4 mb-8 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 scale-150 text-sky-400">
               <i className="fa-solid fa-user text-[100px]" aria-hidden="true"></i>
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 shrink-0">
                 {userProfile?.pictureUrl ? (
                   <Image
                     src={userProfile.pictureUrl}
                     alt="Profile"
                     width={64}
                     height={64}
                     className="rounded-full shadow-sm border-2 border-white object-cover w-full h-full"
                   />
                 ) : (
                   <div className="w-full h-full bg-sky-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                     <i className="fa-solid fa-user text-sky-400 text-[24px]" aria-hidden="true"></i>
                   </div>
                 )}
              </div>
              <div className="flex flex-col text-left">
                 <h2 className="text-lg font-black text-slate-800 leading-tight line-clamp-1">{userProfile?.displayName || 'ผู้ใช้ Hubbybox'}</h2>
                 <p className="text-[11px] font-medium text-slate-500 mt-0.5">ID: {userProfile?.userId?.substring(0, 10)}...</p>
              </div>
           </div>
           <button 
             onClick={() => alert('ฟีเจอร์แก้ไขโปรไฟล์กำลังพัฒนา (Coming Soon)')} 
             className="relative z-10 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors shrink-0 border border-slate-100"
             title="แก้ไขโปรไฟล์"
           >
              <i className="fa-solid fa-pen text-sm" aria-hidden="true"></i>
           </button>
        </section>

        {/* Account Settings */}
        <h3 className="font-bold text-sm text-slate-500 px-2 mb-3">บัญชีของฉัน</h3>
        <section className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem] mb-6 overflow-hidden">
           <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-4 text-slate-700">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <i className="fa-solid fa-box text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg">โควต้าสร้างกล่อง</span>
              </div>
              <span className="font-bold text-primary text-lg">{quotaTotal} กล่อง</span>
           </div>
            <Link href="/settings/address" className="w-full p-5 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-4 text-slate-700">
                 <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 group-hover:bg-sky-100 transition-colors">
                    <i className="fa-solid fa-location-dot text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg group-hover:text-sky-600 transition-colors">ที่อยู่จัดส่ง</span>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-sky-400 transition-colors" aria-hidden="true"></i>
            </Link>
           <Link href="/settings/premium" className="w-full p-5 flex items-center justify-between bg-slate-50 hover:bg-indigo-50/50 active:bg-indigo-50 transition-colors group">
              <div className="flex items-center gap-4 text-slate-700">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                    <i className="fa-solid fa-gem text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg group-hover:text-indigo-600 transition-colors">อัปเกรดเป็น Premium</span>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-indigo-400 transition-colors" aria-hidden="true"></i>
           </Link>
        </section>

        {/* General Settings */}
        <h3 className="font-bold text-sm text-slate-500 px-2 mb-3">ช่วยเหลือ</h3>
        <section className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem] mb-6 overflow-hidden">
           <Link href="/settings/support" className="w-full p-5 flex items-center justify-between border-b border-slate-100 hover:bg-white active:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4 text-slate-700">
                 <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 group-hover:bg-sky-100 transition-colors">
                    <i className="fa-solid fa-circle-question text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg group-hover:text-sky-600 transition-colors">ช่วยเหลือและแนะนำ</span>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-sky-400 transition-colors" aria-hidden="true"></i>
           </Link>
           <button onClick={handleLogout} className="w-full p-5 flex items-center justify-between hover:bg-white active:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4 text-rose-600">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-right-from-bracket text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg">ออกจากระบบ</span>
              </div>
           </button>
        </section>

        {/* Support Us */}
        <h3 className="font-bold text-sm text-slate-500 px-2 mb-3">สนับสนุนเรา</h3>
        <section className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem] mb-8 overflow-hidden">
           <Link href="/settings/donate" className="w-full p-5 flex items-center justify-between hover:bg-white active:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4 text-slate-700">
                 <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                    <i className="fa-solid fa-heart text-[18px]" aria-hidden="true"></i>
                 </div>
                 <span className="font-bold text-lg group-hover:text-rose-600 transition-colors">เลี้ยงขนมน้อง Hubby</span>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-rose-400 transition-colors" aria-hidden="true"></i>
           </Link>
        </section>

        <p className="text-center text-xs font-bold text-slate-400 mb-8">Hubbybox v0.1.0</p>

      </main>
    </div>
  );
}
