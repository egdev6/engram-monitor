import { useEffect } from 'react';
import { useThemeStore } from './store';

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme(mql.matches ? 'dark' : 'light');
    };

    if (!localStorage.getItem('app-theme')) {
      mql.addEventListener('change', handleChange);
    }

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let themeParsed: string | undefined;
    try {
      const storedTheme = localStorage.getItem('app-theme');
      const parsed = JSON.parse(storedTheme || '{}');
      if (parsed.state?.theme === 'light' || parsed.state?.theme === 'dark') {
        themeParsed = parsed.state.theme;
      }
    } catch {
      // Malformed localStorage — fall through to system preference
    }

    if (!themeParsed) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeParsed ?? theme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme
  };
};
