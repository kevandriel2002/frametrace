// Renders timeline controls (Play/Pause, scrubber slider, etc.)
import { useStore } from 'zustand';
import { effectivePlayhead } from '../core/pipeline/playhead';
import { pipelineStore } from '../store/pipelineStore';
import { SPEEDS, playbackStore } from '../store/playbackStore';

export function TimelineBar() {
  const stepCount = useStore(pipelineStore, (s) => s.blocks.length);
  const playhead = useStore(playbackStore, (s) => s.playhead);
  const playing = useStore(playbackStore, (s) => s.playing);
  const speed = useStore(playbackStore, (s) => s.speed);
  const { play, pause, scrubTo, jumpToEnd, setSpeed } = playbackStore.getState();

  const t = effectivePlayhead(playhead, stepCount);
  const empty = stepCount === 0;

  return (
    <div className="timeline">
      <button
        type="button"
        onClick={() => (playing ? pause() : play(stepCount))}
        disabled={empty}
        className="timeline-play"
      >
        {playing ? 'Pause' : 'Play'}
      </button>

      <input
        type="range"
        className="timeline-slider"
        min={0}
        max={Math.max(stepCount, 1)}
        step={0.01}
        value={t}
        disabled={empty}
        onChange={(event) => scrubTo(event.target.valueAsNumber)}
        aria-label="Timeline"
        aria-valuetext={`Step ${t.toFixed(2)} of ${stepCount}`}
      />

      <span className="timeline-readout">
        {t.toFixed(2)} / {stepCount}
      </span>

      <button type="button" onClick={jumpToEnd} disabled={playhead === null}>
        End
      </button>

      <label className="timeline-speed">
        Speed
        <select
          value={speed}
          onChange={(event) => {
            const next = SPEEDS.find((s) => s === Number(event.target.value));
            if (next) setSpeed(next);
          }}
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}