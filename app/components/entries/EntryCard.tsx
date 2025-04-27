'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Entry } from '../../lib/types';
import { trpc } from '../../lib/trpc/client';
import toast from 'react-hot-toast';
import { icons } from '../../lib/constants/icons';

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
  index: number;
  viewMode: 'list' | 'gallery';
  hidePreview?: boolean;
  font?: string;
}

export function EntryCard({ entry, onDelete, index, viewMode, hidePreview, font }: EntryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const utils = trpc.useUtils();

  const createEntryMutation = trpc.entries.create.useMutation({
    onSuccess: newEntry => {
      utils.entries.getAll.invalidate();
      router.push(`/entry/${newEntry.id}`);
    },
  });

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
      await createEntryMutation.mutateAsync({
        title: `${entry.title} (Copy)`,
        content: entry.content,
        preview: entry.preview,
        icon: entry.icon || undefined,
      });

      toast.success('Entry copied successfully');
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (!menuRef.current?.contains(e.target as Node)) {
      router.push(`/entry/${entry.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`block bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:bg-gray-100/90 hover:dark:bg-gray-700/90 transition-all cursor-pointer ${hidePreview ? 'h-[100px]' : 'h-[160px]'} ${viewMode === 'list' ? 'w-full' : ''}`}
    >
      <div className="flex justify-between items-start h-full">
        <div className={`flex-1 min-w-0 flex flex-col h-full ${font === 'system' ? '' : font}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
            {entry.title}
          </h2>
          <div
            className={`relative overflow-hidden transition-[height,opacity] duration-200 ease-out ${hidePreview ? 'h-0 opacity-0' : 'h-[48px] opacity-100'}`}
          >
            <p
              className={`text-gray-600 dark:text-gray-300 mt-2 truncate absolute w-full transition-transform duration-200 ${hidePreview ? 'translate-y-[-100%]' : 'translate-y-0'}`}
            >
              {entry.preview}
            </p>
          </div>
          <div
            className={`text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 ${hidePreview ? 'mt-1' : 'mt-2'}`}
          >
            <span>#{index}</span>
            {entry.icon && (
              <>
                <span className="text-gray-400 dark:text-gray-500">|</span>
                <div className="text-gray-600 dark:text-gray-300 w-[14px] h-[14px]">
                  {icons.find(i => i.name === entry.icon)?.svg}
                </div>
                <span className="text-gray-400 dark:text-gray-500">|</span>
              </>
            )}
            {viewMode === 'gallery' ? (
              <>
                <span>{format(new Date(entry.date), 'dd/MM/yy')}</span>
                {entry.lastUpdated && (
                  <>
                    <span className="text-gray-500">(edit:</span>
                    <span className="text-gray-500">
                      {' '}
                      {format(new Date(entry.lastUpdated), 'dd/MM')})
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span>{format(new Date(entry.date), 'LLL d, yyyy HH:mm')}</span>
                {entry.lastUpdated && (
                  <>
                    <span className="text-gray-500">(edit:</span>
                    <span className="text-gray-500">
                      {' '}
                      {format(new Date(entry.lastUpdated), 'LLL d, yyyy HH:mm')})
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="relative h-full flex items-start" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Entry options"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="6" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-10">
              <button
                onClick={handleCopy}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
    </div>
  );
}
