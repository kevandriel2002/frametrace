import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rotate, translate } from '../core/pipeline/operations';
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { SETTLE_MS, startTutorialController } from './controller';
import { LESSON } from './lesson';
import { tutorialStore } from './tutorialStore';

const tour = () => tutorialStore.getState();
const currentId = () => LESSON.at(tour().stepIndex)?.id;
const settle = () => vi.advanceTimersByTime(SETTLE_MS);
const indexOf = (id: string) => LESSON.findIndex((step) => step.id === id);

let stop: () => void;

beforeEach(() => {
  vi.useFakeTimers();
  pipelineStore.setState(pipelineStore.getInitialState(), true);
  playbackStore.setState(playbackStore.getInitialState(), true);
  viewStore.setState(viewStore.getInitialState(), true);
  tutorialStore.setState(tutorialStore.getInitialState(), true);
  stop = startTutorialController();
});

afterEach(() => {
  stop();
  vi.useRealTimers();
});

describe('lesson data', () => {
  it('gives every step a unique id', () => {
    const ids = LESSON.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('tutorial', () => {
  it('can be completed from start to finish by using the app', () => {
    tour().start();
    tour().next();
    tour().next();
    expect(currentId()).toBe('clear');

    pipelineStore.getState().setPipeline([]);
    expect(tour().completed).toBe(true);
    expect(currentId()).toBe('clear');
    settle();
    expect(currentId()).toBe('translate');

    pipelineStore.getState().setPipeline([translate(3, 0, 0)]);
    settle();
    expect(currentId()).toBe('rotate');

    pipelineStore.getState().setPipeline([translate(3, 0, 0), rotate('y', 90)]);
    settle();
    expect(currentId()).toBe('swap');

    pipelineStore.getState().setPipeline([rotate('y', 90), translate(3, 0, 0)]);
    settle();
    expect(currentId()).toBe('timeline');

    playbackStore.getState().scrubTo(1);
    settle();
    expect(currentId()).toBe('frames');

    tour().next();
    expect(currentId()).toBe('local');

    playbackStore.getState().setMode('local');
    settle();
    expect(currentId()).toBe('local');
    playbackStore.getState().play(2);
    playbackStore.getState().advance(5, 2);
    settle();
    expect(currentId()).toBe('rewind');

    playbackStore.getState().rewind(2);
    playbackStore.getState().advance(5, 2);
    settle();
    expect(currentId()).toBe('inspector');
    expect(playbackStore.getState().playhead).toBeNull();

    tour().next();
    expect(currentId()).toBe('cube');

    viewStore.getState().setModel('cube');
    settle();
    expect(currentId()).toBe('pivot');

    pipelineStore.getState().setPipeline([rotate('y', 90, [0.5, 0.5, 0.5]), translate(3, 0, 0)]);
    settle();
    expect(currentId()).toBe('finish');

    tour().next();
    expect(tour().active).toBe(false);
  });

  it('waits for playback to finish before moving on', () => {
    tour().start();
    tutorialStore.setState({ stepIndex: indexOf('timeline'), completed: false });
    playbackStore.getState().play(2);
    expect(tour().completed).toBe(true);
    settle();
    expect(currentId()).toBe('timeline');
    playbackStore.getState().advance(5, 2);
    settle();
    expect(currentId()).toBe('frames');
  });

  it('does not bounce forward after going Back', () => {
    pipelineStore.getState().setPipeline([]);
    tour().start();
    tour().next();
    tour().next();
    settle();
    expect(currentId()).toBe('translate');
    tour().back();
    settle();
    expect(currentId()).toBe('clear');
    expect(tour().completed).toBe(true);
  });

  it('does not count actions while minimised', () => {
    tour().start();
    tour().next();
    tour().next();
    tour().minimise();
    pipelineStore.getState().setPipeline([]);
    settle();
    expect(currentId()).toBe('clear');
    expect(tour().completed).toBe(false);
    tour().restore();
    settle();
    expect(currentId()).toBe('translate');
  });

  it('resumes from the step where it was closed', () => {
    tour().start();
    tour().next();
    tour().next();
    tour().close();
    expect(tour().savedStep).toBe(indexOf('clear'));
    tour().resume();
    expect(tour().active).toBe(true);
    expect(currentId()).toBe('clear');
  });

  it('does not advance on the wrong action', () => {
    tour().start();
    tour().next();
    tour().next();
    pipelineStore.getState().setPipeline([]);
    settle();
    pipelineStore.getState().setPipeline([translate(2, 0, 0)]);
    settle();
    expect(currentId()).toBe('translate');
  });
});