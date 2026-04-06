import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';

const ibmPlexThai = IBM_Plex_Sans_Thai({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-ibm-plex-thai',
});

export const metadata: Metadata = {
  title: 'HubbyBox - จัดระเบียบของในบ้านด้วย AI',
  description: 'ให้ Hubby AI ช่วยจำว่าของแต่ละชิ้นอยู่ที่ไหน!',
  icons: {
    icon: '/logo-hubbybox.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${ibmPlexThai.variable} h-full scroll-smooth`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className={`${ibmPlexThai.className} min-h-full flex flex-col bg-white text-slate-900 selection:bg-primary/20`}>
        {children}
      </body>
    </html>
  );
}
