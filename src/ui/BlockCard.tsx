// dnd functionality
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Shows one step with its number, title and a delete button, followed by right inputs
import type { Axis, Operation } from '../core/pipeline/types';
import { pipelineStore, type Block } from '../store/pipelineStore';
import { NumberField } from './NumberField';
import { Vec3Fields } from './Vec3Fields';
import { useStore } from 'zustand';
import { effectivePlayhead, blockProgress } from '../core/pipeline/playhead';
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
  const { removeBlock, moveBlock } = pipelineStore.getState();
  // dnd functionality
  const progress = useStore(playbackStore, (s) =>
    blockProgress(effectivePlayhead(s.playhead, count), index, count, s.mode),
  );

  // dnd functionality
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id }); // Registers card with dnd-kit

  const status = progress >= 1 ? 'done' : progress <= 0 ? 'pending' : 'active';

  // dnd functionality
  const className = [
    'block',
    `block-${block.op.kind}`,
    `is-${status}`,
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const step = index + 1;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={className}
    >
      <div className="block-header">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="drag-handle"
          aria-label={`Reorder step ${step}`}
          {...attributes} // Adds accessibility attributes
          {...listeners}
        >
          ⠿
        </button>
        <span className="block-index">{step}</span>
        <span className="block-title">{TITLES[block.op.kind]}</span>
        <button
          type="button"
          className="icon-button"
          onClick={() => moveBlock(block.id, index - 1)}
          disabled={index === 0}
          aria-label={`Move step ${step} up`}
        >
          ↑
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => moveBlock(block.id, index + 1)}
          disabled={index === count - 1}
          aria-label={`Move step ${step} down`}
        >
          ↓
        </button>
        <button
          type="button"
          className="icon-button icon-button-danger"
          onClick={() => removeBlock(block.id)}
          aria-label={`Delete step ${step}`}
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