import { useMemo } from 'react';
import { useStore } from 'zustand';
import { productExpression, readingOrder } from '../core/pipeline/describe';
import { invertPipeline } from '../core/pipeline/inverse';
import type { FrameMode } from '../core/pipeline/playhead';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';

const OPTIONS: { mode: FrameMode; title: string; direction: string }[] = [
  { mode: 'world', title: 'World axes (fixed frame)', direction: 'read right to left' },
  { mode: 'local', title: 'Local axes (moving frame)', direction: 'read left to right' },
];

export function ReadingCard() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const mode = useStore(playbackStore, (s) => s.mode);
  const { setMode } = playbackStore.getState();

  const pipeline = useMemo(() => toPipeline(blocks), [blocks]);
  const inverse = useMemo(() => invertPipeline(pipeline), [pipeline]);

  if (pipeline.length === 0) return null;

  return (
    <section className="reading-card" aria-label="Reading the product">
      <p className="reading-product">M = {productExpression(pipeline)}</p>

      <fieldset className="reading-options">
        <legend>Watch the steps along the:</legend>
        {OPTIONS.map((option) => (
          <label key={option.mode} className="reading-option">
            <input
              type="radio"
              name="frame-mode"
              value={option.mode}
              checked={mode === option.mode}
              onChange={() => setMode(option.mode)}
            />
            <span>
              <strong>{option.title}</strong>, {option.direction}
              <span className="reading-order">{readingOrder(pipeline, option.mode)}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <p className="reading-rewind">
        {inverse
          ? `Rewind applies the inverse: ${readingOrder(inverse, mode)}`
          : 'Rewind is unavailable: a scale of 0 flattens the house and cannot be undone.'}
      </p>
    </section>
  );
}