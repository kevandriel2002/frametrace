import { Matrix4 } from 'three';
import { describe, expect, it } from 'vitest';
import { opToMatrix, rotate, scale, translate } from '../pipeline/operations';
import { cell } from './matrix';
import { cellZone } from './zones';

const ALL = [0, 1, 2, 3];
const sampleOps = [
  translate(2, -3, 4),
  rotate('x', 37),
  rotate('y', 37),
  rotate('z', 37),
  scale(2, -1, 0.5),
  rotate('x', 37, [1, 2, 3]),
  scale(2, -1, 0.5, [1, 1, 1]),
];

function zonedCells(op: Parameters<typeof cellZone>[2], zone: string): string[] {
  return ALL.flatMap((r) => ALL.filter((c) => cellZone(r, c, op) === zone).map((c) => `${r},${c}`));
}

describe('cellZone', () => {
  it('marks the bottom row as homogeneous in every matrix', () => {
    for (const op of [...sampleOps, null]) {
      expect(zonedCells(op, 'homogeneous')).toEqual(['3,0', '3,1', '3,2', '3,3']);
    }
  });

  it('marks the fourth column as translation for a translate step and a product', () => {
    const column = ['0,3', '1,3', '2,3'];
    expect(zonedCells(translate(1, 2, 3), 'translation')).toEqual(column);
    expect(zonedCells(null, 'translation')).toEqual(column);
  });

  it('marks only the 2×2 plane of a rotation', () => {
    expect(zonedCells(rotate('z', 45), 'rotation')).toEqual(['0,0', '0,1', '1,0', '1,1']);
    expect(zonedCells(rotate('x', 45), 'rotation')).toEqual(['1,1', '1,2', '2,1', '2,2']);
    expect(zonedCells(rotate('y', 45), 'rotation')).toEqual(['0,0', '0,2', '2,0', '2,2']);
  });

  it('marks only the diagonal of a scale', () => {
    expect(zonedCells(scale(2, 3, 4), 'scale')).toEqual(['0,0', '1,1', '2,2']);
  });

  it('marks the whole 3×3 of a product as combined', () => {
    expect(zonedCells(null, 'linear')).toHaveLength(9);
  });

  it.each(sampleOps)('never fades a cell that the $kind step actually changes', (op) => {
    const m = opToMatrix(op);
    const identity = new Matrix4();
    for (const r of ALL) {
      for (const c of ALL) {
        if (cellZone(r, c, op) === 'none') {
          expect(cell(m, r, c)).toBeCloseTo(cell(identity, r, c), 9);
        }
      }
    }
  });

  it('marks the fourth column as translation for a step about another point', () => {
    expect(zonedCells(rotate('z', 90, [1, 0, 0]), 'translation')).toEqual(['0,3', '1,3', '2,3']);
    expect(zonedCells(scale(2, 2, 2, [1, 1, 1]), 'translation')).toEqual(['0,3', '1,3', '2,3']);
  });
});