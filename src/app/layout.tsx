import type { Metadata } from 'next';
import { Kodchasan } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

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
    icon: '/tsconfig-01.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kodchasan.variable} h-full antialiased`}>
      <head>
        <Script src="https://kit.fontawesome.com/276094607e.js" crossOrigin="anonymous" strategy="beforeInteractive" />
      </head>
      <body className={`${kodchasan.className} min-h-full bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
