// Tracks whether tutorial is open and which step it's on
import { createStore } from 'zustand/vanilla';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { LESSON } from './lesson';
import { clearSavedStep, loadSavedStep, markTutorialSeen, saveStep } from './seen';

export type TutorialState = {
  active: boolean;
  minimised: boolean;
  stepIndex: number;
  completed: boolean;
  autoAdvance: boolean;
  savedStep: number | null;
  start: () => void;
  resume: () => void;
  next: () => void;
  back: () => void;
  close: () => void;
  minimise: () => void;
  restore: () => void;
  markCompleted: () => void;
};

export const tutorialStore = createStore<TutorialState>()((set, get) => {
  const goTo = (index: number, autoAdvance: boolean) => {
    saveStep(index);
    set({ active: true, minimised: false, stepIndex: index, completed: false, autoAdvance, savedStep: index });
    LESSON.at(index)?.enter?.();
  };

  return {
    active: false,
    minimised: false,
    stepIndex: 0,
    completed: false,
    autoAdvance: true,
    savedStep: loadSavedStep(),

    start: () => {
      playbackStore.getState().jumpToEnd();
      playbackStore.getState().setMode('world');
      viewStore.getState().setModel('house');
      goTo(0, true);
    },

    resume: () => goTo(get().savedStep ?? 0, true),

    next: () => {
      const { stepIndex } = get();
      if (stepIndex >= LESSON.length - 1) {
        markTutorialSeen();
        clearSavedStep();
        set({ active: false, minimised: false, savedStep: null });
      } else {
        goTo(stepIndex + 1, true);
      }
    },

    back: () => goTo(Math.max(0, get().stepIndex - 1), false),

    close: () => {
      markTutorialSeen();
      set({ active: false, minimised: false });
    },

    minimise: () => set({ minimised: true }),
    restore: () => set({ minimised: false }),
    markCompleted: () => set({ completed: true }),
  };
});