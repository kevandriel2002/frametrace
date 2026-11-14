import { createStore } from 'zustand/vanilla';
import type { FrameMode } from '../core/pipeline/playhead';

// list of speeds dropdown offers
export const SPEEDS = [0.25, 0.5, 1, 2] as const;

export type PlaybackState = {
  playhead: number | null;
  playing: boolean;
  direction: 1 | -1;
  speed: number;
  mode: FrameMode;

// Plays animation
  play: (stepCount: number) => void;
  rewind: (stepCount: number) => void;
  pause: () => void;
//   Pauses
  scrubTo: (playhead: number) => void;
  jumpToEnd: () => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: FrameMode) => void;
//   Moves playhead forward by seconds * speed
  advance: (seconds: number, stepCount: number) => void;
};

export const playbackStore = createStore<PlaybackState>()((set) => ({
  playhead: null,
  playing: false,
  direction: 1,
  speed: 1,
  mode: 'world',

  play: (stepCount) =>
    set((s) => ({
      playing: true,
      direction: 1,
      playhead: s.playhead === null || s.playhead >= stepCount ? 0 : s.playhead,
    })),

  rewind: (stepCount) =>
    set((s) => ({
      playing: true,
      direction: -1,
      playhead: s.playhead === null ? stepCount : Math.min(s.playhead, stepCount),
    })),

  pause: () => set({ playing: false }),

  scrubTo: (playhead) => set({ playhead: Math.max(0, playhead), playing: false }),

  jumpToEnd: () => set({ playhead: null, playing: false }),

  setSpeed: (speed) => set({ speed }),

  setMode: (mode) => set({ mode }),

  advance: (seconds, stepCount) =>
    set((s) => {
      if (!s.playing) return s;
      const current = s.playhead ?? stepCount;
      const next = current + s.direction * seconds * s.speed;
      if (s.direction === 1 && next >= stepCount) return { playhead: null, playing: false };
      if (s.direction === -1 && next <= 0) return { playhead: 0, playing: false };
      return { playhead: next };
    }),
}));