// Collapsible bottom dock for matrix inspector
import { useState } from 'react';
import { InspectorPanel } from './InspectorPanel';

export function BottomDock() {
  const [open, setOpen] = useState(true);

  return (
    <section className="dock" aria-label="Inspector">
      <div className="dock-header">
        <span className="dock-tab">Inspector</span>
        <button
          type="button"
          className="dock-toggle"
          aria-expanded={open}
          aria-controls="dock-body"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div id="dock-body" className="dock-body">
          <InspectorPanel />
        </div>
      )}
    </section>
  );
}