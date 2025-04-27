'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EntryCard } from './components/entries/EntryCard';
import { SearchComponent } from './components/ui/SearchComponent';
import { SortSelect } from './components/ui/SelectMenu';
import { LoadingSpinner } from './components/ui/Spinner';
import { IconSelect } from './components/icons';
import { SettingsMenu } from './components/ui/SettingsMenu';
import { trpc } from './lib/trpc/client';
import { useUIStore } from './lib/store/uiStore';

type SortOption = 'date' | 'title' | 'index';

export default function Home() {
  const utils = trpc.useUtils();
  const { data: entries = [], isLoading } = trpc.entries.getAll.useQuery();
  const deleteEntry = trpc.entries.delete.useMutation({
    onSuccess: () => {
      utils.entries.getAll.invalidate();
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const { font, viewMode, hidePreview, setFont, setViewMode, setHidePreview } = useUIStore();

  // Get unique icons from entries
  const usedIcons = Array.from(new Set(entries.filter(e => e.icon).map(e => e.icon))) as string[];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      try {
        await deleteEntry.mutateAsync(id);
        toast.success('Entry deleted successfully');
      } catch {
        toast.error('Failed to delete entry');
      }
    }
  };

  const filteredEntries = entries
    .filter(
      entry =>
        (selectedIcon ? entry.icon === selectedIcon : true) &&
        (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.preview.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center space-x-1.5 bg-white/90 dark:bg-gray-800/90 p-1.5 pr-4 rounded-xl shadow-lg backdrop-blur-sm relative z-[100]">
          <SearchComponent value={searchQuery} onChange={setSearchQuery} />
          <SortSelect
            value={sortBy}
            onChange={value => setSortBy(value as SortOption)}
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'title', label: 'Sort by Title' },
              { value: 'index', label: 'Sort by Index' },
            ]}
          />
          {usedIcons.length > 0 && (
            <IconSelect value={selectedIcon} onChange={setSelectedIcon} usedIcons={usedIcons} />
          )}
          <SettingsMenu
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hidePreview={hidePreview}
            onHidePreviewChange={setHidePreview}
            font={font}
            onFontChange={setFont}
          />
          <div className="w-1" />
          <Link
            href="/new-entry"
            className="bg-[#7A908E] hover:bg-[#687F7D] text-white p-1.5 rounded-lg transition-colors"
            title="New Entry"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchQuery
            ? 'No entries found matching your search.'
            : 'No entries yet. Create your first entry!'}
        </div>
      ) : (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-4'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          }
        >
          {filteredEntries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={{
                ...entry,
                lastUpdated: entry.lastUpdated || undefined,
                icon: entry.icon || undefined,
              }}
              onDelete={handleDelete}
              index={entry.index}
              viewMode={viewMode}
              hidePreview={hidePreview}
              font={font}
            />
          ))}
        </div>
      )}
    </main>
  );
}
