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
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw">
      <head>
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <SessionProvider>
          <div className="min-h-screen pb-20 bg-gradient-to-b from-emerald-50 to-white">
            <header className="bg-emerald-600 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold">Chama OS</h1>
                  <p className="text-emerald-100 text-xs">Digital Chama Management</p>
                </div>
              </div>
            </header>
            <main className="p-4">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}