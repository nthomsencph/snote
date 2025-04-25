import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snote",
  description: "A simple and elegant note-taking app",
  keywords: ["snote", "notes", "journal", "writing", "saga"],
  authors: [{ name: "Your Name" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#859E9C] min-h-screen`}>
        <ErrorBoundary>
          <ThemeProvider>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-4 pt-3">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
