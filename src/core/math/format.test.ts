import { describe, expect, it } from 'vitest';
import { formatNumber } from './format';

describe('formatNumber', () => {
  it('rounds to 3 decimal places and drops trailing zeros', () => {
    expect(formatNumber(Math.SQRT1_2)).toBe('0.707');
    expect(formatNumber(1.5)).toBe('1.5');
    expect(formatNumber(2)).toBe('2');
  });

  it('never shows floating-point noise or -0', () => {
    expect(formatNumber(Math.cos(Math.PI / 2))).toBe('0');
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(-0.0004)).toBe('0');
  });

  it('keeps real negative values', () => {
    expect(formatNumber(-1.25)).toBe('-1.25');
  });
});