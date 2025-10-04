import React from 'react';
import { motion } from 'framer-motion';

interface MagicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const MagicButton: React.FC<MagicButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white';
      case 'glow':
        return 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <motion.button
      className={`
        rounded-lg font-medium transition-all duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.button>
  );
};

export default MagicButton;