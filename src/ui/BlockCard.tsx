// Shows one step with its number, title and a delete button, followed by right inputs
import type { Axis, Operation } from '../core/pipeline/types';
import { pipelineStore, type Block } from '../store/pipelineStore';
import { NumberField } from './NumberField';
import { Vec3Fields } from './Vec3Fields';
import { useStore } from 'zustand';
import { effectivePlayhead, stepProgress } from '../core/pipeline/playhead';
import { playbackStore } from '../store/playbackStore';

const TITLES: Record<Operation['kind'], string> = {
  translate: 'Translate',
  rotate: 'Rotate',
  scale: 'Scale',
};

const AXES: readonly Axis[] = ['x', 'y', 'z'];

type Props = {
  block: Block;
// Shows order steps run in
  index: number;
  count: number;
};

export function BlockCard({ block, index, count }: Props) {
  const { removeBlock } = pipelineStore.getState();
  const progress = useStore(playbackStore, (s) =>
    stepProgress(effectivePlayhead(s.playhead, count), index),
  );
  const status = progress >= 1 ? 'done' : progress <= 0 ? 'pending' : 'active';

  return (
    <li className={`block block-${block.op.kind} is-${status}`}>
      <div className="block-header">
        <span className="block-index">{index + 1}</span>
        <span className="block-title">{TITLES[block.op.kind]}</span>
        <button
          type="button"
          className="icon-button"
          onClick={() => removeBlock(block.id)}
          aria-label={`Delete step ${index + 1}`}
          title="Delete step"
        >
          ✕
        </button>
      </div>
      {status === 'active' && (
        <div className="block-progress" style={{ width: `${progress * 100}%` }} />
      )}
      <BlockEditor block={block} />
    </li>
  );
}

function BlockEditor({ block }: { block: Block }) {
  const { id, op } = block;
  const { beginEdit, editBlock, endEdit, replaceBlock } = pipelineStore.getState();

  switch (op.kind) {
    case 'translate':
      return (
        <Vec3Fields
          value={op.offset}
          step={0.5}
          onChange={(offset) => editBlock(id, { ...op, offset })}
          onEditStart={beginEdit}
          onEditEnd={endEdit}
        />
      );
    case 'scale':
      return (
        <Vec3Fields
          value={op.factors}
          step={0.1}
          onChange={(factors) => editBlock(id, { ...op, factors })}
          onEditStart={beginEdit}
          onEditEnd={endEdit}
        />
      );
    case 'rotate':
      return (
        <div className="rotate-fields">
          <select
            aria-label="Rotation axis"
            value={op.axis}
            onChange={(event) => {
              const axis = AXES.find((a) => a === event.target.value);
              if (axis) replaceBlock(id, { ...op, axis });
            }}
          >
            {AXES.map((axis) => (
              <option key={axis} value={axis}>
                {axis.toUpperCase()} axis
              </option>
            ))}
          </select>
          <NumberField
            label="Angle °"
            step={15}
            value={op.angleDeg}
            onChange={(angleDeg) => editBlock(id, { ...op, angleDeg })}
            onEditStart={beginEdit}
            onEditEnd={endEdit}
          />
        </div>
      );
  }
}