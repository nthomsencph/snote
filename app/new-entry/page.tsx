'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import { useStore } from '../lib/store/useStore';
import { Button } from '../components/Button';

export default function NewEntry() {
  const router = useRouter();
  const { createEntry } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !content) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      setIsSaving(true);
      const newEntry = await createEntry({
        title,
        content,
        preview: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
      });
      toast.success('Entry created successfully');
      router.push('/');
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white placeholder-gray-400"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/')}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="primary"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
        <Editor value={content} onChange={setContent} />
      </main>
    </div>
  );
} 