import type { Metadata } from 'next';
import { Kodchasan } from 'next/font/google';
import Script from 'next/script';
import { cookies } from 'next/headers';
import '../globals.css';
import { LiffProvider } from '@/components/providers/liff-provider';
import { AppBottomNav } from '@/components/layout/app-bottom-nav';

const kodchasan = Kodchasan({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-kodchasan',
});

export const metadata: Metadata = {
  title: 'HubbyBox',
  description: 'ระบบจัดการกล่องเก็บของส่วนตัว (Smart Inventory)',
  icons: {
    icon: '/logo-hubbybox.png',
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
    <html lang="th" className={`${kodchasan.variable} h-full antialiased`}>
      <head>
        <Script src="https://kit.fontawesome.com/276094607e.js" crossOrigin="anonymous" strategy="beforeInteractive" />
      </head>
      <body className={`${kodchasan.className} min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-primary/20 pb-28`}>
        <LiffProvider initialIsLoading={!hasBypass}>
          {children}
          <AppBottomNav />
        </LiffProvider>
      </body>
    </html>
  );
}
