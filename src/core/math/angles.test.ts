import { describe, expect, it } from 'vitest';
import { toDegrees, toRadians } from './angles';

describe('angle conversion', () => {
  it('converts 180° to π', () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI);
  });

  it('round-trips degrees → radians → degrees', () => {
    expect(toDegrees(toRadians(37))).toBeCloseTo(37);
  });
});