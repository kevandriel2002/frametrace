import { describe, expect, it } from 'vitest';
import { HIGHLIGHTED_VERTEX, MODEL_KINDS, MODEL_VERTICES } from './models';

describe('model data', () => {
  it('gives the cube the eight distinct corners of the unit cube', () => {
    const corners = MODEL_VERTICES.cube;
    expect(new Set(corners.map((p) => p.join(','))).size).toBe(8);
    expect(corners.every((p) => p.every((v) => v === 0 || v === 1))).toBe(true);
  });

  it('highlights a real vertex for every labelled model', () => {
    for (const kind of MODEL_KINDS) {
      const index = HIGHLIGHTED_VERTEX[kind];
      if (index === null) expect(MODEL_VERTICES[kind]).toHaveLength(0);
      else expect(MODEL_VERTICES[kind][index]).toBeDefined();
    }
  });

  it('highlights the far corner of the cube', () => {
    expect(MODEL_VERTICES.cube[HIGHLIGHTED_VERTEX.cube ?? -1]).toEqual([1, 1, 1]);
  });
});