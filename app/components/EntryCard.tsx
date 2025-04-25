'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Entry } from '../lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useStore } from '../lib/store/useStore';
import { icons } from './IconPicker';

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
  index: number;
}

export function EntryCard({ entry, onDelete, index }: EntryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { createEntry } = useStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(entry.id);
    setIsMenuOpen(false);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newEntry = await createEntry({
        title: `${entry.title} (Copy)`,
        content: entry.content,
        preview: entry.preview,
      });
      
      toast.success('Entry copied successfully');
      router.push(`/entry/${newEntry.id}`);
    } catch (err) {
      console.error('Error copying entry:', err);
      toast.error('Failed to copy entry');
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg backdrop-blur-sm hover:bg-white hover:dark:bg-gray-800 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate mb-2">{entry.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{entry.preview}</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="font-medium">#{index}</span>
            <span>|</span>
            {entry.icon && (
              <div className="flex items-center">
                <div className="text-gray-700 dark:text-gray-300 w-4 h-4 flex-shrink-0 -ml-1">
                  {icons.find(i => i.name === entry.icon)?.svg}
                </div>
                <span className="ml-2">|</span>
              </div>
            )}
            <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
            {entry.lastUpdated && (
              <span className="text-gray-400 dark:text-gray-500">
                (edited {format(new Date(entry.lastUpdated), 'MMM d, yyyy')})
              </span>
            )}
          </div>
        </div>
        <div className="relative ml-4" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Entry options"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="6" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="18" r="2" fill="currentColor"/>
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-10">
              <button
                onClick={handleCopy}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 