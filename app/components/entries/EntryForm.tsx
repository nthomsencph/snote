'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Entry } from '../../lib/types';
import { useUIStore } from '../../lib/store/uiStore';
import { trpc } from '../../lib/trpc/client';
import { IconPicker } from '../icons';

// Import the editor component with SSR disabled
const Editor = dynamic(() => import('./EntryEditor').then(mod => mod.default), { ssr: false });

interface EntryFormProps {
  entry?: Entry;
  id?: string;
}

export default function EntryForm({ entry, id }: EntryFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { font } = useUIStore();

  const updateEntryMutation = trpc.entries.update.useMutation({
    onSuccess: () => {
      utils.entries.getById.invalidate(id);
      utils.entries.getAll.invalidate();
    },
  });
  const createEntryMutation = trpc.entries.create.useMutation({
    onSuccess: newEntry => {
      utils.entries.getAll.invalidate();
      router.push(`/entry/${newEntry.id}`);
    },
  });

  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [icon, setIcon] = useState(entry?.icon || '');
  const [charCount, setCharCount] = useState(
    (entry?.content || '').replace(/<[^>]*>?/gm, '').length
  );
  const [entryIndex, setEntryIndex] = useState<number | null>(null);

  const loadEntry = useCallback(async () => {
    if (!id) return;

    try {
      const allEntries = await utils.entries.getAll.fetch();
      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const entryIndex = sortedEntries.findIndex(e => e.id === id);
      setEntryIndex(entryIndex + 1);
    } catch (err) {
      console.error('Error loading entry:', err);
      toast.error('Failed to load entry');
    }
  }, [id, utils.entries.getAll]);

  useEffect(() => {
    if (entry && id) {
      loadEntry();
    }
  }, [entry, id, loadEntry]);

  const handleSave = useCallback(async () => {
    if (!content) {
      toast.error('Please add some content');
      return;
    }

    try {
      setIsSaving(true);
      const now = new Date();
      const defaultTitle = format(now, 'MMMM d, yyyy HH:mm');
      const finalTitle = title.trim() || defaultTitle;
      const preview = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

      if (entry && id) {
        // Update existing entry
        await updateEntryMutation.mutateAsync({
          id: entry.id,
          title: finalTitle,
          content,
          preview,
          icon: icon || undefined,
        });

        // Force a cache invalidation and refresh
        await utils.entries.getById.invalidate(id);
        await utils.entries.getAll.invalidate();
        router.refresh();

        toast.success('Entry saved successfully');
      } else {
        // Create new entry
        await createEntryMutation.mutateAsync({
          title: finalTitle,
          content,
          preview,
          icon: icon || undefined,
        });
        toast.success('Entry created successfully');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  }, [
    content,
    title,
    icon,
    entry,
    id,
    updateEntryMutation,
    createEntryMutation,
    utils.entries.getById,
    utils.entries.getAll,
    router,
  ]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!content) {
          toast.error('Please add some content');
          return;
        }
        try {
          await handleSave();
        } catch (err) {
          console.error('Error saving entry:', err);
          toast.error('Failed to save entry');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, handleSave]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow pb-24">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg backdrop-blur-sm h-full">
          <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="flex justify-end items-center gap-4 h-9 p-6 pt-12">
              <div className="flex items-center gap-4 pl-[1.5rem] pr-8 w-full">
                <Link
                  href="/"
                  className="mr-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Back to all entries"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                  {entry ? (
                    <>
                      <span>Editing entry #{entryIndex}</span>
                      <span>•</span>
                    </>
                  ) : (
                    <span>New entry</span>
                  )}
                  <span>{charCount} characters</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/')}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Cancel"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Save entry (Ctrl+S)"
                  >
                    {isSaving ? (
                      <span className="flex items-center p-0.5">
                        <span className="animate-spin">⌛</span>
                      </span>
                    ) : (
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
                          d="M7 4v16m0 0h10a2 2 0 002-2V6a2 2 0 00-2-2H7m0 0H5a2 2 0 00-2 2v12a2 2 0 002 2h2m0-16v16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-grow px-8 pb-24">
              <div className="flex items-start gap-4 mb-6 mt-6 pl-[1.5rem]">
                <div className="w-8 h-8 flex items-center justify-center">
                  <IconPicker currentIcon={icon} onSelect={setIcon} />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={`text-2xl font-bold bg-transparent px-0 py-0 focus:outline-none focus:ring-0 border-0 text-gray-900 dark:text-white break-all w-full ${font}`}
                  placeholder="Enter title..."
                />
              </div>
              <div className={`prose dark:prose-invert max-w-none h-full ${font}`}>
                <Editor
                  value={content}
                  onChange={html => {
                    setContent(html);
                    setCharCount(html.replace(/<[^>]*>?/gm, '').length);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
