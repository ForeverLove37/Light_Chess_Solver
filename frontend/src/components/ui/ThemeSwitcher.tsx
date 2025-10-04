import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/utils/useTheme';

const ThemeSwitcher: React.FC = () => {
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
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={toggleTheme}
        className={`p-3 rounded-full glass-effect border-2 transition-all duration-300 ${
          isDark ? 'border-matrix-on' :
          isLight ? 'border-blue-500' :
          'border-yellow-400'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={`当前主题: ${getThemeName()}`}
      >
        <motion.span
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl"
        >
          {getThemeIcon()}
        </motion.span>
      </motion.button>
      
      {/* 主题提示 */}
      <motion.div
        className="absolute right-0 top-full mt-2 px-3 py-2 glass-effect rounded-lg text-sm whitespace-nowrap"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {getThemeName()}
      </motion.div>
    </motion.div>
  );
};

export default ThemeSwitcher;