// Names matrix cell given its position and step
import type { Axis, Operation } from '../pipeline/types';

export type Zone = 'rotation' | 'scale' | 'translation' | 'linear' | 'homogeneous' | 'none';

export const ZONE_LABELS: Record<Zone, string> = {
  rotation: 'Rotation',
  scale: 'Scale',
  translation: 'Translation',
  linear: 'Rotation and scale (combined)',
  homogeneous: 'Homogeneous row',
  none: 'Not changed by this step',
};

const ROTATION_PLANE: Record<Axis, readonly [number, number]> = {
  x: [1, 2],
  y: [0, 2],
  z: [0, 1],
};

export function cellZone(row: number, col: number, op: Operation | null): Zone {
  if (row === 3) return 'homogeneous';
  if (col === 3) return op === null || op.kind === 'translate' ? 'translation' : 'none';
  if (op === null) return 'linear';

  switch (op.kind) {
    case 'translate':
      return 'none';
    case 'scale':
      return row === col ? 'scale' : 'none';
    case 'rotate': {
      const [a, b] = ROTATION_PLANE[op.axis];
      return (row === a || row === b) && (col === a || col === b) ? 'rotation' : 'none';
    }
  }
}