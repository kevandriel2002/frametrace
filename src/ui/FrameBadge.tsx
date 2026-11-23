import { useStore } from 'zustand';
import { playbackStore } from '../store/playbackStore';

export function FrameBadge() {
  const mode = useStore(playbackStore, (s) => s.mode);

  return (
    <p className="frame-badge" aria-live="polite">
      <span className="frame-badge-ring" aria-hidden="true" />
      {mode === 'world' ? 'Steps measured from the world origin' : 'Steps measured from the object’s origin'}
    </p>
  );
}