// Displays PipelinePanel(user controls) and ViewportCanvas(geometric implementation)
import { PipelinePanel } from './ui/PipelinePanel';
import { ViewportCanvas } from './ui/ViewportCanvas';
import { useUndoShortcuts } from './ui/useUndoShortcuts';

function App() {
  useUndoShortcuts();
  return (
    <div className="app">
      <PipelinePanel />
      <main className="app-viewport">
        <ViewportCanvas />
      </main>
    </div>
  );
}

export default App;