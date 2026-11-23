import { useMemo } from 'react';
import { useStore } from 'zustand';
import { readingOrder } from '../core/pipeline/describe';
import { invertPipeline } from '../core/pipeline/inverse';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';

export function ReadingDetails() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const mode = useStore(playbackStore, (s) => s.mode);

  const pipeline = useMemo(() => toPipeline(blocks), [blocks]);
  const inverse = useMemo(() => invertPipeline(pipeline), [pipeline]);

  if (pipeline.length === 0) return null;

  return (
    <details className="reading-details" data-tour="reading-details">
      <summary>How to read this product</summary>
      <dl>
        <dt>World axes (fixed frame)</dt>
        <dd>
          Read M right to left: <code>{readingOrder(pipeline, 'world')}</code>
        </dd>
        <dt>Local axes (moving frame)</dt>
        <dd>
          Read M left to right: <code>{readingOrder(pipeline, 'local')}</code>
        </dd>
        <dt>Both readings</dt>
        <dd>End in the same place. Only the path in between differs.</dd>
        <dt>Rewind</dt>
        <dd>
          {inverse ? (
            <>
              Applies the inverse: <code>{readingOrder(inverse, mode)}</code>
            </>
          ) : (
            'Unavailable: a scale of 0 flattens the object and cannot be undone.'
          )}
        </dd>
      </dl>
    </details>
  );
}