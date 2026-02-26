import React from 'react';
import { motion } from 'framer-motion';

interface PulseProps {
  size?: number;
  color?: string;
  value?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  size = 120,
  color = '#3b82f6',
  value = 98
}) => {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full border-4 opacity-20"
        style={{ 
          width: size, 
          height: size, 
          borderColor: color 
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute rounded-full border-4 opacity-40"
        style={{ 
          width: size * 0.8, 
          height: size * 0.8, 
          borderColor: color 
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />
      <div 
        className="rounded-full flex items-center justify-center text-white font-bold text-xl"
        style={{ 
          width: size * 0.6, 
          height: size * 0.6, 
          backgroundColor: color 
        }}
      >
        {value}%
      </div>
    </div>
  );
};