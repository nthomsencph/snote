'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useStore } from './lib/store/useStore';
import { EntryCard } from './components/EntryCard';
import { SearchBar } from './components/SearchBar';
import { SortSelect } from './components/SortSelect';
import { LoadingSpinner } from './components/LoadingSpinner';

type SortOption = 'date' | 'title' | 'index';

export default function Home() {
  const { entries, isLoading, error, loadEntries, deleteEntry } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      try {
        await deleteEntry(id);
        toast.success('Entry deleted successfully');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const filteredEntries = entries
    .filter(entry => 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'index':
          return a.index - b.index;
        default:
          return 0;
      }
    });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-lg backdrop-blur-sm max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadEntries}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex gap-4 items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search entries... (Ctrl/Cmd + F)"
        />
        <SortSelect
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          options={[
            { value: 'date', label: 'Sort by Date' },
            { value: 'title', label: 'Sort by Title' },
            { value: 'index', label: 'Sort by Index' },
          ]}
        />
        <Link
          href="/new-entry"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition-colors whitespace-nowrap"
        >
          New Entry
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchQuery ? 'No entries found matching your search.' : 'No entries yet. Create your first entry!'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              index={entry.index}
            />
          ))}
        </div>
      )}
    </main>
  );
}
