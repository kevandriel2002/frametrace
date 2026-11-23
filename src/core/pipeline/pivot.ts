// Returns point each step is measured from
// World: (0, 0, 0) | Local: object's own origin
import { Matrix4 } from 'three';
import { formatPoint } from '../math/format';
import { transformPoints } from '../math/points';
import { composeAt, type FrameMode } from './playhead';
import type { Operation, Pipeline, Vec3 } from './types';

export type PivotInfo = {
// Which block in the list it is 
  stepIndex: number | null;
//   Translate, rotate or scale
  kind: Operation['kind'] | null;
//   The pivot as entered in the step
  local: Vec3;
//   Where the pivot is on screen
  world: Vec3;
};

export function pivotAt(pipeline: Pipeline, playhead: number, mode: FrameMode): PivotInfo {
  const count = pipeline.length;
  const t = Math.min(Math.max(playhead, 0), count);
  const position = Math.ceil(t) - 1;
  const ordered = mode === 'world' ? pipeline : [...pipeline].reverse();
  const op = position >= 0 ? ordered.at(position) : undefined;

  const local: Vec3 = op && op.kind !== 'translate' ? op.pivot : [0, 0, 0];
  const frame = mode === 'world' ? new Matrix4() : composeAt(pipeline, Math.max(position, 0), 'local');
  const [world] = transformPoints(frame, [local]);

  return {
    stepIndex: position < 0 ? null : mode === 'world' ? position : count - 1 - position,
    kind: op?.kind ?? null,
    local,
    world: world ?? local,
  };
}

// Creates frame badge sentence
export function describePivot(info: PivotInfo, mode: FrameMode): string {
  if (info.stepIndex === null || info.kind === null) return 'No step applied yet';
  const step = `Step ${info.stepIndex + 1}`;
  if (info.kind === 'translate') {
    return `${step} moves along ${mode === 'world' ? 'the world axes' : 'the object’s own axes'}`;
  }
  const verb = info.kind === 'rotate' ? 'turns' : 'scales';
  const space = mode === 'world' ? 'world coordinates' : 'the object’s coordinates';
  return `${step} ${verb} about ${formatPoint(info.local)} in ${space}`;
}