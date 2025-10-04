import React from 'react';
import { motion } from 'framer-motion';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  delay?: number;
}

const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  delay = 0
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10';
      default:
        return 'bg-black/30 backdrop-blur-sm border border-white/10';
    }
  };

  return (
    <motion.div
      className={`
        rounded-xl p-6 transition-all duration-300
        ${getVariantClasses()}
        ${hover ? 'hover:shadow-xl hover:scale-105' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? {
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transition: { duration: 0.2 }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export default MagicCard;