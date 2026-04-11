export type Theme = 'light' | 'dark';

export type ThemeStoreProps = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (value: Theme) => void;
};
