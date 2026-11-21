import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from 'zustand';
import { pipelineStore, type OperationKind } from '../store/pipelineStore';
import { BlockCard } from './BlockCard';
import { playbackStore } from '../store/playbackStore';
import { ReadingCard } from './ReadingCard';
import { ModelPicker } from './ModelPicker';

const ADD_BUTTONS: { kind: OperationKind; label: string }[] = [
  { kind: 'translate', label: '+ Translate' },
  { kind: 'rotate', label: '+ Rotate' },
  { kind: 'scale', label: '+ Scale' },
];

export function PipelinePanel() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const canUndo = useStore(pipelineStore, (s) => s.past.length > 0);
  const canRedo = useStore(pipelineStore, (s) => s.future.length > 0);
  const mode = useStore(playbackStore, (s) => s.mode);
  const { addBlock, moveBlock, undo, redo } = pipelineStore.getState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const toIndex = blocks.findIndex((block) => block.id === over.id);
    if (toIndex !== -1) moveBlock(String(active.id), toIndex);
  }

  return (
    <aside className="panel" data-tour="pipeline">
      <ModelPicker />
      <header className="panel-header">
        <h2>Pipeline</h2>
        <div className="row">
          <button type="button" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            Undo
          </button>
          <button type="button" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            Redo
          </button>
        </div>
      </header>

      <div className="row" data-tour="add-buttons">
        {ADD_BUTTONS.map(({ kind, label }) => (
          <button key={kind} type="button" onClick={() => addBlock(kind)}>
            {label}
          </button>
        ))}
      </div>

      <p className="hint">
        {mode === 'world'
          ? 'Steps run top to bottom, each about the world axes.'
          : 'Steps run bottom to top, each about the house’s own axes.'}{' '}
        Drag ⠿ or use ↑ ↓ to reorder.
      </p>

      <ReadingCard />

      {blocks.length === 0 ? (
        <p className="empty">No steps yet. The house is untransformed (identity).</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <ol className="block-list">
              {blocks.map((block, index) => (
                <BlockCard key={block.id} block={block} index={index} count={blocks.length} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </aside>
  );
}