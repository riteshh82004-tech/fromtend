import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import { useHealthScore } from '../../hooks/useHealthScore';
import { getScoreColor } from '../../utils/healthScore';
import { Card } from '../ui/Card';

export const HealthScore: React.FC = () => {
  const healthScore = useHealthScore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!healthScore) return null;

  const { overall } = healthScore;
  const circumference = 2 * Math.PI * 90;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Health Score</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowBreakdown(true)}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          <Info size={20} />
        </motion.button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-${overall >= 80 ? 'green' : overall >= 60 ? 'yellow' : 'red'}-400`} />
                <stop offset="100%" className={`stop-${overall >= 80 ? 'green' : overall >= 60 ? 'yellow' : 'red'}-600`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className={`text-4xl font-bold ${getScoreColor(overall)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {overall}
              </motion.div>
              <div className="text-sm text-gray-500 mt-1">Health Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <span className="text-sm text-gray-600">
          {overall >= 80 ? 'Excellent health!' : overall >= 60 ? 'Good health' : 'Needs attention'}
        </span>
      </div>

      {showBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBreakdown(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-black rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4">Health Score Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vitals (75% weight)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ECG/Heart Rate (25%)</span>
                    <span className="font-medium">{healthScore.vitals.ecg}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blood Pressure (20%)</span>
                    <span className="font-medium">{healthScore.vitals.bloodPressure}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SpO₂ (15%)</span>
                    <span className="font-medium">{healthScore.vitals.spo2}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucose (15%)</span>
                    <span className="font-medium">{healthScore.vitals.glucose}/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Lifestyle Factors</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Smoking</span>
                    <span className={`font-medium ${healthScore.lifestyle.smoking > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {healthScore.lifestyle.smoking > 0 ? '+' : ''}{healthScore.lifestyle.smoking}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exercise</span>
                    <span className={`font-medium ${healthScore.lifestyle.exercise > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {healthScore.lifestyle.exercise > 0 ? '+' : ''}{healthScore.lifestyle.exercise}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleep</span>
                    <span className={`font-medium ${healthScore.lifestyle.sleep > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {healthScore.lifestyle.sleep > 0 ? '+' : ''}{healthScore.lifestyle.sleep}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Consistency (10%)</h4>
                <div className="flex justify-between text-sm">
                  <span>Regular Testing</span>
                  <span className="font-medium text-green-600">+{healthScore.consistency}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBreakdown(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-2xl font-medium"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
};