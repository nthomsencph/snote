'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-lg backdrop-blur-sm max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
