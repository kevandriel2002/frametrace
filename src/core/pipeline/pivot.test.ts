import { describe, expect, it } from 'vitest';
import { transformPoints } from '../math/points';
import { rotate, translate } from './operations';
import { referencePoint } from './pivot';
import { composeAt } from './playhead';

const orbit = [translate(3, 0, 0), rotate('y', 90)];

describe('referencePoint', () => {
  it('is always the world origin in world mode', () => {
    for (const t of [0, 1, 1.5, 2]) {
      expect(referencePoint('world', composeAt(orbit, t, 'world'))).toEqual([0, 0, 0]);
    }
  });

  it('follows the object’s origin in local mode', () => {
    const [x, y, z] = referencePoint('local', composeAt(orbit, 2, 'local'));
    expect(x).toBeCloseTo(0, 9);
    expect(y).toBeCloseTo(0, 9);
    expect(z).toBeCloseTo(-3, 9);
  });

  it('stays put while the object turns about its own origin', () => {
    const [x, y, z] = referencePoint('local', composeAt(orbit, 0.5, 'local'));
    expect([x, y, z].map((v) => Math.abs(v) < 1e-9)).toEqual([true, true, true]);
  });

  it('is exactly where the matrix sends the origin', () => {
    for (const t of [0, 0.5, 1, 1.5, 2]) {
      const m = composeAt(orbit, t, 'local');
      const [moved] = transformPoints(m, [[0, 0, 0]]);
      expect(referencePoint('local', m)).toEqual(moved);
    }
  });
});