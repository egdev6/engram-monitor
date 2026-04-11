import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeStoreProps } from './types';

export const useThemeStore = create<ThemeStoreProps>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (value) => set({ theme: value })
    }),
    {
      name: 'app-theme'
    }
  )
);
