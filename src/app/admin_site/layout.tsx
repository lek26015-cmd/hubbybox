'use client';

import { Kodchasan } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/components/auth/admin-auth-provider';

const kodchasan = Kodchasan({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-kodchasan',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
       <AdminInnerLayout>{children}</AdminInnerLayout>
    </AdminAuthProvider>
  );
}

function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin_site/login' || pathname === '/login';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
     { id: 1, icon: "fa-box-open", color: "text-vora-accent", bgColor: "bg-vora-accent/10", title: "พัสดุมาถึงใหม่", desc: "กล่อง #HB-4022 ถึงคลังหลักแล้ว", time: "2 นาทีที่แล้ว", isNew: true },
     { id: 2, icon: "fa-circle-check", color: "text-emerald-500", bgColor: "bg-emerald-500/10", title: "ยืนยันการฝากสำเร็จ", desc: "ลูกค้ายืนยันรายการฝาก 12 รายการ", time: "1 ชั่วโมงที่แล้ว", isNew: true },
     { id: 3, icon: "fa-triangle-exclamation", color: "text-amber-500", bgColor: "bg-amber-500/10", title: "ระบบใกล้เต็ม", desc: "Zone A รับพัสดุได้อีกเพียง 5 กล่อง", time: "3 ชั่วโมงที่แล้ว", isNew: true },
     { id: 4, icon: "fa-user-plus", color: "text-primary", bgColor: "bg-primary/10", title: "สมาชิกใหม่", desc: "คุณมินตรา สมัครสมาชิกผ่าน LINE", time: "เมื่อวานนี้", isNew: false },
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside to close menus
  useEffect(() => {
     function handleClickOutside(event: MouseEvent) {
        // If clicking inside a ref, don't close its corresponding menu
        const isInsideNotification = notificationRef.current?.contains(event.target as Node);
        const isInsideProfile = profileRef.current?.contains(event.target as Node);

        if (!isInsideNotification) setIsNotificationsOpen(false);
        if (!isInsideProfile) setIsProfileOpen(false);
     }
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number) => {
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
  };

  const newCount = notifications.filter(n => n.isNew).length;

  // Auth Guard
  if (isAuthLoading) {
     return (
        <div className="min-h-full bg-admin-bg flex items-center justify-center">
           <i className="fa-solid fa-spinner fa-spin text-vora-accent text-[40px]" />
        </div>
     );
  }

  // Redirect to login if not authenticated and not on login page
  if (!isAuthenticated && !isLoginPage) {
     if (typeof window !== 'undefined') {
        router.replace('/admin_site/login');
     }
     return null;
  }

  // If login page, don't show the dashboard layout
  if (isLoginPage) {
     return (
        <div className={`${kodchasan.className} min-h-full bg-admin-bg`}>
           {children}
        </div>
     );
  }

  return (
    <div className={`${kodchasan.className} min-h-full flex flex-col bg-admin-bg text-admin-text-secondary relative selection:bg-vora-accent/30`}>
         {/* Sidebar Overlay (Mobile) */}
         {isSidebarOpen && (
            <div 
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] xl:hidden"
               onClick={() => setIsSidebarOpen(false)}
            >
               <aside 
                  className="w-72 h-full bg-admin-card border-r border-admin-border flex flex-col p-8 animate-in slide-in-from-left duration-300"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4 group">
                     <div className="w-10 h-10 bg-vora-accent rounded-xl flex items-center justify-center shadow-xl shadow-vora-accent/30 group-hover:scale-105 transition-transform">
                        <Image src="/logo-hubbybox.png" alt="HubbyBox" width={28} height={28} className="object-contain brightness-0 invert" />
                     </div>
                     <span className="text-xl font-black tracking-tighter text-admin-text-primary group-hover:text-vora-accent transition-colors">HubbyBox.</span>
                  </div>
                  <button type="button" aria-label="ปิดเมนู" onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                     <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  </div>
                  
                  <nav className="flex-1 flex flex-col gap-1" aria-label="เมนูหลัก">
                     <NavItem href="/admin_site" icon="fa-chart-pie" label="Dashboard" pathname={pathname} />
                     <NavItem href="/admin_site/warehouse" icon="fa-warehouse" label="คลัง & ฝาก" pathname={pathname} />
                     <NavItem href="/admin_site/management" icon="fa-users-gear" label="Management" pathname={pathname} />
                     <NavItem href="/admin_site/logs" icon="fa-server" label="System Logs" pathname={pathname} />
                     <div className="mt-8 mb-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-4">Analytics</div>
                     <NavItem href="/admin_site/usage" icon="fa-bullseye" label="Usage Rate" pathname={pathname} />
                     <NavItem href="/admin_site/conversion" icon="fa-chart-line" label="Conversions" pathname={pathname} />
                     <div className="mt-8 mb-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-4">Support</div>
                     <NavItem href="/admin_site/tickets" icon="fa-headset" label="Tickets" pathname={pathname} />
                  </nav>
               </aside>
            </div>
         )}

         <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden xl:flex w-72 bg-admin-card border-r border-admin-border flex flex-col p-8 z-50 overflow-y-auto">
               <Link href="/admin_site" className="flex items-center gap-4 mb-12 group cursor-pointer">
                  <div className="w-12 h-12 bg-vora-accent rounded-xl flex items-center justify-center shadow-2xl shadow-vora-accent/10 transition-transform group-hover:scale-110">
                     <Image src="/logo-hubbybox.png" alt="HubbyBox" width={32} height={32} className="object-contain brightness-0 invert" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xl font-black tracking-tighter text-admin-text-primary leading-none">HubbyBox.</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Panel</span>
                  </div>
               </Link>
               
               <nav className="flex-1 flex flex-col gap-1" aria-label="เมนูหลัก">
                  <NavItem href="/admin_site" icon="fa-chart-pie" label="Dashboard" pathname={pathname} />
                  <NavItem href="/admin_site/warehouse" icon="fa-warehouse" label="คลัง & ฝาก" pathname={pathname} />
                  <NavItem href="/admin_site/management" icon="fa-users-gear" label="Management" pathname={pathname} />
                  <NavItem href="/admin_site/logs" icon="fa-server" label="System Logs" pathname={pathname} />
                  <div className="mt-8 mb-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-4">Analytics</div>
                  <NavItem href="/admin_site/usage" icon="fa-bullseye" label="Usage Rate" pathname={pathname} />
                  <NavItem href="/admin_site/conversion" icon="fa-chart-line" label="Conversions" pathname={pathname} />
                  <div className="mt-8 mb-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-4">Support</div>
                  <NavItem href="/admin_site/tickets" icon="fa-headset" label="Tickets" pathname={pathname} />
               </nav>
               
               <div className="mt-auto pt-8 border-t border-admin-border opacity-50">
                  <p className="text-[10px] font-bold text-center uppercase tracking-[0.2em] text-slate-400">HubbyBox © 2026</p>
               </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-0">
               {/* Global Header */}
               <header className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between border-b border-admin-border bg-admin-card/80 backdrop-blur-md z-[100] relative pointer-events-auto">
                  <div className="flex items-center gap-4 flex-1">
                     <button 
                        type="button"
                        aria-label="เปิดเมนู"
                        onClick={() => setIsSidebarOpen(true)}
                        className="xl:hidden w-10 h-10 bg-admin-card rounded-xl flex items-center justify-center text-slate-400 border border-admin-border shadow-sm"
                     >
                        <i className="fa-solid fa-bars"></i>
                     </button>
                     <div className="relative w-full max-w-md group hidden sm:block">
                        <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input 
                           type="text" 
                           placeholder="Search commands, users..." 
                           className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 pl-14 pr-6 text-sm font-medium text-admin-text-primary placeholder-slate-400 focus:outline-none focus:border-vora-accent/30 transition-all shadow-sm"
                        />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 lg:gap-6">
                      <div className="flex items-center gap-3">
                         <div className="relative" ref={notificationRef}>
                             <button 
                                type="button"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setIsNotificationsOpen(prev => !prev);
                                }}
                                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center border transition-all shadow-sm relative z-[60] cursor-pointer ${isNotificationsOpen ? 'bg-vora-accent text-white border-vora-accent shadow-vora-accent/20' : 'bg-admin-card text-slate-400 border-admin-border hover:border-slate-300'}`}
                             >
                                <i className="fa-solid fa-bell text-sm"></i>
                                {newCount > 0 && (
                                   <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-admin-card scale-in-center"></div>
                                )}
                             </button>

                             {/* Notifications Dropdown */}
                             {isNotificationsOpen && (
                                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-admin-card/95 backdrop-blur-xl border border-admin-border rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                   <div className="p-6 border-b border-admin-border flex items-center justify-between">
                                      <h5 className="font-black text-admin-text-primary tracking-tight">การแจ้งเตือน</h5>
                                      {newCount > 0 && (
                                         <span className="text-[10px] font-bold text-vora-accent bg-vora-accent/10 px-2 py-1 rounded-lg uppercase tracking-widest transition-all duration-300">
                                            {newCount} ใหม่
                                         </span>
                                      )}
                                   </div>
                                   
                                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                      {notifications.length > 0 ? (
                                         notifications.map((notification) => (
                                            <NotificationItem 
                                               key={notification.id}
                                               {...notification}
                                               onClick={() => handleMarkAsRead(notification.id)}
                                            />
                                         ))
                                      ) : (
                                         <div className="p-12 text-center text-slate-400">
                                            <i className="fa-solid fa-bell-slash text-2xl mb-2"></i>
                                            <p className="text-xs font-bold uppercase tracking-widest">ไม่มีการแจ้งเตือน</p>
                                         </div>
                                      )}
                                   </div>
                                   
                                   <Link 
                                      href="/admin_site/notifications" 
                                      onClick={() => setIsNotificationsOpen(false)}
                                      className="block p-4 text-center text-xs font-bold text-slate-400 hover:text-vora-accent hover:bg-admin-bg transition-colors border-t border-admin-border"
                                   >
                                      ดูการแจ้งเตือนทั้งหมด
                                   </Link>
                                </div>
                             )}

                         </div>
                        <Link href="/admin_site/messages" className="hidden md:flex w-9 h-9 lg:w-10 lg:h-10 bg-admin-card rounded-lg flex items-center justify-center text-slate-400 border border-admin-border cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                           <i className="fa-solid fa-envelope text-sm"></i>
                        </Link>
                     </div>
                     <div className="h-6 lg:h-8 w-px bg-admin-border mx-1 lg:mx-2"></div>
                     <div className="relative z-[60]" ref={profileRef}>
                        <div 
                           onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileOpen(prev => !prev);
                           }}
                           className="flex items-center gap-3 lg:gap-4 group cursor-pointer"
                        >
                           <div className="hidden lg:flex flex-col items-end">
                              <span className="text-sm font-black text-admin-text-primary group-hover:text-vora-accent transition-colors leading-none">Peter Parkur</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin</span>
                           </div>
                           <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-admin-card border-2 border-vora-accent/10 p-1 group-hover:scale-105 transition-transform overflow-hidden">
                              <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black relative border border-slate-200">
                                 <span className="text-sm lg:text-lg">PP</span>
                              </div>
                           </div>
                        </div>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                           <div className="absolute right-0 mt-4 w-64 bg-admin-card/95 backdrop-blur-xl border border-admin-border rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden p-2">
                              <div className="p-4 border-b border-admin-border mb-2">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                 <p className="text-sm font-black text-admin-text-primary break-all">Admin User</p>
                              </div>
                              <Link href="/admin_site/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-admin-bg transition-colors group">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-vora-accent transition-colors">
                                    <i className="fa-solid fa-gear text-xs"></i>
                                 </div>
                                 <span className="text-xs font-bold text-slate-600 group-hover:text-admin-text-primary transition-colors">Settings</span>
                              </Link>
                              <button onClick={() => signOut()} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors group">
                                 <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400">
                                    <i className="fa-solid fa-right-from-bracket text-xs"></i>
                                 </div>
                                 <span className="text-xs font-bold text-rose-600">Sign Out</span>
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </header>
               
               {/* Inner View */}
               {children}
            </div>
         </div>
    </div>
  );
}

function NotificationItem({ icon, color, bgColor, title, desc, time, isNew = false, onClick }: { icon: string, color: string, bgColor: string, title: string, desc: string, time: string, isNew?: boolean, onClick: () => void }) {
   return (
      <div 
         onClick={onClick}
         className={`p-4 hover:bg-admin-bg transition-all duration-300 cursor-pointer flex gap-4 group relative ${isNew ? 'bg-vora-accent/[0.04]' : 'opacity-70'}`}
      >
         <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <i className={`fa-solid ${icon} ${color} text-sm`}></i>
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
               <p className={`text-[13px] font-black tracking-tight truncate transition-colors ${isNew ? 'text-admin-text-primary' : 'text-slate-500'}`}>{title}</p>
               {isNew && <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse"></div>}
            </div>
            <p className="text-[11px] text-slate-400 truncate mb-1.5 font-medium leading-relaxed">{desc}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{time}</p>
         </div>
         
         {!isNew && (
            <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
            </div>
         )}
      </div>
   );
}

function NavItem({ href, icon, label, pathname, badge = null }: { href: string, icon: string, label: string, pathname: string, badge?: string | null }) {
   const active = pathname === href || (href !== '/admin_site' && pathname.startsWith(href));
   
   return (
      <Link href={href} aria-current={active ? 'page' : undefined} className={`p-4 rounded-xl flex items-center justify-between cursor-pointer group transition-all ${active ? 'bg-vora-accent text-white shadow-xl shadow-vora-accent/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
         <div className="flex items-center gap-5">
            <i className={`fa-solid ${icon} text-lg transition-all ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'}`}></i>
            <span className={`text-[13px] font-bold ${active ? 'tracking-normal' : 'tracking-wide'}`}>{label}</span>
         </div>
         {badge && <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-lg shadow-lg">{badge}</span>}
         {!active && <i className="fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform"></i>}
      </Link>
   );
}
