import { Matrix4 } from 'three';
import { describe, expect, it } from 'vitest';
import { isIdentity, matricesEqual } from '../math/matrix';
import { expectPoint, transformPoint } from '../testUtils';
import { composePipeline } from './compose';
import { opToMatrix, rotate, scale, translate } from './operations';
import { composeAt, effectivePlayhead, partialOperation, stepProgress } from './playhead';

const pipeline = [translate(2, 0, 0), rotate('z', 90), scale(1, 2, 1)];
const sampleOps = [translate(2, -3, 4), rotate('x', 120), scale(3, -1, 0.5)];

describe('partialOperation', () => {
  it.each(sampleOps)('is the identity at 0% for $kind', (op) => {
    expect(isIdentity(opToMatrix(partialOperation(op, 0)))).toBe(true);
  });

  it.each(sampleOps)('is the full step at 100% for $kind', (op) => {
    expect(matricesEqual(opToMatrix(partialOperation(op, 1)), opToMatrix(op))).toBe(true);
  });

  it('rotates the long way round: 270° is 135° halfway', () => {
    expect(partialOperation(rotate('y', 270), 0.5)).toEqual(rotate('y', 135));
  });

  it('scales from 1, not from 0', () => {
    expect(partialOperation(scale(3, 1, 1), 0.5)).toEqual(scale(2, 1, 1));
  });

  it('clamps fractions above 1', () => {
    expect(partialOperation(translate(2, 0, 0), 1.5)).toEqual(translate(2, 0, 0));
  });
});

describe('composeAt', () => {
  it('is the identity at the start', () => {
    expect(isIdentity(composeAt(pipeline, 0))).toBe(true);
  });

  it('equals the full composition at the end', () => {
    expect(matricesEqual(composeAt(pipeline, 3), composePipeline(pipeline))).toBe(true);
  });

  it('applies finished steps fully and the current step partly', () => {
    const halfwayThroughRotation = composeAt(pipeline, 1.5);
    expectPoint(transformPoint(halfwayThroughRotation, 1, 0, 0), 3 * Math.SQRT1_2, 3 * Math.SQRT1_2, 0);
  });

  it('keeps the object rigid halfway through a rotation, unlike averaging matrices', () => {
    const halfway = composeAt([rotate('z', 180)], 0.5);
    expectPoint(transformPoint(halfway, 1, 0, 0), 0, 1, 0);

    const start = new Matrix4();
    const end = opToMatrix(rotate('z', 180));
    const averaged = new Matrix4().fromArray(
      start.elements.map((value, i) => (value + end.elements[i]) / 2),
    );
    expect(transformPoint(averaged, 1, 0, 0).length()).toBeCloseTo(0, 9);
  });

  it('shows the full result if the playhead goes past the end', () => {
    expect(matricesEqual(composeAt(pipeline, 10), composePipeline(pipeline))).toBe(true);
  });
});

describe('stepProgress and effectivePlayhead', () => {
  it('reports each step as done, in progress or not started', () => {
    expect(stepProgress(1.25, 0)).toBe(1);
    expect(stepProgress(1.25, 1)).toBeCloseTo(0.25);
    expect(stepProgress(1.25, 2)).toBe(0);
  });

  it('treats a null playhead as the end of the pipeline', () => {
    expect(effectivePlayhead(null, 3)).toBe(3);
  });

  it('clamps the playhead to the pipeline', () => {
    expect(effectivePlayhead(5, 3)).toBe(3);
    expect(effectivePlayhead(-1, 3)).toBe(0);
  });
});