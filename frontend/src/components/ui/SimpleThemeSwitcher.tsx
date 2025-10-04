import React from 'react';
import { useTheme } from '../../hooks/utils/useTheme';

const SimpleThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme, isDark, isLight, isHighContrast } = useTheme();

  const getThemeIcon = () => {
    if (isDark) return '🌙';
    if (isLight) return '☀️';
    if (isHighContrast) return '⚡';
    return '🌙';
  };

  const getThemeName = () => {
    if (isDark) return '深色模式';
    if (isLight) return '浅色模式';
    if (isHighContrast) return '高对比度';
    return '深色模式';
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={toggleTheme}
        className={`p-3 rounded-full glass-effect border-2 transition-all duration-300 hover:scale-110 ${
          isDark ? 'border-cyan-500' :
          isLight ? 'border-blue-500' :
          'border-yellow-400'
        }`}
        title={`当前主题: ${getThemeName()}`}
      >
        <span className="text-2xl">{getThemeIcon()}</span>
      </button>

      {/* 主题提示 */}
      <div className="absolute right-0 top-full mt-2 px-3 py-2 glass-effect rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
        {getThemeName()}
      </div>
    </div>
  );
};

export default SimpleThemeSwitcher;