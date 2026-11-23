import { useMemo } from 'react';
import { useStore } from 'zustand';
import { describePivot, pivotAt } from '../core/pipeline/pivot';
import { effectivePlayhead } from '../core/pipeline/playhead';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';

export function FrameBadge() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const playhead = useStore(playbackStore, (s) => s.playhead);
  const mode = useStore(playbackStore, (s) => s.mode);

  const text = useMemo(() => {
    const pipeline = toPipeline(blocks);
    return describePivot(pivotAt(pipeline, effectivePlayhead(playhead, pipeline.length), mode), mode);
  }, [blocks, playhead, mode]);

  return (
    <p className="frame-badge" aria-live="polite">
      <span className="frame-badge-ring" aria-hidden="true" />
      {text}
    </p>
  );
}