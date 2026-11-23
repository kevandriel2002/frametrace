import { Matrix4 } from 'three';
import { toRadians } from '../math/angles';
import type { Axis, Operation, RotateOp, ScaleOp, TranslateOp, Vec3 } from './types';

export const translate = (x: number, y: number, z: number): TranslateOp => ({
  kind: 'translate',
  offset: [x, y, z],
});

const ORIGIN: Vec3 = [0, 0, 0];

export const rotate = (axis: Axis, angleDeg: number, pivot: Vec3 = ORIGIN): RotateOp => ({
  kind: 'rotate',
  axis,
  angleDeg,
  pivot,
});

export const scale = (x: number, y: number, z: number, pivot: Vec3 = ORIGIN): ScaleOp => ({
  kind: 'scale',
  factors: [x, y, z],
  pivot,
});

export function aboutPivot(m: Matrix4, [px, py, pz]: Vec3): Matrix4 {
  if (px === 0 && py === 0 && pz === 0) return m;
  return translationMatrix([px, py, pz]).multiply(m).multiply(translationMatrix([-px, -py, -pz]));
}

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
      return aboutPivot(rotationMatrix(op.axis, op.angleDeg), op.pivot);
    case 'scale':
      return aboutPivot(scaleMatrix(op.factors), op.pivot);
  }
}