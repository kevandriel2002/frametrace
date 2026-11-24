// Checks whether current step is complete whenever store changes; if so, moves on
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { LESSON } from './lesson';
import { takeSnapshot } from './snapshot';
import { tutorialStore } from './tutorialStore';

export const SETTLE_MS = 1200;

export function startTutorialController(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const check = () => {
    clearTimeout(timer);
    const state = tutorialStore.getState();
    if (!state.active || state.minimised) return;

    const now = takeSnapshot();
    if (!state.completed) {
      if (LESSON.at(state.stepIndex)?.done?.(now)) state.markCompleted();
      return;
    }

    if (!state.autoAdvance || now.playing) return;
    const index = state.stepIndex;
    timer = setTimeout(() => {
      const latest = tutorialStore.getState();
      if (latest.active && !latest.minimised && latest.completed && latest.stepIndex === index) latest.next();
    }, SETTLE_MS);
  };

  const stops = [
    pipelineStore.subscribe(check),
    playbackStore.subscribe(check),
    viewStore.subscribe(check),
    tutorialStore.subscribe(check),
  ];
  return () => {
    clearTimeout(timer);
    stops.forEach((stop) => stop());
  };
}