import React from 'react';
import { motion } from 'framer-motion';
import { Cigarette, Wine, Dumbbell, Moon } from 'lucide-react';
import type { User, Patient } from '../../types';
import { Card } from '../ui/Card';

interface LifestyleInfoProps {
  user: User | Patient | null;
}

export const LifestyleInfo: React.FC<LifestyleInfoProps> = ({ user }) => {
  if (!user) return null;

  const lifestyleItems = [
    {
      icon: Cigarette,
      label: 'Smoking',
      value: user.lifestyle.smoking ? 'Yes' : 'No',
      color: user.lifestyle.smoking ? 'text-red-600' : 'text-green-600',
      bgColor: user.lifestyle.smoking ? 'bg-red-100' : 'bg-green-100'
    },
    {
      icon: Wine,
      label: 'Drinking',
      value: user.lifestyle.drinking ? 'Regular' : 'No',
      color: user.lifestyle.drinking ? 'text-yellow-600' : 'text-green-600',
      bgColor: user.lifestyle.drinking ? 'bg-yellow-100' : 'bg-green-100'
    },
    {
      icon: Dumbbell,
      label: 'Exercise',
      value: user.lifestyle.exercise.charAt(0).toUpperCase() + user.lifestyle.exercise.slice(1),
      color: user.lifestyle.exercise === 'high' ? 'text-green-600' : user.lifestyle.exercise === 'moderate' ? 'text-yellow-600' : 'text-red-600',
      bgColor: user.lifestyle.exercise === 'high' ? 'bg-green-100' : user.lifestyle.exercise === 'moderate' ? 'bg-yellow-100' : 'bg-red-100'
    },
    {
      icon: Moon,
      label: 'Sleep',
      value: `${user.lifestyle.sleep}h`,
      color: user.lifestyle.sleep >= 7 && user.lifestyle.sleep <= 9 ? 'text-green-600' : 'text-yellow-600',
      bgColor: user.lifestyle.sleep >= 7 && user.lifestyle.sleep <= 9 ? 'bg-green-100' : 'bg-yellow-100'
    }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle Factors</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lifestyleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-sm font-medium text-gray-800">{item.label}</div>
              <div className={`text-sm ${item.color} font-semibold`}>{item.value}</div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};