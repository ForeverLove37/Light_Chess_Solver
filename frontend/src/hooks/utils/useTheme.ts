import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'high-contrast';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 从localStorage读取保存的主题，如果没有则使用系统偏好
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    
    // 检查系统颜色主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark'; // 默认深色主题
  });

  useEffect(() => {
    // 保存主题到localStorage
    localStorage.setItem('theme', theme);

    // 应用主题到document和body
    const root = document.documentElement;
    const body = document.body;

    // 移除所有主题类
    root.classList.remove('dark', 'light', 'high-contrast');
    body.classList.remove('dark', 'light', 'high-contrast');

    // 添加当前主题类到body和root
    root.classList.add(theme);
    body.classList.add(theme);

    // 设置CSS变量
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#111827');
      root.style.setProperty('--bg-secondary', '#1f2937');
      root.style.setProperty('--text-primary', '#f3f4f6');
      root.style.setProperty('--text-secondary', '#9ca3af');
      root.style.setProperty('--accent', '#16f4d0');
      root.style.setProperty('--accent-hover', '#0f3460');

      // 为typography.css中的主题变量设置值
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-tertiary', '#94a3b8');
    } else if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f3f4f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--accent', '#0f3460');
      root.style.setProperty('--accent-hover', '#16f4d0');

      // 为typography.css中的主题变量设置值
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-tertiary', '#64748b');
    } else if (theme === 'high-contrast') {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#cccccc');
      root.style.setProperty('--accent', '#ffff00');
      root.style.setProperty('--accent-hover', '#ff0000');

      // 为typography.css中的主题变量设置值
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-tertiary', '#cbd5e1');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const themes: Theme[] = ['dark', 'light', 'high-contrast'];
      const currentIndex = themes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themes.length;
      return themes[nextIndex];
    });
  }, []);

  const setThemeMode = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isHighContrast: theme === 'high-contrast'
  };
};