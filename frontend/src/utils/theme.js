const STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark', 'system'];

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(stored) ? stored : 'light';
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const resolved =
    theme === 'system'
      ? window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
        ? 'dark'
        : 'light'
      : theme;
  const root = document.documentElement;
  const body = document.body;
  root.classList.toggle('dark', resolved === 'dark');
  if (body) {
    body.classList.toggle('dark', resolved === 'dark');
  }
};

export const setTheme = (theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
};
