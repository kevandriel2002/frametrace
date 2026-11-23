import { Matrix4 } from 'three';
import { opToMatrix, translate } from './operations';
import type { Operation, Pipeline } from './types';

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

const lerp = (from: number, to: number, fraction: number): number => from + (to - from) * fraction;

export type FrameMode = 'world' | 'local';

// Returns partially completed operation
export function partialOperation(op: Operation, fraction: number): Operation {
  const f = clamp01(fraction);
  switch (op.kind) {
    case 'translate': {
      const [x, y, z] = op.offset;
      return translate(x * f, y * f, z * f);
    }
    case 'rotate':
      return { ...op, angleDeg: op.angleDeg * f };
    case 'scale': {
      const [x, y, z] = op.factors;
      return { ...op, factors: [lerp(1, x, f), lerp(1, y, f), lerp(1, z, f)] };
    }
  }
}

// How far through the step index playhead is
export function stepProgress(playhead: number, index: number): number {
  return clamp01(playhead - index);
}

// Turns stored playhead into real position
export function effectivePlayhead(playhead: number | null, stepCount: number): number {
  if (playhead === null) return stepCount;
  return Math.min(Math.max(playhead, 0), stepCount);
}

// composePipeline with partial steps
export function composeAt(pipeline: Pipeline, playhead: number, mode: FrameMode = 'world'): Matrix4 {
  const result = new Matrix4();
  const ordered = mode === 'world' ? pipeline : [...pipeline].reverse();

  ordered.forEach((op, position) => {
    const progress = stepProgress(playhead, position);
    if (progress <= 0) return;
    const step = opToMatrix(partialOperation(op, progress));
    if (mode === 'world') result.premultiply(step);
    else result.multiply(step);
  });

  return result;
}

export function blockProgress(
  playhead: number,
  index: number,
  count: number,
  mode: FrameMode,
): number {
  const position = mode === 'world' ? index : count - 1 - index;
  return stepProgress(playhead, position);
}