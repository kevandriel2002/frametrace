import { describe, expect, it } from 'vitest';
import { isIdentity, matricesEqual } from '../math/matrix';
import { expectPoint, transformPoint } from '../testUtils';
import { composePipeline } from './compose';
import { opToMatrix, rotate, scale, translate } from './operations';

describe('composePipeline', () => {
  it('returns the identity for an empty pipeline', () => {
    expect(isIdentity(composePipeline([]))).toBe(true);
  });

  it('a single step equals that step’s own matrix', () => {
    const op = rotate('x', 30);
    expect(matricesEqual(composePipeline([op]), opToMatrix(op))).toBe(true);
  });

  it('composes [A, B, C] as C · B · A', () => {
    const a = translate(1, 2, 3);
    const b = rotate('x', 30);
    const c = scale(2, 2, 2);
    const expected = opToMatrix(c).multiply(opToMatrix(b)).multiply(opToMatrix(a));
    expect(matricesEqual(composePipeline([a, b, c]), expected)).toBe(true);
  });

  it('applies steps in listed order: translate then rotate', () => {
    const m = composePipeline([translate(2, 0, 0), rotate('z', 90)]);
    expectPoint(transformPoint(m, 1, 0, 0), 0, 3, 0);
  });

  it('is non-commutative: translate-then-rotate differs from rotate-then-translate', () => {
    const tr = composePipeline([translate(2, 0, 0), rotate('z', 90)]);
    const rt = composePipeline([rotate('z', 90), translate(2, 0, 0)]);
    expect(matricesEqual(tr, rt)).toBe(false);
    expectPoint(transformPoint(rt, 1, 0, 0), 2, 1, 0);
  });

  it('scaling after translating also scales the displacement', () => {
    const m = composePipeline([translate(1, 0, 0), scale(2, 2, 2)]);
    expectPoint(transformPoint(m, 0, 0, 0), 2, 0, 0);
  });
});