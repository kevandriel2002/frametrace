// Jumps to the end of the pipeline when blocks are changed, if not already at the end
import type { StoreApi } from 'zustand/vanilla';
import type { PipelineState } from './pipelineStore';
import type { PlaybackState } from './playbackStore';

export function followPipelineEdits(
  pipeline: StoreApi<PipelineState>,
  playback: StoreApi<PlaybackState>,
): () => void {
  return pipeline.subscribe((state, previous) => {
    if (state.blocks !== previous.blocks && playback.getState().playhead !== null) {
      playback.getState().jumpToEnd();
    }
  });
}