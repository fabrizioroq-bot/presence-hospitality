import { create } from 'zustand';

interface ScrollProgressState {
  progress: number;
  setProgress: (progress: number) => void;
}

export const useScrollProgress = create<ScrollProgressState>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
}));
