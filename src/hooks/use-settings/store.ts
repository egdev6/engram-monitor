import { create } from 'zustand';
import type { SettingsStoreProps } from './types';

export const useSettingsStore = create<SettingsStoreProps>((set) => ({
  isOpen: false,
  openSettings: () => {
    set({ isOpen: true });
  },
  closeSettings: () => {
    set({ isOpen: false });
  },
  toggleSettings: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  }
}));
