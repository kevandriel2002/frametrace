import { Matrix4 } from 'three';
import { describe, expect, it } from 'vitest';
import { isIdentity, matricesEqual } from '../math/matrix';
import { composePipeline } from './compose';
import { inspectAt } from './inspect';
import { opToMatrix, rotate, scale, translate } from './operations';
import { composeAt, type FrameMode } from './playhead';
import type { Operation } from './types';

const pipeline = [translate(2, 0, 0), rotate('z', 90), scale(1, 2, 1)];

const multiply = (factors: Operation[]): Matrix4 =>
  factors.reduce((m, op) => m.multiply(opToMatrix(op)), new Matrix4());

describe('inspectAt', () => {
  it('shows nothing applied at the start', () => {
    const view = inspectAt(pipeline, 0, 'world');
    expect(view.stepIndex).toBeNull();
    expect(view.factors).toEqual([]);
    expect(isIdentity(view.cumulative)).toBe(true);
  });

  it('shows the step in progress and its partial value', () => {
    const view = inspectAt(pipeline, 1.5, 'world');
    expect(view.stepIndex).toBe(1);
    expect(view.progress).toBeCloseTo(0.5);
    expect(view.stepOp).toEqual(rotate('z', 45));
  });

  it('shows a step that has just finished at a whole-number playhead', () => {
    const view = inspectAt(pipeline, 1, 'world');
    expect(view.stepIndex).toBe(0);
    expect(view.progress).toBe(1);
  });

  it('writes world-mode factors newest first, as they are multiplied', () => {
    expect(inspectAt(pipeline, 1.5, 'world').factors).toEqual([rotate('z', 45), translate(2, 0, 0)]);
  });

  it('starts from the last block in local mode', () => {
    const view = inspectAt(pipeline, 0.5, 'local');
    expect(view.stepIndex).toBe(2);
    expect(view.stepOp).toEqual(scale(1, 1.5, 1));
  });

  it('ends at the full product in both modes', () => {
    for (const mode of ['world', 'local'] as const) {
      expect(matricesEqual(inspectAt(pipeline, 3, mode).cumulative, composePipeline(pipeline))).toBe(true);
    }
  });

  it.each<FrameMode>(['world', 'local'])(
    'in %s mode, the written factors multiply to the shown matrix at every scrubber position',
    (mode) => {
      for (let i = 0; i <= 300; i += 7) {
        const t = i / 100;
        const view = inspectAt(pipeline, t, mode);
        expect(matricesEqual(view.cumulative, composeAt(pipeline, t, mode))).toBe(true);
        expect(matricesEqual(multiply(view.factors), view.cumulative)).toBe(true);
      }
    },
  );
});