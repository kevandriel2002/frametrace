// Renders timeline controls (Play/Pause, scrubber slider, etc.)
import { useStore } from 'zustand';
import { effectivePlayhead } from '../core/pipeline/playhead';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { SPEEDS, playbackStore } from '../store/playbackStore';
import { invertPipeline } from '../core/pipeline/inverse';
import { FrameToggle } from './FrameToggle';

export function TimelineBar() {
  const stepCount = useStore(pipelineStore, (s) => s.blocks.length);
  const playhead = useStore(playbackStore, (s) => s.playhead);
  const playing = useStore(playbackStore, (s) => s.playing);
  const speed = useStore(playbackStore, (s) => s.speed);
  const direction = useStore(playbackStore, (s) => s.direction);
  const canRewind = useStore(pipelineStore, (s) => invertPipeline(toPipeline(s.blocks)) !== null);
  const { play, rewind, pause, scrubTo, jumpToEnd, setSpeed } = playbackStore.getState();

  const t = effectivePlayhead(playhead, stepCount);
  const empty = stepCount === 0;
  const rewinding = playing && direction === -1;
  const playingForward = playing && direction === 1;
  

  return (
    <div className="timeline" data-tour="timeline">
      <button
        type="button"
        onClick={() => (rewinding ? pause() : rewind(stepCount))}
        disabled={empty || !canRewind || (t === 0 && !rewinding)}
        title={canRewind ? 'Rewind to the identity' : 'Unavailable: a scale of 0 cannot be undone'}
        className="timeline-play"
      >
        {rewinding ? 'Pause' : 'Rewind'}
      </button>
      <button
        type="button"
        onClick={() => (playingForward ? pause() : play(stepCount))}
        disabled={empty}
        className="timeline-play"
      >
        {playingForward ? 'Pause' : 'Play'}
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

      <span
        className="tooltip-wrap"
        title={playhead === null ? 'Already showing the full result' : 'Jump to the full result'}
      >
        <button type="button" onClick={jumpToEnd} disabled={playhead === null}>
          End
        </button>
      </span>
      <FrameToggle />
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