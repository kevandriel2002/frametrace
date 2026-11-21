// Returns snapshot of the app's state
import type { ModelKind } from '../core/models';
import type { FrameMode } from '../core/pipeline/playhead';
import type { Pipeline } from '../core/pipeline/types';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';

export type Snapshot = {
  pipeline: Pipeline;
  playhead: number | null;
  playing: boolean;
  mode: FrameMode;
  model: ModelKind;
};

export function takeSnapshot(): Snapshot {
  const { playhead, playing, mode } = playbackStore.getState();
  return {
    pipeline: toPipeline(pipelineStore.getState().blocks),
    playhead,
    playing,
    mode,
    model: viewStore.getState().model,
  };
}