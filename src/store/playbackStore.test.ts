import { beforeEach, describe, expect, it } from 'vitest';
import { playbackStore } from './playbackStore';
import { pipelineStore } from './pipelineStore';

const state = () => playbackStore.getState();

beforeEach(() => {
  playbackStore.setState(playbackStore.getInitialState(), true);
});

describe('playbackStore', () => {
  it('starts at the end, paused', () => {
    expect(state().playhead).toBeNull();
    expect(state().playing).toBe(false);
  });

  it('play from the end restarts at the beginning', () => {
    state().play(3);
    expect(state().playhead).toBe(0);
    expect(state().playing).toBe(true);
  });

  it('advance moves the playhead by time × speed', () => {
    state().play(3);
    state().advance(0.5, 3);
    expect(state().playhead).toBeCloseTo(0.5);
    state().setSpeed(2);
    state().advance(0.5, 3);
    expect(state().playhead).toBeCloseTo(1.5);
  });

  it('stops at the end and returns to "showing everything"', () => {
    state().play(3);
    state().advance(3.5, 3);
    expect(state().playhead).toBeNull();
    expect(state().playing).toBe(false);
  });

  it('scrubbing pauses playback', () => {
    state().play(3);
    state().scrubTo(1.2);
    expect(state().playhead).toBeCloseTo(1.2);
    expect(state().playing).toBe(false);
  });

  it('play after scrubbing continues from the scrubbed position', () => {
    state().scrubTo(1.2);
    state().play(3);
    expect(state().playhead).toBeCloseTo(1.2);
  });

  it('advance does nothing while paused', () => {
    state().scrubTo(1);
    const before = state();
    state().advance(1, 3);
    expect(state()).toBe(before);
  });
});

describe('rewind', () => {
  it('starts from the end and moves backwards', () => {
    state().rewind(3);
    expect(state().playhead).toBe(3);
    state().advance(0.5, 3);
    expect(state().playhead).toBeCloseTo(2.5);
  });

  it('stops at the identity, not at the end', () => {
    state().rewind(3);
    state().advance(5, 3);
    expect(state().playhead).toBe(0);
    expect(state().playing).toBe(false);
  });

  it('play after rewinding goes forwards again', () => {
    state().rewind(3);
    state().advance(1, 3);
    state().play(3);
    state().advance(0.5, 3);
    expect(state().playhead).toBeCloseTo(2.5);
  });

  it('never changes the pipeline or its undo history', () => {
    const blocks = pipelineStore.getState().blocks;
    const past = pipelineStore.getState().past;
    state().rewind(3);
    state().advance(5, 3);
    expect(pipelineStore.getState().blocks).toBe(blocks);
    expect(pipelineStore.getState().past).toBe(past);
  });
});

describe('mode', () => {
  it('starts in world mode and can switch to local', () => {
    expect(state().mode).toBe('world');
    state().setMode('local');
    expect(state().mode).toBe('local');
  });
});