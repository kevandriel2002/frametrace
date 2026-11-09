// Shows pipeline edit functions
import { useStore } from 'zustand';
import { pipelineStore, type OperationKind } from '../store/pipelineStore';
import { BlockCard } from './BlockCard';

const ADD_BUTTONS: { kind: OperationKind; label: string }[] = [
  { kind: 'translate', label: '+ Translate' },
  { kind: 'rotate', label: '+ Rotate' },
  { kind: 'scale', label: '+ Scale' },
];

export function PipelinePanel() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const canUndo = useStore(pipelineStore, (s) => s.past.length > 0);
  const canRedo = useStore(pipelineStore, (s) => s.future.length > 0);
  const { addBlock, undo, redo } = pipelineStore.getState();

  return (
    <aside className="panel">
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

      <div className="row">
        {ADD_BUTTONS.map(({ kind, label }) => (
          <button key={kind} type="button" onClick={() => addBlock(kind)}>
            {label}
          </button>
        ))}
      </div>

      <p className="hint">Steps run from top to bottom.</p>

      {blocks.length === 0 ? (
        <p className="empty">No steps yet. The house is untransformed (identity).</p>
      ) : (
        <ol className="block-list">
          {blocks.map((block, index) => (
            <BlockCard key={block.id} block={block} index={index} />
          ))}
        </ol>
      )}
    </aside>
  );
}