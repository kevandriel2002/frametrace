// Tracks whether tutorial is open and which step it's on
import { createStore } from 'zustand/vanilla';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { LESSON } from './lesson';
import { markTutorialSeen } from './seen';

export type TutorialState = {
  active: boolean;
  stepIndex: number;
  start: () => void;
  next: () => void;
  back: () => void;
  close: () => void;
};

export const tutorialStore = createStore<TutorialState>()((set, get) => ({
  active: false,
  stepIndex: 0,

  start: () => {
    playbackStore.getState().jumpToEnd();
    playbackStore.getState().setMode('world');
    viewStore.getState().setModel('house');
    set({ active: true, stepIndex: 0 });
  },

  next: () => {
    const { stepIndex } = get();
    if (stepIndex >= LESSON.length - 1) {
      markTutorialSeen();
      set({ active: false });
    } else {
      set({ stepIndex: stepIndex + 1 });
    }
  },

  back: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),

//  Finishing or closing marks tutorial as seen, so it doens't open again
  close: () => {
    markTutorialSeen();
    set({ active: false });
  },
}));