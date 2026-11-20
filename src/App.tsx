import logo from './assets/logo.png'
import { useEffect } from 'react';
// Displays PipelinePanel(user controls) and ViewportCanvas(geometric implementation)
import { PipelinePanel } from './ui/PipelinePanel';
import { ViewportCanvas } from './ui/ViewportCanvas';
import { useUndoShortcuts } from './ui/useUndoShortcuts';
import { TimelineBar } from './ui/TimelineBar';
import { usePlaybackClock } from './ui/usePlaybackClock';
import { followPipelineEdits } from './store/links';
import { pipelineStore } from './store/pipelineStore';
import { playbackStore } from './store/playbackStore';
import { BottomDock } from './ui/BottomDock';

function App() {
  useUndoShortcuts();
  usePlaybackClock();
  useEffect(() => followPipelineEdits(pipelineStore, playbackStore), []);
  return (
    <div className="app">
      <header className='app-header'>
        <img src={logo} alt='' className='app-logo' />
        <span className='app-title'>FrameTrace</span>
      </header>
      <PipelinePanel />
      <main className="app-viewport">
        <ViewportCanvas />
      </main>
      <TimelineBar />
      <BottomDock />
    </div>
  );
}

export default App;