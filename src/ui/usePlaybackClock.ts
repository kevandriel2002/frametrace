// Playback clock
import { useEffect } from 'react';
import { useStore } from 'zustand';
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';

const MAX_FRAME_SECONDS = 0.1;

export function usePlaybackClock(): void {
  const playing = useStore(playbackStore, (s) => s.playing);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const seconds = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;
      playbackStore.getState().advance(seconds, pipelineStore.getState().blocks.length);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
}