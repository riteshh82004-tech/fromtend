import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  currentRole: 'patient' | 'clinic';
  onboardingCompleted: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: 'patient' | 'clinic') => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      currentRole: 'patient',
      onboardingCompleted: false,
      login: (user, token) => set({ 
        user, 
        token,
        isAuthenticated: true, 
        currentRole: user.role === 'both' ? 'patient' : user.role 
      }),
      logout: async () => {
        // attempt server logout to clear cookie, but don't block if it fails
        try {
          await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
        } catch (err) {
          console.error('Server logout failed', err);
        }

        // reset auth state
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false, 
          onboardingCompleted: false 
        });

      },
      switchRole: (role) => set({ currentRole: role }),
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
      completeOnboarding: () => set({ onboardingCompleted: true }),
      setToken: (token) => set({ token, isAuthenticated: !!token })
    }),
    {
      name: 'auth-storage'
    }
  )
);