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
  } catch {
    // Malformed JSON or storage unavailable
  }
  try {
    localStorage.removeItem('app-theme');
  } catch {
    // Storage access blocked — ignore
  }
  return undefined;
}

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Listen for system preference changes — only respond when no user preference is stored
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!getStoredTheme()) {
        setTheme(mql.matches ? 'dark' : 'light');
      }
    };

    if (!getStoredTheme()) {
      mql.addEventListener('change', handleChange);
    }

    return () => mql.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Apply theme class to document — use store value as primary, fall back to system preference
  useEffect(() => {
    const stored = getStoredTheme();
    const effectiveTheme = stored ?? theme;

    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      if (theme !== systemTheme) {
        setTheme(systemTheme);
        return; // Will re-run with updated theme
      }
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
