import { useEffect, type CSSProperties } from 'react';
import { useStore } from 'zustand';
import { LESSON } from './lesson';
import { tutorialStore } from './tutorialStore';
import { useTargetRect, type TargetRect } from './useTargetRect';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 230;
const GAP = 12;
const MARGIN = 16;

function placeCard(rect: TargetRect): CSSProperties {
  const width = Math.min(CARD_WIDTH, window.innerWidth - 2 * MARGIN);
  const below = rect.y + rect.height + GAP;
  const top =
    below + CARD_HEIGHT < window.innerHeight ? below : Math.max(MARGIN, rect.y - GAP - CARD_HEIGHT);
  const left = Math.min(Math.max(MARGIN, rect.x), window.innerWidth - width - MARGIN);
  return { top, left, width };
}

export function TutorialOverlay() {
  const active = useStore(tutorialStore, (s) => s.active);
  const stepIndex = useStore(tutorialStore, (s) => s.stepIndex);
  const step = LESSON.at(stepIndex);
  const rect = useTargetRect(active ? step?.target : undefined);
  const { next, back, close } = tutorialStore.getState();

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, close]);

  if (!active || !step) return null;

  const last = stepIndex === LESSON.length - 1;

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
        {step.done && <p className="tour-waiting">Do this in the app to continue.</p>}
        <div className="tour-actions">
          <button type="button" onClick={close}>
            Close
          </button>
          <button type="button" onClick={back} disabled={stepIndex === 0}>
            Back
          </button>
          <button type="button" className="tour-primary" onClick={next}>
            {step.done ? 'Skip' : last ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}