import { createStore } from 'zustand/vanilla';

// list of speeds dropdown offers
export const SPEEDS = [0.25, 0.5, 1, 2] as const;

export type PlaybackState = {
  playhead: number | null;
  playing: boolean;
  speed: number;

// Plays animation
  play: (stepCount: number) => void;
  pause: () => void;
//   Pauses
  scrubTo: (playhead: number) => void;
  jumpToEnd: () => void;
  setSpeed: (speed: number) => void;
//   Moves playhead forward by seconds * speed
  advance: (seconds: number, stepCount: number) => void;
};

export const playbackStore = createStore<PlaybackState>()((set) => ({
  playhead: null,
  playing: false,
  speed: 1,

  play: (stepCount) =>
    set((s) => ({
      playing: true,
      playhead: s.playhead === null || s.playhead >= stepCount ? 0 : s.playhead,
    })),

  pause: () => set({ playing: false }),

  scrubTo: (playhead) => set({ playhead: Math.max(0, playhead), playing: false }),

  jumpToEnd: () => set({ playhead: null, playing: false }),

  setSpeed: (speed) => set({ speed }),

  advance: (seconds, stepCount) =>
    set((s) => {
      if (!s.playing) return s;
      const next = (s.playhead ?? 0) + seconds * s.speed;
      return next >= stepCount ? { playhead: null, playing: false } : { playhead: next };
    }),
}));