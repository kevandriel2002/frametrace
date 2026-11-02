import { useEffect, useRef } from 'react';
import { SceneViewport } from '../scene/SceneViewport';

/** Thin shell: gives SceneViewport a DOM element and cleans it up on unmount. */
export function ViewportCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const viewport = new SceneViewport(container);
    return () => viewport.dispose();
  }, []);

  return <div ref={containerRef} className="viewport" />;
}