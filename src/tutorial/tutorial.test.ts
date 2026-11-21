import { beforeEach, describe, expect, it } from 'vitest';
import { rotate, translate } from '../core/pipeline/operations';
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { startTutorialController } from './controller';
import { LESSON } from './lesson';
import { tutorialStore } from './tutorialStore';

const tour = () => tutorialStore.getState();
const currentId = () => LESSON.at(tour().stepIndex)?.id;

beforeEach(() => {
  pipelineStore.setState(pipelineStore.getInitialState(), true);
  playbackStore.setState(playbackStore.getInitialState(), true);
  viewStore.setState(viewStore.getInitialState(), true);
  tutorialStore.setState(tutorialStore.getInitialState(), true);
});

describe('lesson data', () => {
  it('gives every step a unique id', () => {
    const ids = LESSON.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('tutorial', () => {
  it('does nothing until it is started', () => {
    const stop = startTutorialController();
    pipelineStore.getState().setPipeline([]);
    expect(tour().active).toBe(false);
    expect(tour().stepIndex).toBe(0);
    stop();
  });

  it('can be completed from start to finish by using the app', () => {
    const stop = startTutorialController();
    tour().start();
    tour().next();
    tour().next();
    expect(currentId()).toBe('clear');

    pipelineStore.getState().setPipeline([]);
    expect(currentId()).toBe('translate');

    pipelineStore.getState().setPipeline([translate(3, 0, 0)]);
    expect(currentId()).toBe('rotate');

    pipelineStore.getState().setPipeline([translate(3, 0, 0), rotate('y', 90)]);
    expect(currentId()).toBe('swap');

    pipelineStore.getState().setPipeline([rotate('y', 90), translate(3, 0, 0)]);
    expect(currentId()).toBe('timeline');

    playbackStore.getState().scrubTo(1);
    expect(currentId()).toBe('local');

    playbackStore.getState().setMode('local');
    expect(currentId()).toBe('rewind');

    playbackStore.getState().rewind(2);
    playbackStore.getState().advance(5, 2);
    expect(currentId()).toBe('inspector');

    tour().next();
    expect(currentId()).toBe('cube');

    viewStore.getState().setModel('cube');
    expect(currentId()).toBe('finish');

    tour().next();
    expect(tour().active).toBe(false);
    stop();
  });

  it('skips a step that is already done', () => {
    pipelineStore.getState().setPipeline([]);
    const stop = startTutorialController();
    tour().start();
    tour().next();
    tour().next();
    expect(currentId()).toBe('translate');
    stop();
  });

  it('does not advance on the wrong action', () => {
    const stop = startTutorialController();
    tour().start();
    tour().next();
    tour().next();
    pipelineStore.getState().setPipeline([]);
    pipelineStore.getState().setPipeline([translate(2, 0, 0)]);
    expect(currentId()).toBe('translate');
    stop();
  });
});