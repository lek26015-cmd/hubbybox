import type { Metadata } from 'next';
import { Kodchasan } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';

const kodchasan = Kodchasan({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HubbyBox - จัดระเบียบของในบ้านด้วย AI',
  description: 'ให้ Hubby AI ช่วยจำว่าของแต่ละชิ้นอยู่ที่ไหน!',
  icons: {
    icon: '/logo-hubbyboox.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <head>
        <Script src="https://kit.fontawesome.com/276094607e.js" crossOrigin="anonymous" strategy="beforeInteractive" />
      </head>
      <body className={`${kodchasan.className} min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-primary/20`}>
        {children}
      </body>
    </html>
  );
}
