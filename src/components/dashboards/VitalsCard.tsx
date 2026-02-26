import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplet, Calendar , } from 'lucide-react';
import { Card } from '../ui/Card';

import { Pulse } from '../animations/Pulse';

interface VitalCardProps {
  type: 'ecg' | 'spo2' | 'glucose' | 'period';
  value?: number;
  unit: string;
  timestamp?: string;
  onClick: () => void;
}

export const VitalsCard: React.FC<VitalCardProps> = ({
  type,
  value,
  onClick
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Example: period from day 10 to 14
  const periodDays = [10, 11, 12, 13, 14];

  const getIcon = () => {
    switch (type) {
      case 'ecg': return Heart;
      case 'spo2': return Activity;
      case 'glucose': return Droplet;
      case 'period': return Calendar;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'ecg': return '#ef4444';
      case 'spo2': return '#3b82f6';
      case 'glucose': return '#10b981';
      case 'period': return '#ec4899'; // Pink
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'ecg': return 'ECG';
      case 'spo2': return 'SpO₂';
      case 'glucose': return 'Glucose';
      case 'period': return 'Period Tracker';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'ecg': return 'from-red-50 to-red-100';
      case 'spo2': return 'from-blue-50 to-blue-100';
      case 'glucose': return 'from-green-50 to-green-100';
      case 'period': return 'from-pink-50 to-pink-100';
    }
  };

  const Icon = getIcon();

  return (
    <Card
      hover
      onClick={onClick}
      className={`bg-gradient-to-br ${getGradient()} border-0`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: getColor() + '20' }}
          >
            <Icon size={24} style={{ color: getColor() }} />
          </div>
          <h3 className="font-semibold text-gray-800">{getTitle()}</h3>
        </div>
      </div>

      <div className="space-y-4">
        {type === 'ecg' && (
          <div className="flex justify-center">
            <Activity color={getColor()} size={72} />
          </div>
        )}

        {type === 'spo2' && value && (
          <div className="flex justify-center">
            <Pulse color={getColor()} value={value} />
          </div>
        )}

        {type === 'glucose' && (
          <div className="flex justify-center">
            <motion.div
              className="relative w-16 h-24 bg-white rounded-full border-4"
              style={{ borderColor: getColor() }}
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{ backgroundColor: getColor() }}
                initial={{ height: 0 }}
                animate={{ height: value ? `${(value / 200) * 100}%` : '50%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </motion.div>
          </div>
        )}

        {type === 'period' && (
          <>
            {/* Weekday labels */}
            <div className="grid pr-2 grid-cols-7 gap-1 text-xs text-pink-500 mb-2 px-2 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Dot grid */}
            <div className="grid grid-cols-7 gap-1 justify-center px-2">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isPeriodDay = periodDays.includes(day);
                const color = isPeriodDay ? '#be185d' : '#fbcfe8'; // dark pink or light pink

                return (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: i * 0.01, duration: 0.4 }}
                  />
                );
              })}
            </div>
          </>
        )}

      </div>
    </Card>
  );
};
