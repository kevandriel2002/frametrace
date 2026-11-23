// Describes each object (model) as data
import type { Vec3 } from './pipeline/types';

export type ModelKind = 'house' | 'cube' | 'segment' | 'plane';

export const MODEL_KINDS: readonly ModelKind[] = ['house', 'cube', 'segment', 'plane'];

export const MODEL_LABELS: Record<ModelKind, string> = {
  house: 'House',
  cube: 'Cube',
  segment: 'Line',
  plane: 'Plane',
};

export const MODEL_VERTICES: Record<ModelKind, readonly Vec3[]> = {
  house: [],
  cube: [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ],
  segment: [
    [0, 0, 0],
    [2, 1, 0],
  ],
  plane: [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
};

export const HIGHLIGHTED_VERTEX: Record<ModelKind, number | null> = {
  house: null,
  cube: 7,
  segment: 1,
  plane: 2,
};

export const MODEL_CENTRES: Record<ModelKind, Vec3> = {
  house: [0, 1, 0],
  cube: [0.5, 0.5, 0.5],
  segment: [1, 0.5, 0],
  plane: [0.5, 0.5, 0],
};