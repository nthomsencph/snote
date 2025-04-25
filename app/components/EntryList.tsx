import Link from 'next/link';
import { format } from 'date-fns';
import { Entry } from '../lib/types';
import { icons } from './IconPicker';

interface EntryListProps {
  entries: Entry[];
}

export default function EntryList({ entries }: EntryListProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/entry/${entry.id}`}
          className="block bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            {entry.icon && (
              <div className="text-gray-700 dark:text-gray-300 w-5 h-5 flex-shrink-0">
                {icons.find(i => i.name === entry.icon)?.svg}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {entry.title}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">
                {entry.preview}
              </p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                {format(new Date(entry.date), 'MMMM d, yyyy')}
                {entry.lastUpdated && ` (edited ${format(new Date(entry.lastUpdated), 'MMM d, yyyy')})`}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 