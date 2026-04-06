'use client';

import { Kodchasan } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const kodchasan = Kodchasan({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="th" className="h-full">
      <head>
        <Script src="https://kit.fontawesome.com/276094607e.js" crossOrigin="anonymous" strategy="afterInteractive" />
      </head>
      <body className={`${kodchasan.className} min-h-full flex flex-col bg-vora-dark text-slate-300 font-sans relative selection:bg-vora-accent/30`}>
         {/* Sidebar Overlay (Mobile) */}
         {isSidebarOpen && (
            <div 
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] xl:hidden"
               onClick={() => setIsSidebarOpen(false)}
            >
               <aside 
                  className="w-72 h-full bg-vora-card border-r border-white/5 flex flex-col p-8 animate-in slide-in-from-left duration-300"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4 group">
                     <div className="w-10 h-10 bg-vora-accent rounded-xl flex items-center justify-center">
                        <Image src="/logo-hubbyboox.png" alt="HubbyBox" width={28} height={28} className="object-contain brightness-0 invert" />
                     </div>
                     <span className="text-lg font-black tracking-tighter text-white">HubbyBox.</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white">
                     <i className="fa-notdog fa-solid fa-xmark text-xl"></i>
                  </button>
                  </div>
                  
                  <nav className="flex-1 flex flex-col gap-1">
                     <NavItem href="/admin_site" icon="fa-chart-pie" label="Dashboard" pathname={pathname} />
                     <NavItem href="/admin_site/management" icon="fa-users-gear" label="Management" pathname={pathname} />
                     <NavItem href="/admin_site/logs" icon="fa-server" label="System Logs" pathname={pathname} />
                     <div className="mt-8 mb-4 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] px-4">Analytics</div>
                     <NavItem href="/admin_site/usage" icon="fa-bullseye-arrow" label="Usage Rate" pathname={pathname} />
                     <NavItem href="/admin_site/conversion" icon="fa-chart-line" label="Conversions" pathname={pathname} />
                  </nav>
               </aside>
            </div>
         )}

         <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden xl:flex w-72 bg-vora-card/50 backdrop-blur-xl border-r border-white/5 flex-col p-8 z-50 overflow-y-auto">
               <Link href="/admin_site" className="flex items-center gap-4 mb-12 group cursor-pointer">
                  <div className="w-12 h-12 bg-vora-accent rounded-xl flex items-center justify-center shadow-2xl shadow-vora-accent/20 transition-transform group-hover:scale-110">
                     <Image src="/logo-hubbyboox.png" alt="HubbyBox" width={32} height={32} className="object-contain brightness-0 invert" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xl font-black tracking-tighter text-white leading-none">HubbyBox.</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Panel</span>
                  </div>
               </Link>
               
               <nav className="flex-1 flex flex-col gap-1">
                  <NavItem href="/admin_site" icon="fa-chart-pie" label="Dashboard" pathname={pathname} />
                  <NavItem href="/admin_site/management" icon="fa-users-gear" label="Management" pathname={pathname} />
                  <NavItem href="/admin_site/logs" icon="fa-server" label="System Logs" pathname={pathname} />
                  <div className="mt-8 mb-4 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] px-4">Analytics</div>
                  <NavItem href="/admin_site/usage" icon="fa-bullseye-arrow" label="Usage Rate" pathname={pathname} />
                  <NavItem href="/admin_site/conversion" icon="fa-chart-line" label="Conversions" pathname={pathname} />
                  <div className="mt-8 mb-4 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] px-4">Support</div>
                  <NavItem href="/admin_site/tickets" icon="fa-headset" label="Tickets" badge="3" pathname={pathname} />
               </nav>
               
               <div className="mt-auto pt-8 border-t border-white/5 opacity-20">
                  <p className="text-[10px] font-bold text-center uppercase tracking-[0.2em]">HubbyBox © 2026</p>
               </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Global Header */}
               <header className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-vora-dark/50 backdrop-blur-md z-40">
                  <div className="flex items-center gap-4 flex-1">
                     <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="xl:hidden w-10 h-10 bg-vora-card rounded-xl flex items-center justify-center text-slate-400 border border-white/5"
                     >
                        <i className="fa-notdog fa-solid fa-bars"></i>
                     </button>
                     <div className="relative w-full max-w-md group hidden sm:block">
                        <i className="fa-notdog fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input 
                           type="text" 
                           placeholder="Search commands, users..." 
                           className="w-full bg-vora-card border border-white/5 rounded-xl py-3 pl-14 pr-6 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-vora-accent/30 transition-all shadow-inner"
                        />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 lg:gap-6">
                     <div className="flex items-center gap-3">
                        <Link href="/admin_site/notifications" className="w-9 h-9 lg:w-10 lg:h-10 bg-vora-card rounded-lg flex items-center justify-center text-slate-400 border border-white/5 relative cursor-pointer hover:border-white/10 transition-all">
                           <i className="fa-notdog fa-solid fa-bell text-sm"></i>
                           <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-vora-card"></div>
                        </Link>
                        <Link href="/admin_site/messages" className="hidden md:flex w-9 h-9 lg:w-10 lg:h-10 bg-vora-card rounded-lg flex items-center justify-center text-slate-400 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                           <i className="fa-notdog fa-solid fa-envelope text-sm"></i>
                        </Link>
                     </div>
                     <div className="h-6 lg:h-8 w-px bg-white/5 mx-1 lg:mx-2"></div>
                     <div className="flex items-center gap-3 lg:gap-4 group cursor-pointer">
                        <div className="hidden lg:flex flex-col items-end">
                           <span className="text-sm font-black text-white group-hover:text-vora-accent transition-colors leading-none">Peter Parkur</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Super Admin</span>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-vora-card border-2 border-vora-accent/30 p-1 group-hover:scale-105 transition-transform">
                           <div className="w-full h-full rounded-lg bg-slate-700 flex items-center justify-center text-white font-black overflow-hidden relative">
                              <span className="text-sm lg:text-lg">PP</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </header>
               
               {/* Inner View */}
               {children}
            </div>
         </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, pathname, badge = null }: { href: string, icon: string, label: string, pathname: string, badge?: string | null }) {
   const active = pathname === href || (href !== '/admin_site' && pathname.startsWith(href));
   
   return (
      <Link href={href} className={`p-4 rounded-xl flex items-center justify-between cursor-pointer group transition-all ${active ? 'bg-vora-accent text-white shadow-xl shadow-vora-accent/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
         <div className="flex items-center gap-5">
            <i className={`fa-notdog fa-solid ${icon} text-lg transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}></i>
            <span className={`text-[13px] font-bold ${active ? 'tracking-normal' : 'tracking-wide'}`}>{label}</span>
         </div>
         {badge && <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-lg shadow-lg">{badge}</span>}
         {!active && <i className="fa-notdog fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform"></i>}
      </Link>
   );
}
