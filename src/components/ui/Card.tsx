import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  gradient = false
}) => {
  const baseClasses = gradient 
    ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
    : 'bg-white border border-gray-200';
    
  const interactiveClasses = hover || onClick 
    ? 'cursor-pointer hover:shadow-xl transition-all duration-300' 
    : '';

  return (
    <motion.div
      whileHover={hover || onClick ? { y: -2, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${interactiveClasses} rounded-2xl shadow-lg p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};