import type { User, Patient, HealthReading, HealthScore } from '../types';

export const calculateHealthScore = (
  user: User | Patient,
  readings: HealthReading[]
): HealthScore => {
  // Get latest readings
  const latestECG = readings.filter(r => r.type === 'ecg').slice(-1)[0];
  const latestSpO2 = readings.filter(r => r.type === 'spo2').slice(-1)[0];
  const latestGlucose = readings.filter(r => r.type === 'glucose').slice(-1)[0];

  // Calculate vital scores (0-100)
  const ecgScore = latestECG ? Math.min(100, Math.max(0, 100 - Math.abs(latestECG.value - 70))) : 50;
  const spo2Score = latestSpO2 ? Math.min(100, latestSpO2.value) : 50;
  const glucoseScore = latestGlucose ? Math.min(100, Math.max(0, 100 - Math.abs(latestGlucose.value - 100) / 2)) : 50;
  const bpScore = 75; // Placeholder

  // Lifestyle scores
  const smokingScore = user.lifestyle.smoking ? -10 : 5;
  const drinkingScore = user.lifestyle.drinking ? -5 : 2;
  const exerciseScore = user.lifestyle.exercise === 'high' ? 15 : user.lifestyle.exercise === 'moderate' ? 5 : -5;
  const sleepScore = user.lifestyle.sleep >= 7 && user.lifestyle.sleep <= 9 ? 10 : -5;

  // Consistency score based on reading frequency
  const consistencyScore = readings.length > 10 ? 10 : readings.length > 5 ? 5 : 0;

  const vitals = {
    ecg: ecgScore,
    bloodPressure: bpScore,
    spo2: spo2Score,
    glucose: glucoseScore
  };

  const lifestyle = {
    smoking: smokingScore,
    drinking: drinkingScore,
    exercise: exerciseScore,
    sleep: sleepScore
  };

  // Weighted calculation
  const vitalScore = (ecgScore * 0.25) + (bpScore * 0.20) + (spo2Score * 0.15) + (glucoseScore * 0.15);
  const lifestyleScore = smokingScore + drinkingScore + exerciseScore + sleepScore;
  const overall = Math.min(100, Math.max(0, vitalScore * 0.75 + consistencyScore + lifestyleScore));

  return {
    overall: Math.round(overall),
    vitals,
    lifestyle,
    consistency: consistencyScore
  };
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBackground = (score: number): string => {
  if (score >= 80) return 'from-green-400 to-green-600';
  if (score >= 60) return 'from-yellow-400 to-yellow-600';
  return 'from-red-400 to-red-600';
};