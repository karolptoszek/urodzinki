import { PersistedProgress, StageId } from '../types/birthday';

const STORAGE_KEY = 'birthday_experience_v1';

export const STAGE_ORDER: StageId[] = [
  'envelope',
  'welcome',
  'scratch',
  'hearts',
  'catch',
];

export const DEFAULT_PROGRESS: PersistedProgress = {
  currentStage: 'envelope',
  maxUnlockedStageIndex: 0,
  revealedScratches: [],
  foundHearts: [],
  catchBestScore: null,
  catchPlayed: false,
  soundEnabled: false,
};

export function loadProgress(): PersistedProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Omit<
      Partial<PersistedProgress>,
      'currentStage'
    > & { currentStage?: string };

    let validStage: StageId = 'envelope';
    if (parsed.currentStage && STAGE_ORDER.includes(parsed.currentStage as StageId)) {
      validStage = parsed.currentStage as StageId;
    } else if (
      parsed.currentStage === 'planner' ||
      parsed.currentStage === 'summary' ||
      parsed.currentStage === 'finale'
    ) {
      validStage = 'catch';
    }

    return {
      currentStage: validStage,
      maxUnlockedStageIndex:
        typeof parsed.maxUnlockedStageIndex === 'number'
          ? Math.max(0, Math.min(STAGE_ORDER.length - 1, parsed.maxUnlockedStageIndex))
          : 0,
      revealedScratches: Array.isArray(parsed.revealedScratches)
        ? parsed.revealedScratches
        : [],
      foundHearts: Array.isArray(parsed.foundHearts) ? parsed.foundHearts : [],
      catchBestScore:
        typeof parsed.catchBestScore === 'number' ? parsed.catchBestScore : null,
      catchPlayed: Boolean(parsed.catchPlayed),
      soundEnabled: Boolean(parsed.soundEnabled),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PersistedProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignoruj błędy np. trybu prywatnego Safari z zablokowanym storage
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignoruj błędy
  }
}
