import { Matrix4 } from 'three';

export const EPSILON = 1e-9;

export function cell(m: Matrix4, row: number, col: number): number {
  return m.elements[col * 4 + row];
}

export function clean(value: number): number {
  return Math.abs(value) < EPSILON ? 0 : value;
}

export function toRows(m: Matrix4): number[][] {
  return [0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((col) => clean(cell(m, row, col))));
}

export function matricesEqual(a: Matrix4, b: Matrix4, tolerance = EPSILON): boolean {
  return a.elements.every((value, i) => Math.abs(value - b.elements[i]) <= tolerance);
}

export function isIdentity(m: Matrix4, tolerance = EPSILON): boolean {
  return matricesEqual(m, new Matrix4(), tolerance);
}