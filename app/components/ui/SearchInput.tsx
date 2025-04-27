'use client';

import { forwardRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, onChange, placeholder = 'Search...' },
  ref
) {
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border-0 focus:outline-none dark:text-white dark:placeholder-gray-400 transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800"
      aria-label="Search"
    />
  );
});
