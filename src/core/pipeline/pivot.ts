// Returns point each step is measured from
// World: (0, 0, 0) | Local: object's own origin
import type { Matrix4 } from 'three';
import { cell } from '../math/matrix';
import type { FrameMode } from './playhead';
import type { Vec3 } from './types';

export function referencePoint(mode: FrameMode, matrix: Matrix4): Vec3 {
  if (mode === 'world') return [0, 0, 0];
  return [cell(matrix, 0, 3), cell(matrix, 1, 3), cell(matrix, 2, 3)];
}