// Checks whether current step is complete whenever store changes; if so, moves on
import { pipelineStore } from '../store/pipelineStore';
import { playbackStore } from '../store/playbackStore';
import { viewStore } from '../store/viewStore';
import { LESSON } from './lesson';
import { takeSnapshot } from './snapshot';
import { tutorialStore } from './tutorialStore';

export function startTutorialController(): () => void {
  const check = () => {
    const { active, stepIndex, next } = tutorialStore.getState();
    if (!active) return;
    const step = LESSON.at(stepIndex);
    if (step?.done?.(takeSnapshot())) next();
  };

  const stops = [
    pipelineStore.subscribe(check),
    playbackStore.subscribe(check),
    viewStore.subscribe(check),
    tutorialStore.subscribe(check),
  ];
  return () => stops.forEach((stop) => stop());
}