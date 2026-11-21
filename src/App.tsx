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
import { startTutorialController } from './tutorial/controller';
import { hasSeenTutorial } from './tutorial/seen';
import { TutorialOverlay } from './tutorial/TutorialOverlay';
import { tutorialStore } from './tutorial/tutorialStore';
import { HelpButton } from './ui/HelpButton';

function App() {
  useUndoShortcuts();
  usePlaybackClock();
  useEffect(() => followPipelineEdits(pipelineStore, playbackStore), []);
  useEffect(() => startTutorialController(), []);
  useEffect(() => {
    if (!hasSeenTutorial()) tutorialStore.getState().start();
  }, []);
  return (
    <div className="app">
      <header className='app-header'>
        <button type="button" onClick={() => tutorialStore.getState().start()}>
          Tutorial
        </button>
        <HelpButton />
        <img src={logo} alt='' className='app-logo' />
        <span className='app-title'>FrameTrace</span>
      </header>
      <PipelinePanel />
      <main className="app-viewport" data-tour="viewport">
        <ViewportCanvas />
      </main>
      <TimelineBar />
      <BottomDock />
      <TutorialOverlay />
    </div>
  );
}

export default App;