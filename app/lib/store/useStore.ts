import { create } from 'zustand';
import { Entry } from '../types';
import { api } from '../api';

interface EntryStore {
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
  loadEntries: () => Promise<void>;
  createEntry: (entry: Omit<Entry, 'id' | 'date' | 'lastUpdated'>) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<Entry>) => Promise<Entry>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useStore = create<EntryStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  loadEntries: async () => {
    try {
      set({ isLoading: true, error: null });
      const entries = await api.entries.getAll();
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load entries', isLoading: false });
    }
  },

  createEntry: async (entry) => {
    try {
      set({ isLoading: true, error: null });
      const newEntry = await api.entries.create(entry);
      set(state => ({
        entries: [newEntry, ...state.entries],
        isLoading: false
      }));
      return newEntry;
    } catch (error) {
      set({ error: 'Failed to create entry', isLoading: false });
      throw error;
    }
  },

  updateEntry: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const updatedEntry = await api.entries.update(id, data);
      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? updatedEntry : entry
        ),
        isLoading: false
      }));
      return updatedEntry;
    } catch (error) {
      set({ error: 'Failed to update entry', isLoading: false });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await api.entries.delete(id);
      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete entry', isLoading: false });
      throw error;
    }
  }
})); 