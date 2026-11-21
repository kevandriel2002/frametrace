// Shows current step's matrix on the left and product on the right
import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { exactRotationRows } from '../core/math/exact';
import { formatOperation } from '../core/pipeline/describe';
import { inspectAt } from '../core/pipeline/inspect';
import { effectivePlayhead } from '../core/pipeline/playhead';
import { pipelineStore, toPipeline } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { MatrixView } from './MatrixView';
import { ZoneLegend } from './ZoneLegend';
import { describeRank, linearRank } from '../core/math/rank';

const KIND_TITLES = { translate: 'Translate', rotate: 'Rotate', scale: 'Scale' } as const;

export function InspectorPanel() {
  const blocks = useStore(pipelineStore, (s) => s.blocks);
  const playhead = useStore(playbackStore, (s) => s.playhead);
  const mode = useStore(playbackStore, (s) => s.mode);
  const [exact, setExact] = useState(false);

  const pipeline = useMemo(() => toPipeline(blocks), [blocks]);
  const t = effectivePlayhead(playhead, pipeline.length);
  const view = useMemo(() => inspectAt(pipeline, t, mode), [pipeline, t, mode]);
  const rank = linearRank(view.cumulative);

  const product = view.factors.length === 0 ? 'I' : view.factors.map(formatOperation).join(' · ');
  const exactRows =
    view.stepOp?.kind === 'rotate' && view.progress === 1
      ? exactRotationRows(view.stepOp.axis, view.stepOp.angleDeg)
      : null;

  return (
    <div className="inspector">
      <div className="inspector-matrix">
        {view.step && view.stepOp && view.stepIndex !== null ? (
          <>
            <p className="inspector-heading">
              Step {view.stepIndex + 1} · {KIND_TITLES[view.stepOp.kind]}
              {view.progress < 1 && ` · ${Math.round(view.progress * 100)}% applied`}
            </p>
            <MatrixView
              caption={formatOperation(view.stepOp)}
              matrix={view.step}
              zoneOp={view.stepOp}
              text={exact ? exactRows : null}
            />
            <p className={`rank-badge${rank < 3 ? ' is-collapsed' : ''}`}>
              Rank {rank}: {describeRank(rank)}
            </p>
            <label className="inspector-exact">
              <input
                type="checkbox"
                checked={exact}
                disabled={!exactRows}
                onChange={() => setExact((was) => !was)}
              />
              Exact values (√2/2 instead of 0.707)
            </label>
          </>
        ) : (
          <p className="inspector-empty">No step applied yet. Scrub forward or press Play.</p>
        )}
      </div>

      <div className="inspector-matrix">
        <p className="inspector-heading">
          Product so far · {mode === 'world' ? 'world axes' : 'local axes'}
        </p>
        <MatrixView caption={`M = ${product}`} matrix={view.cumulative} zoneOp={null} />
      </div>

      <ZoneLegend />
    </div>
  );
}