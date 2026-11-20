// Turns Pipeline into readable math text
import type { FrameMode } from './playhead';
import type { Operation, Pipeline } from './types';
import { formatNumber as num} from '../math/format';


// Gives short labels (ex: T(3, 0, 0))
export function formatOperation(op: Operation): string {
  switch (op.kind) {
    case 'translate':
      return `T(${op.offset.map(num).join(', ')})`;
    case 'rotate':
      return `R${op.axis}(${num(op.angleDeg)}°)`;
    case 'scale':
      return `S(${op.factors.map(num).join(', ')})`;
  }
}

// Writes matrix product
export function productExpression(pipeline: Pipeline): string {
  if (pipeline.length === 0) return 'I';
  return [...pipeline].reverse().map(formatOperation).join(' · ');
}

// Lists steps in the order they're animated in EACH mode
export function readingOrder(pipeline: Pipeline, mode: FrameMode): string {
  const ordered = mode === 'world' ? pipeline : [...pipeline].reverse();
  return ordered.map(formatOperation).join(' → ');
}