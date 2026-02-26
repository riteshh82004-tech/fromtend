import React from 'react';
import { motion } from 'framer-motion';

interface IntroWaveformProps {
  color?: string;
  height?: number;
  animated?: boolean;
}

export const IntroWaveform: React.FC<IntroWaveformProps> = ({
  color = '#ef4444',
  height = 60,
  animated = true
}) => {
  const pathVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 2, ease: "easeInOut", repeat: animated ? Infinity : 0 }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height={height} viewBox="0 0 200 60" className="overflow-visible">
        <motion.path
          d="M0,30 L20,30 L25,10 L30,50 L35,5 L40,55 L45,30 L65,30 L70,30 L75,25 L80,35 L85,30 L105,30 L110,15 L115,45 L120,10 L125,50 L130,30 L200,30"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
      </svg>
    </div>
  );
};