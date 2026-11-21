import { useEffect, useRef } from 'react';
import { SceneViewport } from '../scene/SceneViewport';
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';

/** Thin shell: gives SceneViewport a DOM element and cleans it up on unmount. */
export function ViewportCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const viewport = new SceneViewport(container, {
      pipeline: pipelineStore,
      playback: playbackStore,
      view: viewStore,
    });
    return () => viewport.dispose();
  }, []);

  return <div ref={containerRef} className="viewport" />;
}