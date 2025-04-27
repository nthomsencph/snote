import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  font: string;
  viewMode: 'list' | 'gallery';
  hidePreview: boolean;
  setFont: (font: string) => void;
  setViewMode: (mode: 'list' | 'gallery') => void;
  setHidePreview: (hide: boolean) => void;
}

interface PersistedState {
  font?: string;
  viewMode?: 'list' | 'gallery';
  hidePreview?: boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      font: 'font-system',
      viewMode: 'list',
      hidePreview: false,
      setFont: font => set({ font }),
      setViewMode: viewMode => set({ viewMode }),
      setHidePreview: hidePreview => set({ hidePreview }),
    }),
    {
      name: 'snote-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        font: state.font,
        viewMode: state.viewMode,
        hidePreview: state.hidePreview,
      }),
      migrate: (persistedState: PersistedState) => {
        // If there's no font set in the old state, use the default
        if (!persistedState.font) {
          persistedState.font = 'font-system';
        }
        // If the font doesn't have the 'font-' prefix, add it
        else if (!persistedState.font.startsWith('font-')) {
          persistedState.font = `font-${persistedState.font}`;
        }
        return persistedState as UIState;
      },
      version: 1,
    }
  )
);
