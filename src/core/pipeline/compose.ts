import { Matrix4 } from 'three';
import { opToMatrix } from './operations';
import type { Pipeline } from './types';

export function composePipeline(pipeline: Pipeline): Matrix4 {
  const result = new Matrix4();
  for (const op of pipeline) {
    result.premultiply(opToMatrix(op));
  }
  return result;
}