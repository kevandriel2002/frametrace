// Confirmation that tutorial was viewed
const KEY = 'frametrace.tutorialSeen';

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