import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/confirm-modal';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-thai',
});

export const metadata: Metadata = {
  title: 'HubbyBox',
  description: 'ระบบจัดการกล่องเก็บของส่วนตัว (Smart Inventory)',
  icons: {
    icon: '/hubbybox-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} h-full antialiased`}>
      <head>
        <Script src="https://kit.fontawesome.com/276094607e.js" crossOrigin="anonymous" strategy="beforeInteractive" />
      </head>
      <body className={`${ibmPlexSansThai.className} min-h-full bg-slate-50 text-slate-900`}>
        <ErrorBoundary>
          <ToastProvider>
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
