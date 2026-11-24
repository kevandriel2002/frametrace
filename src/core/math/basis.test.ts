import { describe, expect, it } from 'vitest';
import { composePipeline } from '../pipeline/compose';
import { rotate, scale, translate } from '../pipeline/operations';
import { localAxisTips } from './basis';
import { cell } from './matrix';

const demo = composePipeline([scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)]);

describe('localAxisTips', () => {
  it('starts every axis at the object’s origin', () => {
    const { origin } = localAxisTips(demo, 2);
    [3, 0, 0].forEach((expected, i) => expect(origin[i]).toBeCloseTo(expected, 9));
  });

  it('points each axis along a column of the matrix, times the length', () => {
    const { origin, tips } = localAxisTips(demo, 2);
    [0, 1, 2].forEach((col) => {
      const tip = tips[col];
      if (!tip) throw new Error('expected a tip');
      [0, 1, 2].forEach((row) => {
        expect(tip[row] - origin[row]).toBeCloseTo(2 * cell(demo, row, col), 9);
      });
    });
  });

  it('collapses an axis that is scaled to zero', () => {
    const { origin, tips } = localAxisTips(composePipeline([scale(1, 0, 1)]), 2);
    expect(tips[1]).toEqual(origin);
  });

  it('flips an axis under a reflection', () => {
    const { origin, tips } = localAxisTips(composePipeline([scale(-1, 1, 1)]), 2);
    expect((tips[0]?.[0] ?? NaN) - origin[0]).toBeCloseTo(-2, 9);
  });
});