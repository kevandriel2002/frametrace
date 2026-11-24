import type { CameraView } from '../store/viewStore';
import { viewStore } from '../store/viewStore';

const VIEWS: { view: CameraView; label: string; hint: string }[] = [
  { view: 'reset', label: 'Reset', hint: 'Back to the starting view' },
  { view: 'front', label: 'Front', hint: 'Look along −Z: X to the right, Y up' },
  { view: 'right', label: 'Right', hint: 'Look along −X: Z to the left, Y up' },
  { view: 'top', label: 'Top', hint: 'Look down the Y axis: X to the right, Z towards you' },
];

export function ViewButtons() {
  const { requestCamera } = viewStore.getState();
  return (
    <div className="view-buttons" role="group" aria-label="Camera view">
      {VIEWS.map(({ view, label, hint }) => (
        <button key={view} type="button" title={hint} onClick={() => requestCamera(view)}>
          {label}
        </button>
      ))}
    </div>
  );
}