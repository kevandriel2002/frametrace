import { Matrix4 } from 'three';
import { describe, expect, it } from 'vitest';
import { cell, clean, isIdentity, matricesEqual, toRows } from './matrix';

// Verifies storage convention
describe('cell and storage order', () => {
  it('reads by (row, column) while Three.js stores column-major', () => {
    const m = new Matrix4().makeTranslation(2, 3, 4);
    expect(cell(m, 0, 3)).toBe(2);
    expect(cell(m, 1, 3)).toBe(3);
    expect(cell(m, 2, 3)).toBe(4);
    expect(m.elements[12]).toBe(2);
  });

  it('toRows returns the matrix as written on paper', () => {
    // prettier-ignore
    const m = new Matrix4().set(
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    );
    expect(toRows(m)[0]).toEqual([1, 2, 3, 4]);
    expect(toRows(m)[3]).toEqual([13, 14, 15, 16]);
  });
});

// Checks that set() takes values in on-paper order and returns the same
describe('clean', () => {
  it('turns floating-point noise into 0', () => {
    expect(clean(Math.cos(Math.PI / 2))).toBe(0);
  });

  it('turns -0 into 0', () => {
    expect(clean(-0)).toBe(0);
  });

  it('leaves real values alone', () => {
    expect(clean(0.5)).toBe(0.5);
  });
});

// Checks both sides
describe('matricesEqual', () => {
  it('ignores differences smaller than the tolerance', () => {
    const a = new Matrix4();
    const b = new Matrix4().makeTranslation(1e-12, 0, 0);
    expect(matricesEqual(a, b)).toBe(true);
  });

  it('detects real differences', () => {
    const a = new Matrix4();
    const b = new Matrix4().makeTranslation(0.001, 0, 0);
    expect(matricesEqual(a, b)).toBe(false);
  });

  it('recognises the identity matrix', () => {
    expect(isIdentity(new Matrix4())).toBe(true);
  });
});