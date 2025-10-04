import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'high-contrast';
      return 'dark';
    });
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';
  const isHighContrast = theme === 'high-contrast';

  return {
    theme,
    toggleTheme,
    isDark,
    isLight,
    isHighContrast,
    setTheme
  };
};