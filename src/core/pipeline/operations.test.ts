import { Matrix4 } from 'three';
import { describe, expect, it } from 'vitest';
import { toRadians } from '../math/angles';
import { matricesEqual, toRows } from '../math/matrix';
import { expectPoint, transformPoint } from '../testUtils';
import { opToMatrix, rotate, rotationMatrix, scale, translate } from './operations';
import type { Axis } from './types';

describe('translate', () => {
  it('moves a point by the offset', () => {
    const m = opToMatrix(translate(2, 3, 4));
    expectPoint(transformPoint(m, 1, 1, 1), 3, 4, 5);
  });

  it('stores the offset in the fourth column', () => {
    const m = opToMatrix(translate(2, 3, 4));
    expect(toRows(m).map((row) => row[3])).toEqual([2, 3, 4, 1]);
  });
});

describe('scale', () => {
  it('multiplies each coordinate by its factor', () => {
    const m = opToMatrix(scale(2, 3, 4));
    expectPoint(transformPoint(m, 1, 1, 1), 2, 3, 4);
  });

  it('with a negative factor is a reflection (determinant -1)', () => {
    expect(opToMatrix(scale(-1, 1, 1)).determinant()).toBeCloseTo(-1, 9);
  });
});

describe('rotate: right-hand rule convention', () => {
  it('+90° about Z maps +X to +Y', () => {
    expectPoint(transformPoint(opToMatrix(rotate('z', 90)), 1, 0, 0), 0, 1, 0);
  });

  it('+90° about X maps +Y to +Z', () => {
    expectPoint(transformPoint(opToMatrix(rotate('x', 90)), 0, 1, 0), 0, 0, 1);
  });

  it('+90° about Y maps +Z to +X', () => {
    expectPoint(transformPoint(opToMatrix(rotate('y', 90)), 0, 0, 1), 1, 0, 0);
  });
});

describe('rotate: matrix properties', () => {
  it.each<[Axis, number]>([
    ['x', 30],
    ['y', 90],
    ['z', -135],
    ['x', 400],
  ])('about %s by %d° has determinant 1', (axis, angleDeg) => {
    expect(rotationMatrix(axis, angleDeg).determinant()).toBeCloseTo(1, 9);
  });

  it('matches the Three.js built-in rotation matrices', () => {
    const t = toRadians(37);
    expect(matricesEqual(rotationMatrix('x', 37), new Matrix4().makeRotationX(t))).toBe(true);
    expect(matricesEqual(rotationMatrix('y', 37), new Matrix4().makeRotationY(t))).toBe(true);
    expect(matricesEqual(rotationMatrix('z', 37), new Matrix4().makeRotationZ(t))).toBe(true);
  });
});