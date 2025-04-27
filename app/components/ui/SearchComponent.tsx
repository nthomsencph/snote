'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchBar } from './SearchInput';
import { eventEmitter, EVENTS } from '../../lib/events';

interface SearchComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchComponent({ value, onChange }: SearchComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const expandSearch = () => {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    eventEmitter.on(EVENTS.EXPAND_SEARCH, expandSearch);
    return () => eventEmitter.off(EVENTS.EXPAND_SEARCH, expandSearch);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="flex items-center space-x-1.5">
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        }}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/90 dark:hover:bg-gray-700/90 transition-colors flex-shrink-0"
        title="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'}
        `}
      >
        <div className={`w-64 ${!isExpanded && 'invisible'}`}>
          <SearchBar
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder="Search entries... (Ctrl/Cmd + F)"
          />
        </div>
      </div>
    </div>
  );
}
