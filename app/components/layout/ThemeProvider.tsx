'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { eventEmitter, EVENTS } from '../../lib/events';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add no-transition class during initial load
    document.documentElement.classList.add('no-transition');
    setMounted(true);

    // Remove no-transition class after a short delay
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new entry
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        router.push('/new-entry');
      }
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        eventEmitter.emit(EVENTS.EXPAND_SEARCH);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="snote-theme"
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: '!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-white',
        }}
      />
    </NextThemesProvider>
  );
}
