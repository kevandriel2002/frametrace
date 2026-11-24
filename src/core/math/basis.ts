// Transforms four points [object origin, ends of three axes] and returns where they land.
import type { Matrix4 } from 'three';
import type { Vec3 } from '../pipeline/types';
import { transformPoints } from './points';

export type AxisTips = { origin: Vec3; tips: Vec3[] };

export function localAxisTips(matrix: Matrix4, length: number): AxisTips {
  const [origin = [0, 0, 0], ...tips] = transformPoints(matrix, [
    [0, 0, 0],
    [length, 0, 0],
    [0, length, 0],
    [0, 0, length],
  ]);
  return { origin, tips };
}