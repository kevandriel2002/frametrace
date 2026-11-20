import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { MODEL_VERTICES } from '../models';
import { composePipeline } from '../pipeline/compose';
import { rotate, scale, translate } from '../pipeline/operations';
import { formatPoint } from './format';
import { transformPoints } from './points';

const demo = composePipeline([scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)]);

describe('transformPoints', () => {
  it('leaves points unchanged under the identity', () => {
    expect(transformPoints(new Matrix4(), MODEL_VERTICES.cube)).toEqual(MODEL_VERTICES.cube);
  });

  it('matches Three.js for every cube corner', () => {
    const moved = transformPoints(demo, MODEL_VERTICES.cube);
    MODEL_VERTICES.cube.forEach(([x, y, z], i) => {
      const expected = new Vector3(x, y, z).applyMatrix4(demo);
      expect(moved[i]?.[0]).toBeCloseTo(expected.x, 9);
      expect(moved[i]?.[1]).toBeCloseTo(expected.y, 9);
      expect(moved[i]?.[2]).toBeCloseTo(expected.z, 9);
    });
  });

  it('moves the far corner of the cube where the maths says', () => {
    const [corner] = transformPoints(demo, [[1, 1, 1]]);
    if (!corner) throw new Error('expected a point');
    expect(formatPoint(corner)).toBe('(4.414, 1.5, 0)');
  });
});

describe('formatPoint', () => {
  it('cleans noise and -0', () => {
    expect(formatPoint([-0, 1e-17, 2.5])).toBe('(0, 0, 2.5)');
  });
});