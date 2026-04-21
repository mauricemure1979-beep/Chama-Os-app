import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from '@/lib/session';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Chama OS - Digital Ledger for Kenyan Chamas',
  description: 'Trusted digital ledger for merry-go-rounds, investment groups. Works offline.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chama OS'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <SessionProvider>
          <div className="min-h-screen pb-20">
            {/* Top status bar simulation */}
            <div className="bg-green-600 text-white px-4 py-2 text-sm font-medium">
              Chama OS
            </div>
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}