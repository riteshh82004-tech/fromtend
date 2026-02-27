import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ECGSession } from '../types';

interface ECGStoreState {
  sessions: ECGSession[];
  currentSession: ECGSession | null;
  isRecording: boolean;
  startSession: (patientId: string, samplingRate?: number) => void;
  stopSession: () => void;
  addSamples: (samples: number[]) => void;
  saveSession: () => void;
  deleteSession: (sessionId: string) => void;
  getSession: (sessionId: string) => ECGSession | undefined;
  getPatientSessions: (patientId: string) => ECGSession[];
  calculateHeartRate: (samples: number[]) => number;
  calculateSignalQuality: (samples: number[]) => 'excellent' | 'good' | 'fair' | 'poor';
}

type PersistedECGSessions = Array<
  Omit<ECGSession, 'startTime' | 'endTime'> & { startTime: string; endTime: string }
>;

type PersistedECGState = {
  sessions?: PersistedECGSessions;
};

// Calculate average heart rate from ECG samples (simplified R-peak detection)
const calculateHeartRate = (samples: number[]): number => {
  if (samples.length < 100) return 0;

  // Simple peak detection algorithm
  const threshold = 600; // Adjust based on your ECG sensor
  const peaks: number[] = [];
  let lastPeakIndex = -100;

  for (let i = 1; i < samples.length - 1; i++) {
    if (
      samples[i] > threshold &&
      samples[i] > samples[i - 1] &&
      samples[i] > samples[i + 1] &&
      i - lastPeakIndex > 20 // Minimum distance between peaks
    ) {
      peaks.push(i);
      lastPeakIndex = i;
    }
  }

  if (peaks.length < 2) return 0;

  // Calculate average interval between peaks
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Assuming 250 Hz sampling rate (adjust if different)
  const samplingRate = 250;
  const bpm = (60 * samplingRate) / avgInterval;
  return Math.round(bpm);
};

// Calculate signal quality based on noise and consistency
const calculateSignalQuality = (samples: number[]): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (samples.length < 100) return 'poor';

  // Calculate standard deviation (noise indicator)
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  // Calculate signal-to-noise ratio (simplified)
  const signalRange = Math.max(...samples) - Math.min(...samples);
  const snr = signalRange / stdDev;

  if (snr > 10) return 'excellent';
  if (snr > 5) return 'good';
  if (snr > 2) return 'fair';
  return 'poor';
};

export const useECGStore = create<ECGStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      isRecording: false,

      startSession: (patientId: string, samplingRate: number = 250) => {
        const session: ECGSession = {
          id: `ecg_${Date.now()}`,
          patientId,
          samples: [],
          samplingRate,
          startTime: new Date(),
          endTime: new Date()
        };

        set({
          currentSession: session,
          isRecording: true
        });
      },

      stopSession: () => {
        const state = get();
        if (!state.currentSession) return;

        const session = {
          ...state.currentSession,
          endTime: new Date(),
          duration: (new Date().getTime() - state.currentSession.startTime.getTime()) / 1000,
          avgHeartRate: calculateHeartRate(state.currentSession.samples),
          signalQuality: calculateSignalQuality(state.currentSession.samples)
        };

        set((s: ECGStoreState) => ({
          sessions: [...s.sessions, session],
          currentSession: null,
          isRecording: false
        }));
      },

      addSamples: (samples: number[]) => {
        const state = get();
        if (!state.currentSession || !state.isRecording) return;

        set({
          currentSession: {
            ...state.currentSession,
            samples: [...state.currentSession.samples, ...samples],
            endTime: new Date()
          }
        });
      },

      saveSession: () => {
        const state = get();
        if (!state.currentSession) return;

        const session = {
          ...state.currentSession,
          endTime: new Date(),
          duration: (new Date().getTime() - state.currentSession.startTime.getTime()) / 1000,
          avgHeartRate: calculateHeartRate(state.currentSession.samples),
          signalQuality: calculateSignalQuality(state.currentSession.samples)
        };

        set({
          sessions: [...state.sessions, session],
          currentSession: null
        });
      },

      deleteSession: (sessionId: string) => {
        set((state: ECGStoreState) => ({
          sessions: state.sessions.filter((s: ECGSession) => s.id !== sessionId)
        }));
      },

      getSession: (sessionId: string) => {
        return get().sessions.find(s => s.id === sessionId);
      },

      getPatientSessions: (patientId: string) => {
        return get().sessions.filter(s => s.patientId === patientId);
      },

      calculateHeartRate,
      calculateSignalQuality
    }),
    {
      name: 'ecg-storage',
      partialize: (state: ECGStoreState): PersistedECGState => ({
        sessions: state.sessions.map((s: ECGSession) => ({
          ...s,
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString()
        }))
      }),
      merge: (persistedState: unknown, currentState: ECGStoreState): ECGStoreState => {
        const persisted = persistedState as PersistedECGState | null;
        if (persisted?.sessions && Array.isArray(persisted.sessions)) {
          return {
            ...currentState,
            sessions: persisted.sessions.map((s) => ({
              ...s,
              startTime: new Date(s.startTime),
              endTime: new Date(s.endTime)
            }))
          };
        }
        return currentState;
      }
    }
  )
);

