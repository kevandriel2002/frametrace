import { describe, expect, it } from 'vitest';
import { formatOperation, productExpression, readingOrder } from './describe';
import { rotate, scale, translate } from './operations';

const demo = [scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)];

describe('formatOperation', () => {
  it('uses textbook notation for each kind', () => {
    expect(formatOperation(translate(3, 0, 0))).toBe('T(3, 0, 0)');
    expect(formatOperation(rotate('y', 45))).toBe('Ry(45°)');
    expect(formatOperation(scale(1, 1.5, 1))).toBe('S(1, 1.5, 1)');
  });

  it('cleans floating-point noise and rounds', () => {
    expect(formatOperation(translate(1e-12, -0, 2))).toBe('T(0, 0, 2)');
    expect(formatOperation(scale(1 / 1.5, 1, 1))).toBe('S(0.667, 1, 1)');
  });

  it('writes a pivot only when it is not the origin', () => {
    expect(formatOperation(rotate('y', 45, [0.5, 0.5, 0.5]))).toBe('Ry(45°, about (0.5, 0.5, 0.5))');
    expect(formatOperation(scale(2, 2, 2, [1, 1, 1]))).toBe('S(2, 2, 2, about (1, 1, 1))');
    expect(formatOperation(rotate('y', 45, [0, 0, 0]))).toBe('Ry(45°)');
  });
});

describe('productExpression', () => {
  it('writes the first step as the rightmost matrix', () => {
    expect(productExpression(demo)).toBe('T(3, 0, 0) · Ry(45°) · S(1, 1.5, 1)');
  });

  it('is the identity for an empty pipeline', () => {
    expect(productExpression([])).toBe('I');
  });
});

describe('readingOrder', () => {
  it('reads right to left about the world axes', () => {
    expect(readingOrder(demo, 'world')).toBe('S(1, 1.5, 1) → Ry(45°) → T(3, 0, 0)');
  });

  it('reads left to right about the local axes', () => {
    expect(readingOrder(demo, 'local')).toBe('T(3, 0, 0) → Ry(45°) → S(1, 1.5, 1)');
  });
});