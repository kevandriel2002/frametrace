import { describe, expect, it } from 'vitest';
import { isIdentity, matricesEqual } from '../math/matrix';
import { composePipeline } from './compose';
import { invertMatrix, invertPipeline } from './inverse';
import { rotate, scale, translate } from './operations';

const pipeline = [translate(1, 2, 3), rotate('y', 40), scale(2, 0.5, 3)];

describe('invertMatrix', () => {
  it('M · M⁻¹ gives the identity', () => {
    const m = composePipeline(pipeline);
    const result = invertMatrix(m);
    if (!result.ok) throw new Error('expected an invertible matrix');
    expect(isIdentity(m.clone().multiply(result.matrix))).toBe(true);
  });

  it('reports a zero scale as singular instead of returning zeros', () => {
    const result = invertMatrix(composePipeline([scale(1, 0, 1)]));
    expect(result.ok).toBe(false);
  });
});

describe('invertPipeline', () => {
  it('reverses the order and undoes each step', () => {
    const inverse = invertPipeline([translate(1, 2, 3), rotate('z', 90)]);
    expect(inverse).toEqual([rotate('z', -90), translate(-1, -2, -3)]);
  });

  it('running a pipeline and then its inverse returns to the identity', () => {
    const inverse = invertPipeline(pipeline);
    if (!inverse) throw new Error('expected an invertible pipeline');
    expect(isIdentity(composePipeline([...pipeline, ...inverse]))).toBe(true);
  });

  it('agrees with inverting the matrix directly', () => {
    const inverse = invertPipeline(pipeline);
    const direct = invertMatrix(composePipeline(pipeline));
    if (!inverse || !direct.ok) throw new Error('expected both to be invertible');
    expect(matricesEqual(composePipeline(inverse), direct.matrix)).toBe(true);
  });

  it('returns null when a step cannot be undone', () => {
    expect(invertPipeline([translate(1, 0, 0), scale(0, 1, 1)])).toBeNull();
  });

  it('undoes pivoted steps about the same pivot', () => {
    const pivoted = [rotate('z', 90, [1, 0, 0]), scale(2, 0.5, 3, [1, 1, 1]), translate(0, 2, 0)];
    const inverse = invertPipeline(pivoted);
    if (!inverse) throw new Error('expected an invertible pipeline');
    expect(isIdentity(composePipeline([...pivoted, ...inverse]))).toBe(true);
  });
});

