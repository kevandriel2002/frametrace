import { Vector3, type Matrix4 } from 'three';
import type { Vec3 } from '../pipeline/types';

export function transformPoints(m: Matrix4, points: readonly Vec3[]): Vec3[] {
  return points.map(([x, y, z]) => {
    const p = new Vector3(x, y, z).applyMatrix4(m);
    return [p.x, p.y, p.z];
  });
}