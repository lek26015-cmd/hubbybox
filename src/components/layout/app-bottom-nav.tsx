'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function AppBottomNav() {
  const pathname = usePathname();

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sideItems = [
    { label: 'รับฝากของ', icon: 'fa-warehouse', href: '/storage' },
    { label: 'โปรไฟล์', icon: 'fa-circle-user', href: '/settings' },
  ];

  const isHomeActive = getIsActive('/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 px-6 pt-3 pb-8 flex items-center justify-around z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {/* Left: รับฝากของ */}
      {(() => {
        const item = sideItems[0];
        const isActive = getIsActive(item.href);
        return (
          <Link
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
              isActive ? 'bg-primary/10 shadow-inner scale-110' : 'hover:bg-slate-50'
            }`}>
              <i className={`fa-solid ${item.icon} text-[20px]`} aria-hidden="true" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            )}
          </Link>
        );
      })()}

      {/* Center: Home (Logo) */}
      <Link
        href="/"
        aria-current={isHomeActive ? 'page' : undefined}
        className="relative flex flex-col items-center gap-1 -mt-8 active:scale-90 transition-transform"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ring-4 ring-white ${
          isHomeActive
            ? 'bg-primary shadow-primary/30'
            : 'bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-300/30 hover:shadow-sky-400/40'
        }`}>
          <Image src="/logo-hubbybox.png" alt="HubbyBox" width={30} height={30} className="object-contain brightness-0 invert" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isHomeActive ? 'text-primary opacity-100' : 'text-slate-400 opacity-40'}`}>
          หน้าหลัก
        </span>
        {isHomeActive && (
          <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        )}
      </Link>

      {/* Right: โปรไฟล์ */}
      {(() => {
        const item = sideItems[1];
        const isActive = getIsActive(item.href);
        return (
          <Link
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
              isActive ? 'bg-primary/10 shadow-inner scale-110' : 'hover:bg-slate-50'
            }`}>
              <i className={`fa-solid ${item.icon} text-[20px]`} aria-hidden="true" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            )}
          </Link>
        );
      })()}
    </nav>
  );
}

