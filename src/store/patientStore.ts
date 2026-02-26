import { create } from 'zustand';
import type { Patient, HealthReading } from '../types';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  readings: HealthReading[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  selectPatient: (patient: Patient | null) => void;
  addReading: (reading: HealthReading) => void;
  getPatientReadings: (patientId: string) => HealthReading[];
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  readings: [],
  addPatient: (patient) => set((state) => ({ patients: [...state.patients, patient] })),
  updatePatient: (id, updates) => set((state) => ({
    patients: state.patients.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  selectPatient: (patient) => set({ selectedPatient: patient }),
  addReading: (reading) => set((state) => ({ readings: [...state.readings, reading] })),
  getPatientReadings: (patientId) => get().readings.filter(r => r.patientId === patientId)
}));