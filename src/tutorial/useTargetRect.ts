// Find where a target is on-screen
import { useEffect, useState } from 'react';

export type TargetRect = { x: number; y: number; width: number; height: number };

function same(a: TargetRect | null, b: TargetRect | null): boolean {
  if (a === null || b === null) return a === b;
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export function useTargetRect(target: string | undefined): TargetRect | null {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!target) return;
    let frame = 0;
    const measure = () => {
      const box = document.querySelector(`[data-tour="${target}"]`)?.getBoundingClientRect();
      const next = box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null;
      setRect((previous) => (same(previous, next) ? previous : next));
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return target ? rect : null;
}