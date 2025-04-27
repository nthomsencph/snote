'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import Header from './components/layout/Header';
import { TRPCProvider } from './lib/trpc/Provider';
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#859E9C]`}
      >
        <ThemeProvider>
          <TRPCProvider>
            <ErrorBoundary>
              <Toaster />
              <Header />
              <div className="min-h-screen bg-[#859E9C]/50 backdrop-blur-sm">
                <main key={pathname} className="container mx-auto px-4 pt-3 page-transition">
                  {children}
                </main>
              </div>
            </ErrorBoundary>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
