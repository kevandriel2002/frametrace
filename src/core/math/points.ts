import { Vector3, type Matrix4 } from 'three';
import type { Vec3 } from '../pipeline/types';
import { EPSILON } from './matrix';

export function isOrigin(p: Vec3): boolean {
  return p.every((v) => Math.abs(v) < EPSILON);
}

export function samePoint(a: Vec3, b: Vec3): boolean {
  return a.every((v, i) => Math.abs(v - (b[i] ?? NaN)) < EPSILON);
}

export function transformPoints(m: Matrix4, points: readonly Vec3[]): Vec3[] {
  return points.map(([x, y, z]) => {
    const p = new Vector3(x, y, z).applyMatrix4(m);
    return [p.x, p.y, p.z];
  });
}