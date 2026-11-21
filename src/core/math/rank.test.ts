import { describe, expect, it } from 'vitest';
import { composePipeline } from '../pipeline/compose';
import { rotate, scale, translate } from '../pipeline/operations';
import { linearRank } from './rank';

const rankOf = (...ops: Parameters<typeof composePipeline>[0]) => linearRank(composePipeline(ops));

describe('linearRank', () => {
  it('is 3 for rotations, translations and non-zero scales', () => {
    expect(rankOf()).toBe(3);
    expect(rankOf(translate(5, -2, 1), rotate('x', 37), scale(2, 0.001, -1))).toBe(3);
  });

  it('drops by one for each zero scale factor', () => {
    expect(rankOf(scale(1, 0, 1))).toBe(2);
    expect(rankOf(scale(0, 1, 0))).toBe(1);
    expect(rankOf(scale(0, 0, 0))).toBe(0);
  });

  it('detects flattening hidden between rotations', () => {
    expect(rankOf(rotate('z', 30), scale(0, 1, 1), rotate('y', 50))).toBe(2);
  });

  it('never goes back up once a dimension is lost', () => {
    const later = [translate(1, 2, 3), rotate('x', 70), scale(5, 5, 5), rotate('z', -20)];
    for (const op of later) {
      expect(rankOf(scale(1, 0, 1), op)).toBeLessThanOrEqual(2);
    }
  });
});