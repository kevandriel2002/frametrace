import { beforeEach, describe, expect, it } from 'vitest';
import { followPipelineEdits } from './links';
import { pipelineStore } from './pipelineStore';
import { playbackStore } from './playbackStore';

beforeEach(() => {
  pipelineStore.setState(pipelineStore.getInitialState(), true);
  playbackStore.setState(playbackStore.getInitialState(), true);
});

describe('followPipelineEdits', () => {
  it('jumps to the full result when the pipeline is edited', () => {
    const stop = followPipelineEdits(pipelineStore, playbackStore);
    playbackStore.getState().scrubTo(1);
    pipelineStore.getState().addBlock('rotate');
    expect(playbackStore.getState().playhead).toBeNull();
    stop();
  });

  it('leaves the playhead alone when nothing is edited', () => {
    const stop = followPipelineEdits(pipelineStore, playbackStore);
    playbackStore.getState().scrubTo(1);
    expect(playbackStore.getState().playhead).toBe(1);
    stop();
  });

  it('stops following once unsubscribed', () => {
    const stop = followPipelineEdits(pipelineStore, playbackStore);
    stop();
    playbackStore.getState().scrubTo(1);
    pipelineStore.getState().addBlock('rotate');
    expect(playbackStore.getState().playhead).toBe(1);
  });
});