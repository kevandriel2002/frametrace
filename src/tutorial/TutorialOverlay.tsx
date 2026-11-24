import { useEffect, type CSSProperties } from 'react';
import { useStore } from 'zustand';
import { LESSON } from './lesson';
import { tutorialStore } from './tutorialStore';
import { useTargetRect, type TargetRect } from './useTargetRect';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 300;
const GAP = 12;
const MARGIN = 16;

type Box = { top: number; left: number; width: number };

function placeCard(rect: TargetRect): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(CARD_WIDTH, vw - 2 * MARGIN);
  const clampTop = (top: number) => Math.min(Math.max(MARGIN, top), vh - CARD_HEIGHT - MARGIN);
  const clampLeft = (left: number) => Math.min(Math.max(MARGIN, left), vw - width - MARGIN);

  const candidates: Box[] = [
    { left: rect.x + rect.width + GAP, top: clampTop(rect.y), width },
    { left: clampLeft(rect.x), top: rect.y + rect.height + GAP, width },
    { left: clampLeft(rect.x), top: rect.y - GAP - CARD_HEIGHT, width },
    { left: rect.x - GAP - width, top: clampTop(rect.y), width },
  ];
  const fits = (box: Box) =>
    box.left >= MARGIN &&
    box.top >= MARGIN &&
    box.left + box.width <= vw - MARGIN &&
    box.top + CARD_HEIGHT <= vh - MARGIN;

  return candidates.find(fits) ?? { left: vw - width - MARGIN, top: vh - CARD_HEIGHT - MARGIN, width };
}

export function TutorialOverlay() {
  const active = useStore(tutorialStore, (s) => s.active);
  const minimised = useStore(tutorialStore, (s) => s.minimised);
  const stepIndex = useStore(tutorialStore, (s) => s.stepIndex);
  const completed = useStore(tutorialStore, (s) => s.completed);
  const autoAdvance = useStore(tutorialStore, (s) => s.autoAdvance);
  const step = LESSON.at(stepIndex);
  const rect = useTargetRect(active && !minimised ? step?.target : undefined);
  const { next, back, close, minimise, restore } = tutorialStore.getState();

  useEffect(() => {
    if (!active || minimised) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, minimised, close]);

  if (!active || !step) return null;

  if (minimised) {
    return (
      <div className="tour-pill" role="status">
        <span>
          Tutorial · step {stepIndex + 1} of {LESSON.length}
        </span>
        <button type="button" className="tour-primary" onClick={restore}>
          Resume
        </button>
      </div>
    );
  }

  const last = stepIndex === LESSON.length - 1;
  const waiting = Boolean(step.done) && !completed;

  return (
    <>
      {rect ? (
        <div
          className="tour-highlight"
          style={{ left: rect.x - 6, top: rect.y - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      ) : (
        <div className="tour-dim" />
      )}

      <div
        className={`tour-card${rect ? '' : ' tour-card-center'}`}
        style={rect ? placeCard(rect) : undefined}
        role="dialog"
        aria-labelledby="tour-title"
        aria-live="polite"
      >
        <p className="tour-progress">
          Step {stepIndex + 1} of {LESSON.length}
        </p>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.body}</p>
        {waiting && <p className="tour-status">Do this in the app to continue.</p>}
        {completed && (
          <p className="tour-status tour-status-done">{autoAdvance ? '✓ Done. Moving on…' : '✓ Done'}</p>
        )}
        <div className="tour-actions">
          <button type="button" onClick={close}>
            Close
          </button>
          <button type="button" onClick={minimise}>
            Minimise
          </button>
          <button type="button" onClick={back} disabled={stepIndex === 0}>
            Back
          </button>
          <button type="button" className="tour-primary" onClick={next}>
            {waiting ? 'Skip' : last ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}