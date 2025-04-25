'use client';

import { useState, useEffect } from 'react';
import Logo from './Logo';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render theme toggle until after hydration
  if (!mounted) {
    return (
      <header className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg backdrop-blur-sm p-4 flex items-center justify-between">
            <Link href="/" className="flex gap-3 hover:opacity-80 transition-opacity">
              <Logo />
              <span className="text-xl font-bold text-gray-900 dark:text-white self-center">Snote</span>
            </Link>
            <div className="w-8 h-8" /> {/* Placeholder for theme toggle */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="py-4">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg backdrop-blur-sm p-4 flex items-center justify-between">
          <Link href="/" className="flex gap-3 hover:opacity-80 transition-opacity">
            <Logo />
            <span className="text-xl font-bold text-gray-900 dark:text-white self-center">Snote</span>
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
} 