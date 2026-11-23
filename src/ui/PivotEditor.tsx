// Collapsible about section on each R&S card.
// Two presets plus free entry
import { useStore } from 'zustand';
import { formatPoint } from '../core/math/format';
import { isOrigin, samePoint } from '../core/math/points';
import { MODEL_CENTRES } from '../core/models';
import type { RotateOp, ScaleOp } from '../core/pipeline/types';
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { Vec3Fields } from './Vec3Fields';

type Props = {
  id: string;
  op: RotateOp | ScaleOp;
};

export function PivotEditor({ id, op }: Props) {
  const model = useStore(viewStore, (s) => s.model);
  const mode = useStore(playbackStore, (s) => s.mode);
  const { beginEdit, editBlock, endEdit, replaceBlock } = pipelineStore.getState();

  const centre = MODEL_CENTRES[model];
  const preset = isOrigin(op.pivot) ? 'Origin' : samePoint(op.pivot, centre) ? 'Object centre' : 'Custom point';
  const space = mode === 'world' ? 'world coordinates' : 'the object’s own coordinates';

  return (
    <details className="pivot-editor">
      <summary>
        About: {preset} {formatPoint(op.pivot)}
      </summary>
      <div className="segmented" role="group" aria-label="Pivot">
        <button
          type="button"
          aria-pressed={preset === 'Origin'}
          onClick={() => replaceBlock(id, { ...op, pivot: [0, 0, 0] })}
        >
          Origin
        </button>
        <button
          type="button"
          aria-pressed={preset === 'Object centre'}
          onClick={() => replaceBlock(id, { ...op, pivot: centre })}
        >
          Object centre
        </button>
      </div>
      <Vec3Fields
        value={op.pivot}
        step={0.5}
        onChange={(pivot) => editBlock(id, { ...op, pivot })}
        onEditStart={beginEdit}
        onEditEnd={endEdit}
      />
      <p className="pivot-hint">Read in {space}.</p>
    </details>
  );
}