'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppBottomNav() {
  const pathname = usePathname();

  // Root mapping for subdomain routing
  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navItems = [
    { label: 'หน้าหลัก', icon: 'fa-house', href: '/' },
    { label: 'รับฝากของ', icon: 'fa-warehouse', href: '/storage' },
    { label: 'ตั้งค่า', icon: 'fa-gear', href: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 px-6 pt-3 pb-8 flex items-center justify-around z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-500">
      {navItems.map((item) => {
        const isActive = getIsActive(item.href);
        return (
          <Link 
            key={item.href} 
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
              isActive ? 'bg-primary/10 shadow-inner scale-110' : 'hover:bg-slate-50'
            }`}>
              <i className={`fa-solid ${item.icon} text-[20px]`} aria-hidden="true"></i>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
