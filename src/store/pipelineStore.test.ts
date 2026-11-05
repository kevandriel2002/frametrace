import { beforeEach, describe, expect, it, vi } from 'vitest';
import { composePipeline } from '../core/pipeline/compose';
import { rotate, translate } from '../core/pipeline/operations';
import { expectPoint, transformPoint } from '../core/testUtils';
import { DEMO_PIPELINE, pipelineStore } from './pipelineStore';

beforeEach(() => {
  pipelineStore.setState(pipelineStore.getInitialState(), true);
});

describe('pipelineStore', () => {
  it('starts with the demo pipeline', () => {
    expect(pipelineStore.getState().pipeline).toBe(DEMO_PIPELINE);
  });

  it('setPipeline replaces the pipeline', () => {
    const next = [rotate('z', 90), translate(1, 0, 0)];
    pipelineStore.getState().setPipeline(next);
    expect(pipelineStore.getState().pipeline).toBe(next);
  });

  it('notifies subscribers once per change', () => {
    const listener = vi.fn();
    const unsubscribe = pipelineStore.subscribe(listener);
    pipelineStore.getState().setPipeline([translate(1, 0, 0)]);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = pipelineStore.subscribe(listener);
    unsubscribe();
    pipelineStore.getState().setPipeline([translate(1, 0, 0)]);
    expect(listener).not.toHaveBeenCalled();
  });

  it('leaves the previous pipeline untouched', () => {
    const before = pipelineStore.getState().pipeline;
    pipelineStore.getState().setPipeline([rotate('x', 10)]);
    expect(before).toEqual([...DEMO_PIPELINE]);
  });
});

describe('demo pipeline placement (M1)', () => {
  const m = composePipeline(DEMO_PIPELINE);

  it('moves the base of the house to x = 3', () => {
    expectPoint(transformPoint(m, 0, 0, 0), 3, 0, 0);
  });

  it('stretches the height by 1.5 without moving it sideways', () => {
    expectPoint(transformPoint(m, 0, 1.2, 0), 3, 1.8, 0);
  });

  it('turns local +X by 45° about Y towards -Z', () => {
    expectPoint(transformPoint(m, 1, 0, 0), 3 + Math.SQRT1_2, 0, -Math.SQRT1_2);
  });
});