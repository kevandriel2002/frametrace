import { createStore } from 'zustand/vanilla';
import { rotate, scale, translate } from '../core/pipeline/operations';
import type { Pipeline } from '../core/pipeline/types';

// Current Pipeline
export const DEMO_PIPELINE: Pipeline = [scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)];

export type PipelineState = {
  pipeline: Pipeline;
  setPipeline: (pipeline: Pipeline) => void;
};

export const pipelineStore = createStore<PipelineState>()((set) => ({
  pipeline: DEMO_PIPELINE,
  setPipeline: (pipeline) => set({ pipeline }),
}));