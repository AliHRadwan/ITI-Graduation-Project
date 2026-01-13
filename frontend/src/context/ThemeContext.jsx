import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, getStoredTheme, setTheme as persistTheme } from '@/utils/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme());

  const setTheme = (nextTheme) => {
    persistTheme(nextTheme);
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
