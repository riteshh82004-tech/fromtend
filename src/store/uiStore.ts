import { create } from 'zustand';

interface UiState {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  setIsMobile: (isMobile: boolean) => set({ isMobile })
}));


