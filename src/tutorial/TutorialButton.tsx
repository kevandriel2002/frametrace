import { useStore } from 'zustand';
import { tutorialStore } from './tutorialStore';

export function TutorialButton() {
  const active = useStore(tutorialStore, (s) => s.active);
  const savedStep = useStore(tutorialStore, (s) => s.savedStep);
  const { start, resume } = tutorialStore.getState();

  if (active) return null;

  if (savedStep !== null && savedStep > 0) {
    return (
      <>
        <button type="button" onClick={resume}>
          Resume tutorial (step {savedStep + 1})
        </button>
        <button type="button" onClick={start}>
          Restart
        </button>
      </>
    );
  }

  return (
    <button type="button" onClick={start}>
      Tutorial
    </button>
  );
}