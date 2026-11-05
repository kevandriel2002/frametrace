import { Vector3, type Matrix4 } from 'three';
import { expect } from 'vitest';

// Applies matrix to a point
export function transformPoint(m: Matrix4, x: number, y: number, z: number): Vector3 {
  return new Vector3(x, y, z).applyMatrix4(m);
}

// Checks that point landed where it should
export function expectPoint(actual: Vector3, x: number, y: number, z: number): void {
  expect(actual.x).toBeCloseTo(x, 9);
  expect(actual.y).toBeCloseTo(y, 9);
  expect(actual.z).toBeCloseTo(z, 9);
}