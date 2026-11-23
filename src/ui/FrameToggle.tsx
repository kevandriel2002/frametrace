import { useStore } from 'zustand';
import type { FrameMode } from '../core/pipeline/playhead';
import { playbackStore } from '../store/playbackStore';

const OPTIONS: { mode: FrameMode; label: string; hint: string }[] = [
  { mode: 'world', label: 'World', hint: 'Steps run top to bottom, each about the world axes' },
  { mode: 'local', label: 'Local', hint: 'Steps run bottom to top, each about the object’s own axes' },
];

export function FrameToggle() {
  const mode = useStore(playbackStore, (s) => s.mode);
  const { setMode } = playbackStore.getState();

  return (
    <div className="segmented" role="group" aria-label="Reading" data-tour="frame-toggle">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          title={option.hint}
          onClick={() => setMode(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}