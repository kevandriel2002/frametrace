import { createStore } from 'zustand/vanilla';
import { rotate, scale, translate } from '../core/pipeline/operations';
import type { Operation, Pipeline } from '../core/pipeline/types';

export type OperationKind = Operation['kind'];

export type Block = {
  readonly id: string;
  readonly op: Operation;
};

export type Blocks = readonly Block[];

export const HISTORY_LIMIT = 100;

export const DEMO_PIPELINE: Pipeline = [scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)];

// Newly added step starts as
const NEW_OPERATIONS: Record<OperationKind, Operation> = {
  translate: translate(0, 0, 0),
  rotate: rotate('y', 0),
  scale: scale(1, 1, 1),
};

let nextId = 1;

// Gives each block an id from a counter ex: block-1, block-2
export function createBlock(op: Operation): Block {
  return { id: `block-${nextId++}`, op };
}

// Turns blocks into a plain list of operations
export function toPipeline(blocks: Blocks): Pipeline {
  return blocks.map((block) => block.op);
}

export type PipelineState = {
  blocks: Blocks;
  // List of earlier versions of blocks
  past: readonly Blocks[];
  // Versions that have been undone
  future: readonly Blocks[];
  editStart: Blocks | null;

  addBlock: (kind: OperationKind) => void;
  removeBlock: (id: string) => void;
  replaceBlock: (id: string, op: Operation) => void;
  setPipeline: (pipeline: Pipeline) => void;

  // Runs when a field is clicked into
  beginEdit: () => void;
  // Runs on every key stroke
  editBlock: (id: string, op: Operation) => void;
  //  Runs when a field is exited
  endEdit: () => void;

  undo: () => void;
  redo: () => void;
};

function replaceOp(blocks: Blocks, id: string, op: Operation): Blocks {
  return blocks.map((block) => (block.id === id ? { ...block, op } : block));
}

// Saves current blocks into past, sets new block and clears future
function withHistory(state: PipelineState, blocks: Blocks): Partial<PipelineState> {
  const before = state.editStart ?? state.blocks;
  return {
    blocks,
    // .slice(-HISTORY_LIMIT) keeps only the last 100 snapshots
    past: [...state.past, before].slice(-HISTORY_LIMIT), 
    future: [],
    editStart: null,
  };
}

export const pipelineStore = createStore<PipelineState>()((set) => ({
  blocks: DEMO_PIPELINE.map(createBlock),
  past: [],
  future: [],
  editStart: null,

  addBlock: (kind) =>
    set((s) => withHistory(s, [...s.blocks, createBlock(NEW_OPERATIONS[kind])])),

  removeBlock: (id) =>
    set((s) => withHistory(s, s.blocks.filter((block) => block.id !== id))),

  replaceBlock: (id, op) =>
    set((s) => withHistory(s, replaceOp(s.blocks, id, op))),

  setPipeline: (pipeline) =>
    set((s) => withHistory(s, pipeline.map(createBlock))),

  beginEdit: () =>
    set((s) => (s.editStart ? s : { editStart: s.blocks })),

  editBlock: (id, op) =>
    set((s) => ({ blocks: replaceOp(s.blocks, id, op) })),

  endEdit: () =>
    set((s) => {
      if (!s.editStart) return s;
      if (s.editStart === s.blocks) return { editStart: null };
      return withHistory(s, s.blocks);
    }),

  undo: () =>
    set((s) => {
      const previous = s.past.at(-1);
      // If there's nothign to undo, the function returns the same state object
      if (!previous) return s;
      return {
        blocks: previous,
        past: s.past.slice(0, -1),
        future: [s.blocks, ...s.future],
        editStart: null,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        blocks: next,
        past: [...s.past, s.blocks].slice(-HISTORY_LIMIT),
        future: s.future.slice(1),
        editStart: null,
      };
    }),
}));