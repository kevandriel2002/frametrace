import { describe, expect, it } from 'vitest';
import { rotationMatrix } from '../pipeline/operations';
import type { Axis } from '../pipeline/types';
import { exactCosSin, exactRotationRows } from './exact';
import { toRows } from './matrix';

function evaluate(text: string): number {
  const sign = text.startsWith('-') ? -1 : 1;
  const [top = '', bottom = '1'] = text.replace('-', '').split('/');
  const numerator = top.startsWith('√') ? Math.sqrt(Number(top.slice(1))) : Number(top);
  return (sign * numerator) / Number(bottom);
}

const AXES: Axis[] = ['x', 'y', 'z'];
const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, -45, 405];

describe('exact rotation values', () => {
  it('match the numeric rotation matrix for every special angle and axis', () => {
    for (const axis of AXES) {
      for (const angle of SPECIAL) {
        const exact = exactRotationRows(axis, angle);
        if (!exact) throw new Error(`expected an exact form for ${angle}°`);
        const numeric = toRows(rotationMatrix(axis, angle));
        exact.forEach((row, r) =>
          row.forEach((text, c) => expect(evaluate(text)).toBeCloseTo(numeric[r]?.[c] ?? NaN, 9)),
        );
      }
    }
  });

  it('has no exact form for other angles', () => {
    expect(exactCosSin(37)).toBeNull();
    expect(exactCosSin(22.5)).toBeNull();
  });

  it('wraps angles outside one turn', () => {
    expect(exactCosSin(405)).toEqual(exactCosSin(45));
    expect(exactCosSin(-45)).toEqual(exactCosSin(315));
  });
});