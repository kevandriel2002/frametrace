import { Matrix4 } from 'three';
import { toRadians } from '../math/angles';
import type { Axis, Operation, RotateOp, ScaleOp, TranslateOp, Vec3 } from './types';

export const translate = (x: number, y: number, z: number): TranslateOp => ({
  kind: 'translate',
  offset: [x, y, z],
});

export const rotate = (axis: Axis, angleDeg: number): RotateOp => ({
  kind: 'rotate',
  axis,
  angleDeg,
});

export const scale = (x: number, y: number, z: number): ScaleOp => ({
  kind: 'scale',
  factors: [x, y, z],
});

export function translationMatrix([tx, ty, tz]: Vec3): Matrix4 {
  // prettier-ignore
  return new Matrix4().set(
    1, 0, 0, tx,
    0, 1, 0, ty,
    0, 0, 1, tz,
    0, 0, 0, 1,
  );
}

export function scaleMatrix([sx, sy, sz]: Vec3): Matrix4 {
  // prettier-ignore
  return new Matrix4().set(
    sx, 0,  0,  0,
    0,  sy, 0,  0,
    0,  0,  sz, 0,
    0,  0,  0,  1,
  );
}

export function rotationMatrix(axis: Axis, angleDeg: number): Matrix4 {
  const t = toRadians(angleDeg);
  const c = Math.cos(t);
  const s = Math.sin(t);
  const m = new Matrix4();

  // prettier-ignore
  switch (axis) {
    case 'x': return m.set(
      1, 0,  0, 0,
      0, c, -s, 0,
      0, s,  c, 0,
      0, 0,  0, 1,
    );
    case 'y': return m.set(
       c, 0, s, 0,
       0, 1, 0, 0,
      -s, 0, c, 0,
       0, 0, 0, 1,
    );
    case 'z': return m.set(
      c, -s, 0, 0,
      s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1,
    );
  }
}

export function opToMatrix(op: Operation): Matrix4 {
  switch (op.kind) {
    case 'translate':
      return translationMatrix(op.offset);
    case 'rotate':
      return rotationMatrix(op.axis, op.angleDeg);
    case 'scale':
      return scaleMatrix(op.factors);
  }
}