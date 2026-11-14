import { describe, expect, it } from 'vitest';
import { matricesEqual } from '../math/matrix';
import { composePipeline } from './compose';
import { invertPipeline } from './inverse';
import { rotate, scale, translate } from './operations';
import { composeAt } from './playhead';

const pipeline = [translate(1, 2, 3), rotate('y', 40), scale(2, 0.5, 3)];

describe('Rewind', () => {
  it.each([0.25, 0.5, 1, 1.5, 2.2, 3])(
    'rewinding %s steps equals applying that much of the inverse pipeline',
    (rewound) => {
      const inverse = invertPipeline(pipeline);
      if (!inverse) throw new Error('expected an invertible pipeline');

      const playedBackwards = composeAt(pipeline, pipeline.length - rewound);
      const inverseApplied = composeAt(inverse, rewound).multiply(composePipeline(pipeline));

      expect(matricesEqual(playedBackwards, inverseApplied)).toBe(true);
    },
  );
});