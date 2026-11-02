import type { Matrix4 } from 'three';
import { EPSILON } from '../math/matrix';
import { rotate, scale, translate } from './operations';
import type { Operation, Pipeline } from './types';

export type InverseResult =
  | { ok: true; matrix: Matrix4 }
  | { ok: false; reason: 'singular' };

export function invertMatrix(m: Matrix4): InverseResult {
  if (Math.abs(m.determinant()) < EPSILON) {
    return { ok: false, reason: 'singular' };
  }
  return { ok: true, matrix: m.clone().invert() };
}

export function invertOp(op: Operation): Operation | null {
  switch (op.kind) {
    case 'translate': {
      const [x, y, z] = op.offset;
      return translate(-x, -y, -z);
    }
    case 'rotate':
      return rotate(op.axis, -op.angleDeg);
    case 'scale': {
      const [x, y, z] = op.factors;
      if ([x, y, z].some((f) => Math.abs(f) < EPSILON)) return null;
      return scale(1 / x, 1 / y, 1 / z);
    }
  }
}

const isOperation = (op: Operation | null): op is Operation => op !== null;

export function invertPipeline(pipeline: Pipeline): Pipeline | null {
  const inverted = [...pipeline].reverse().map(invertOp);
  if (!inverted.every(isOperation)) return null;
  return inverted;
}