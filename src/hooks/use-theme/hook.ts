import { useEffect } from 'react';
import { useThemeStore } from './store';

/** Reads and validates the persisted theme. Returns undefined if missing/invalid. */
function getStoredTheme(): 'light' | 'dark' | undefined {
  try {
    const raw = localStorage.getItem('app-theme');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const value = parsed.state?.theme;
    if (value === 'light' || value === 'dark') return value;
    // Invalid value — remove so system preference listener can attach
    localStorage.removeItem('app-theme');
  } catch {
    localStorage.removeItem('app-theme');
  }
  return undefined;
}

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Listen for system preference changes when no stored theme
  useEffect(() => {
    if (getStoredTheme()) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme(mql.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Apply theme class to document
  useEffect(() => {
    const stored = getStoredTheme();
    const effectiveTheme = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (!stored) {
      setTheme(effectiveTheme);
    }

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme
  };
};
