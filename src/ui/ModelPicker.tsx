import { useStore } from 'zustand';
import { MODEL_KINDS, MODEL_LABELS } from '../core/models';
import { viewStore, type DisplayMode, type LabelMode } from '../store/viewStore';

const DISPLAYS: { value: DisplayMode; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'wireframe', label: 'Wireframe' },
];

const LABELS: { value: LabelMode; label: string }[] = [
  { value: 'none', label: 'No coordinates' },
  { value: 'one', label: 'One corner' },
  { value: 'all', label: 'All corners' },
];

export function ModelPicker() {
  const model = useStore(viewStore, (s) => s.model);
  const display = useStore(viewStore, (s) => s.display);
  const labels = useStore(viewStore, (s) => s.labels);
  const { setModel, setDisplay, setLabels } = viewStore.getState();

  return (
    <section className="object-picker" data-tour="object-picker" aria-label="Object">
      <h2>Object</h2>
      <div className="segmented" role="group" aria-label="Object to transform">
        {MODEL_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={model === kind}
            onClick={() => setModel(kind)}
          >
            {MODEL_LABELS[kind]}
          </button>
        ))}
      </div>
      <div className="row">
        <select
          aria-label="Display"
          value={display}
          disabled={model === 'segment'}
          onChange={(event) => {
            const next = DISPLAYS.find((d) => d.value === event.target.value);
            if (next) setDisplay(next.value);
          }}
        >
          {DISPLAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Coordinate labels"
          value={labels}
          disabled={model === 'house'}
          onChange={(event) => {
            const next = LABELS.find((l) => l.value === event.target.value);
            if (next) setLabels(next.value);
          }}
        >
          {LABELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}