// Returns data about transformation process at time t
import type { Matrix4 } from 'three';
import { opToMatrix } from './operations';
import { composeAt, partialOperation, stepProgress, type FrameMode } from './playhead';
import type { Operation, Pipeline } from './types';

export type Inspection = {
  stepIndex: number | null;
  progress: number;
  stepOp: Operation | null;
  step: Matrix4 | null;
  factors: Operation[];
  cumulative: Matrix4;
};

export function inspectAt(pipeline: Pipeline, playhead: number, mode: FrameMode): Inspection {
  const count = pipeline.length;
  const t = Math.min(Math.max(playhead, 0), count);
  const ordered = mode === 'world' ? pipeline : [...pipeline].reverse();

  const applied: Operation[] = [];
  ordered.forEach((op, position) => {
    const progress = stepProgress(t, position);
    if (progress > 0) applied.push(partialOperation(op, progress));
  });

  const position = Math.ceil(t) - 1;
  const stepOp = position >= 0 ? (applied.at(position) ?? null) : null;

  return {
    stepIndex: position < 0 ? null : mode === 'world' ? position : count - 1 - position,
    progress: position < 0 ? 0 : stepProgress(t, position),
    stepOp,
    step: stepOp ? opToMatrix(stepOp) : null,
    factors: mode === 'world' ? [...applied].reverse() : applied,
    cumulative: composeAt(pipeline, t, mode),
  };
}