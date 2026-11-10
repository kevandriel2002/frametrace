import { beforeEach, describe, expect, it, vi } from 'vitest';
import { composePipeline } from '../core/pipeline/compose';
import { rotate, scale, translate } from '../core/pipeline/operations';
import { expectPoint, transformPoint } from '../core/testUtils';
import {
  DEMO_PIPELINE,
  HISTORY_LIMIT,
  pipelineStore,
  toPipeline,
  type Block,
} from './pipelineStore';
import { matricesEqual } from '../core/math/matrix';

const state = () => pipelineStore.getState();

// Throws error is block is missing
function blockAt(index: number): Block {
  const block = state().blocks[index];
  if (!block) throw new Error(`No block at index ${index}`);
  return block;
}

// Resets store before every test
beforeEach(() => {
  pipelineStore.setState(pipelineStore.getInitialState(), true);
});

describe('initial state', () => {
  it('starts with the demo pipeline and no history', () => {
    expect(toPipeline(state().blocks)).toEqual(DEMO_PIPELINE);
    expect(state().past).toHaveLength(0);
    expect(state().future).toHaveLength(0);
  });

  it('gives every block a unique id', () => {
    const ids = state().blocks.map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('editing actions', () => {
  it('addBlock appends a step that does nothing yet', () => {
    state().addBlock('translate');
    state().addBlock('rotate');
    state().addBlock('scale');
    expect(toPipeline(state().blocks).slice(-3)).toEqual([
      translate(0, 0, 0),
      rotate('y', 0),
      scale(1, 1, 1),
    ]);
  });

  it('removeBlock deletes only the matching block', () => {
    const middle = blockAt(1);
    state().removeBlock(middle.id);
    expect(state().blocks).toHaveLength(DEMO_PIPELINE.length - 1);
    expect(state().blocks).not.toContain(middle);
  });

  it('replaceBlock changes one operation and leaves the rest untouched', () => {
    const first = blockAt(0);
    const second = blockAt(1);
    const third = blockAt(2);
    state().replaceBlock(second.id, rotate('x', 30));
    expect(blockAt(1)).toEqual({ id: second.id, op: rotate('x', 30) });
    expect(blockAt(0)).toBe(first);
    expect(blockAt(2)).toBe(third);
  });

  it('setPipeline replaces every block', () => {
    state().setPipeline([rotate('z', 90)]);
    expect(toPipeline(state().blocks)).toEqual([rotate('z', 90)]);
  });
});

describe('moveBlock', () => {
  it('moves a block to a new position', () => {
    const first = blockAt(0);
    state().moveBlock(first.id, 2);
    expect(blockAt(2)).toBe(first);
    expect(toPipeline(state().blocks)).toEqual([DEMO_PIPELINE[1], DEMO_PIPELINE[2], DEMO_PIPELINE[0]]);
  });

  it('can be undone', () => {
    const before = state().blocks;
    state().moveBlock(blockAt(0).id, 1);
    state().undo();
    expect(state().blocks).toBe(before);
  });

  it('ignores moves that change nothing', () => {
    const before = state().blocks;
    state().moveBlock(blockAt(0).id, 0);
    state().moveBlock(blockAt(0).id, -1);
    state().moveBlock(blockAt(2).id, 3);
    state().moveBlock('no-such-block', 1);
    expect(state().blocks).toBe(before);
    expect(state().past).toHaveLength(0);
  });

  it('changes the result, because order matters', () => {
    const before = composePipeline(toPipeline(state().blocks));
    state().moveBlock(blockAt(2).id, 0);
    const after = composePipeline(toPipeline(state().blocks));
    expect(matricesEqual(before, after)).toBe(false);
  });
});

describe('undo and redo', () => {
  it('undo restores the previous pipeline', () => {
    const before = state().blocks;
    state().addBlock('scale');
    state().undo();
    expect(state().blocks).toBe(before);
  });

  it('redo re-applies an undone change', () => {
    state().addBlock('scale');
    const after = state().blocks;
    state().undo();
    state().redo();
    expect(state().blocks).toBe(after);
  });

  it('a new change after undo clears the redo history', () => {
    state().addBlock('scale');
    state().undo();
    state().addBlock('rotate');
    expect(state().future).toHaveLength(0);
  });

  it('undo with no history changes nothing and notifies nobody', () => {
    const listener = vi.fn();
    const unsubscribe = pipelineStore.subscribe(listener);
    state().undo();
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it(`keeps at most ${HISTORY_LIMIT} undo steps`, () => {
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) state().addBlock('translate');
    expect(state().past).toHaveLength(HISTORY_LIMIT);
  });
});

describe('live edits (typing in a field)', () => {
  it('updates the pipeline immediately while typing', () => {
    const id = blockAt(0).id;
    state().beginEdit();
    state().editBlock(id, scale(1, 2, 1));
    expect(blockAt(0).op).toEqual(scale(1, 2, 1));
  });

  it('records one undo step for a whole edit, however many changes it has', () => {
    const before = state().blocks;
    const id = blockAt(0).id;
    state().beginEdit();
    state().editBlock(id, scale(1, 2, 1));
    state().editBlock(id, scale(1, 2.5, 1));
    state().editBlock(id, scale(1, 3, 1));
    state().endEdit();
    expect(state().past).toHaveLength(1);
    state().undo();
    expect(state().blocks).toBe(before);
  });

  it('records nothing if the field is left unchanged', () => {
    state().beginEdit();
    state().endEdit();
    expect(state().past).toHaveLength(0);
  });
});

describe('subscribers', () => {
  it('are notified once per action', () => {
    const listener = vi.fn();
    const unsubscribe = pipelineStore.subscribe(listener);
    state().addBlock('rotate');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe('demo pipeline placement (M1)', () => {
  const m = composePipeline(DEMO_PIPELINE);

  it('moves the base of the house to x = 3', () => {
    expectPoint(transformPoint(m, 0, 0, 0), 3, 0, 0);
  });

  it('stretches the height by 1.5 without moving it sideways', () => {
    expectPoint(transformPoint(m, 0, 1.2, 0), 3, 1.8, 0);
  });

  it('turns local +X by 45° about Y towards -Z', () => {
    expectPoint(transformPoint(m, 1, 0, 0), 3 + Math.SQRT1_2, 0, -Math.SQRT1_2);
  });
});