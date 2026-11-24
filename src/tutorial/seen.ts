import { LESSON } from "./lesson";

// Confirmation that tutorial was viewed
const KEY = 'frametrace.tutorialSeen';
const STEP_KEY = 'frametrace.tutorialStep';

export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(KEY) === 'yes';
  } catch {
    return false;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(KEY, 'yes');
  } catch {
    // Storage unavailable (private browsing, tests): the tutorial just shows again next time.
  }
}

export function loadSavedStep(): number | null {
  try {
    const value = localStorage.getItem(STEP_KEY);
    if (value === null) return null;
    const step = Number(value);
    return Number.isInteger(step) && step >= 0 && step < LESSON.length ? step : null;
  } catch {
    return null;
  }
}

export function saveStep(step: number): void {
  try {
    localStorage.setItem(STEP_KEY, String(step));
  } catch {
    // Storage unavailable: the tutorial still works, it just can't resume after a reload.
  }
}

export function clearSavedStep(): void {
  try {
    localStorage.removeItem(STEP_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}