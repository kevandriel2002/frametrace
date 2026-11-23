import { describe, expect, it } from 'vitest';
import { transformPoints } from '../math/points';
import { MODEL_CENTRES } from '../models';
import { rotate, translate } from './operations';
import { describePivot, pivotAt } from './pivot';
import { composeAt } from './playhead';
import type { Vec3 } from './types';

const centre = MODEL_CENTRES.cube;

function expectNear(actual: Vec3, expected: Vec3): void {
  actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i] ?? NaN, 9));
}

describe('pivotAt', () => {
  it('reports no step before anything is applied', () => {
    expect(pivotAt([rotate('y', 90)], 0, 'world').stepIndex).toBeNull();
  });

  it('shows a world-reading pivot exactly where it was entered', () => {
    const pipeline = [translate(3, 0, 0), rotate('y', 90, [3.5, 0.5, 0.5])];
    const info = pivotAt(pipeline, 1.5, 'world');
    expect(info.stepIndex).toBe(1);
    expectNear(info.world, [3.5, 0.5, 0.5]);
  });

  it('keeps the object’s centre still when it turns about it (world reading)', () => {
    const pipeline = [translate(3, 0, 0), rotate('y', 90, [3.5, 0.5, 0.5])];
    for (const t of [1, 1.5, 2]) {
      const [moved] = transformPoints(composeAt(pipeline, t, 'world'), [centre]);
      if (!moved) throw new Error('expected a point');
      expectNear(moved, [3.5, 0.5, 0.5]);
    }
  });

  it('carries a local-reading pivot along with the object', () => {
    const pipeline = [rotate('y', 90, centre), translate(3, 0, 0)];
    const info = pivotAt(pipeline, 1.5, 'local');
    expect(info.stepIndex).toBe(0);
    expectNear(info.world, [3.5, 0.5, 0.5]);
  });

  it('turns the object in place about its own centre (local reading)', () => {
    const pipeline = [rotate('y', 90, centre), translate(3, 0, 0)];
    for (const t of [1, 1.5, 2]) {
      const [moved] = transformPoints(composeAt(pipeline, t, 'local'), [centre]);
      if (!moved) throw new Error('expected a point');
      expectNear(moved, [3.5, 0.5, 0.5]);
    }
  });

  it('still ends in the same place in both readings', () => {
    const pipeline = [translate(3, 0, 0), rotate('y', 90, centre)];
    const world = composeAt(pipeline, 2, 'world');
    const local = composeAt(pipeline, 2, 'local');
    world.elements.forEach((v, i) => expect(v).toBeCloseTo(local.elements[i] ?? NaN, 9));
  });
});

describe('describePivot', () => {
  it('names the step, the point and the coordinates it is in', () => {
    const pipeline = [rotate('y', 90, centre)];
    expect(describePivot(pivotAt(pipeline, 1, 'world'), 'world')).toBe(
      'Step 1 turns about (0.5, 0.5, 0.5) in world coordinates',
    );
    expect(describePivot(pivotAt(pipeline, 1, 'local'), 'local')).toBe(
      'Step 1 turns about (0.5, 0.5, 0.5) in the object’s coordinates',
    );
  });

  it('says a translation moves along the axes', () => {
    expect(describePivot(pivotAt([translate(1, 0, 0)], 1, 'local'), 'local')).toBe(
      'Step 1 moves along the object’s own axes',
    );
  });
});