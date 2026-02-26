export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  role: 'patient' | 'clinic' | 'both';
  medicalHistory?: string[];
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    exercise: 'low' | 'moderate' | 'high';
    sleep: number; // hours per night
  };
  profileImage?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  lifestyle: User['lifestyle'];
  clinicId?: string;
  healthScore: number;
  lastTestDate?: string;
  role: 'patient'; // Patients always have 'patient' role
}

export interface HealthReading {
  id: string;
  patientId: string;
  type: 'ecg' | 'spo2' | 'glucose' | 'period';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
  deviceId?: string;
}

export interface HealthScore {
  overall: number;
  vitals: {
    ecg: number;
    bloodPressure: number;
    spo2: number;
    glucose: number;
  };
  lifestyle: {
    smoking: number;
    drinking: number;
    exercise: number;
    sleep: number;
  };
  consistency: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'ecg' | 'spo2' | 'glucose' | 'bp';
  connectionType: 'bluetooth' | 'wifi' | 'usb';
  connected: boolean;
  batteryLevel?: number;
}

export interface ECGSession {
  id: string;
  patientId: string;
  samples: number[];
  samplingRate: number;
  startTime: Date;
  endTime: Date;
  duration?: number; // in seconds
  avgHeartRate?: number;
  signalQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ECGDataPoint {
  value: number;
  timestamp: number;
}