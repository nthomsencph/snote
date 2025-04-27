'use client';

import { trpc } from '../trpc/client';
import { CreateEntryInput, UpdateEntryInput } from '../trpc/schemas';

export function useStore() {
  const utils = trpc.useUtils();

  // Queries
  const { data: entries = [], isLoading, error } = trpc.entries.getAll.useQuery();

  // Mutations
  const createEntry = trpc.entries.create.useMutation({
    onSuccess: () => {
      utils.entries.getAll.invalidate();
    },
  });

  const updateEntry = trpc.entries.update.useMutation({
    onSuccess: () => {
      utils.entries.getAll.invalidate();
    },
  });

  const deleteEntry = trpc.entries.delete.useMutation({
    onSuccess: () => {
      utils.entries.getAll.invalidate();
    },
  });

  return {
    // State
    entries,
    isLoading,
    error: error?.message,

    // Actions
    loadEntries: () => utils.entries.getAll.invalidate(),
    createEntry: (data: CreateEntryInput) => createEntry.mutateAsync(data),
    updateEntry: (data: UpdateEntryInput) => updateEntry.mutateAsync(data),
    deleteEntry: (id: string) => deleteEntry.mutateAsync(id),
  };
}
