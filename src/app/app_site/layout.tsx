import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import '../globals.css';
import { LiffProvider } from '@/components/providers/liff-provider';
import { AppBottomNav } from '@/components/layout/app-bottom-nav';
import { AppAuthGuard } from '@/components/layout/app-auth-guard';

export const metadata: Metadata = {
  title: 'HubbyBox',
  description: 'ระบบจัดการกล่องเก็บของส่วนตัว (Smart Inventory)',
  icons: {
    icon: '/hubbybox-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get('hubby_bypass')?.value === '1';

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-primary/20 pb-28">
      <LiffProvider initialIsLoading={!hasBypass}>
        <AppAuthGuard>
          {children}
          <AppBottomNav />
        </AppAuthGuard>
      </LiffProvider>
    </div>
  );
}
