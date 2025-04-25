'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Entry } from '../../lib/types';
import { useStore } from '../../lib/store/useStore';
import { api } from '../../lib/api';
import IconPicker, { icons } from '../../components/IconPicker';

// Import the editor component with SSR disabled
const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });

// Add type guard function
function isEntry(data: unknown): data is Entry {
  console.log('Validating entry data:', data);
  
  if (!data || typeof data !== 'object') {
    console.log('Failed: data is not an object');
    return false;
  }
  
  const entry = data as Record<string, unknown>;
  
  const requiredFields = {
    id: 'string',
    title: 'string',
    content: 'string',
    preview: 'string',
    date: 'string'
  };

  for (const [field, type] of Object.entries(requiredFields)) {
    if (typeof entry[field] !== type) {
      console.log(`Failed: field "${field}" is not a ${type}`, entry[field]);
      return false;
    }
  }

  // lastUpdated is optional
  if (entry.lastUpdated !== undefined && typeof entry.lastUpdated !== 'string') {
    console.log('Failed: lastUpdated is present but not a string', entry.lastUpdated);
    return false;
  }

  return true;
}

export default function EntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { createEntry, updateEntry, deleteEntry } = useStore();
  
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [entryIndex, setEntryIndex] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [editedIcon, setEditedIcon] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  useEffect(() => {
    if (entry) {
      setEditedTitle(entry.title);
      setEditedContent(entry.content);
      setEditedIcon(entry.icon || '');
      setCharCount(entry.content.replace(/<[^>]*>?/gm, '').length);
    }
  }, [entry]);

  const loadEntry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [entry, allEntries] = await Promise.all([
        api.entries.getById(id),
        api.entries.getAll()
      ]);
      
      setEntry(entry);
      setEditedTitle(entry.title);
      setEditedContent(entry.content);
      setEditedIcon(entry.icon || '');
      
      // Calculate entry index
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const entryIndex = sortedEntries.findIndex(e => e.id === id);
      setEntryIndex(entryIndex + 1); // Add 1 to make it 1-based
    } catch (err) {
      console.error('Error loading entry:', err);
      setError('Failed to load entry');
      toast.error('Failed to load entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedTitle || !editedContent || !entry) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      setIsSaving(true);
      const updatedEntry = await updateEntry(entry.id, {
        title: editedTitle,
        content: editedContent,
        preview: editedContent.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        icon: editedIcon,
      });
      
      if (updatedEntry) {
        setEntry(updatedEntry);
        setIsEditing(false);
        toast.success('Entry saved successfully');
      } else {
        throw new Error('Failed to update entry');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      toast.error('Failed to save entry');
      setIsEditing(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      try {
        await deleteEntry(id);
        toast.success('Entry deleted successfully');
        router.push('/');
      } catch (err) {
        console.error('Error deleting entry:', err);
        toast.error('Failed to delete entry');
      }
    }
  };

  const handleCopy = async () => {
    try {
      if (!entry) return;

      const newEntry = await createEntry({
        title: `${entry.title} (Copy)`,
        content: entry.content,
        preview: entry.preview,
        index: entry.index,
        icon: entry.icon,
      });
      
      toast.success('Entry copied successfully');
      router.push(`/entry/${newEntry.id}`);
    } catch (err) {
      console.error('Error copying entry:', err);
      toast.error('Failed to copy entry');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadEntry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only activate if not already in edit mode
    if (!isEditing) {
      e.preventDefault(); // Prevent text selection
      setIsEditing(true);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4">
        <div className="mb-5">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm backdrop-blur-sm px-4 py-2 inline-block">
            <Link href="/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to all entries
            </Link>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="p-6" onDoubleClick={handleDoubleClick}>
            {isEditing ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <IconPicker
                    currentIcon={editedIcon}
                    onSelect={setEditedIcon}
                  />
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-3xl font-bold bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl break-all"
                    placeholder="Enter title..."
                  />
                </div>
                <Editor 
                  value={editedContent} 
                  onChange={(html) => {
                    setEditedContent(html);
                    setCharCount(html.replace(/<[^>]*>?/gm, '').length);
                  }} 
                />
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⌛</span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end items-center gap-4 mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                    <span>
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                      {entry.lastUpdated && ` (edited ${format(new Date(entry.lastUpdated), 'MMM d, yyyy')})`}
                    </span>
                    <span>•</span>
                    {entryIndex !== null && (
                      <span className="font-medium">#{entryIndex}</span>
                    )}
                    <span>•</span>
                    <span>{charCount} characters</span>
                  </div>
                  <div className="relative" ref={menuRef}>
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
                          onClick={() => {
                            setIsEditing(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleCopy();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  {entry.icon && (
                    <div className="text-gray-700 dark:text-gray-300 w-8 h-8 flex items-center justify-center mt-0.4">
                      {icons.find(i => i.name === entry.icon)?.svg}
                    </div>
                  )}
                  <h1 
                    className="text-2xl font-bold text-gray-900 dark:text-white cursor-text break-all"
                    onDoubleClick={handleDoubleClick}
                  >
                    {entry.title}
                  </h1>
                </div>
                <div 
                  className="prose dark:prose-invert max-w-none cursor-text" 
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                  onDoubleClick={handleDoubleClick}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 