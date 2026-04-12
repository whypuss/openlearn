/**
 * OpenLearn — SM-2 Spaced Repetition Scheduler
 * Pure JS implementation, browser-compatible
 * Based on the SuperMemo SM-2 algorithm
 */

export type RatingValue = 1 | 2 | 3 | 4;

export const RatingLabel: Record<RatingValue, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
};

export const RatingColor: Record<RatingValue, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-green-400",
  4: "text-blue-400",
};

export const RatingBg: Record<RatingValue, string> = {
  1: "bg-red-500/20 hover:bg-red-500/30 border-red-500/40",
  2: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40",
  3: "bg-green-500/20 hover:bg-green-500/30 border-green-500/40",
  4: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40",
};

export interface SM2State {
  /** Previous interval in days */
  interval: number;
  /** Repetition count */
  reps: number;
  /** Ease factor (minimum 1.3) */
  easeFactor: number;
  /** Due date as ISO string */
  dueDate: string;
}

export interface ScheduleResult {
  dueDate: Date;
  intervalDays: number;
  easeFactor: number;
}

/**
 * Create initial SM-2 state for a new card
 */
export function createInitialState(): SM2State {
  return {
    interval: 0,
    reps: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
  };
}

/**
 * Parse SM2 state from JSON string stored in IndexedDB
 */
export function parseSM2State(json: string): SM2State {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return createInitialState();
  }
}

/**
 * Serialize SM2State to JSON string
 */
export function serializeSM2State(state: SM2State): string {
  return JSON.stringify(state);
}

/**
 * SM-2 scheduling algorithm
 * @param state Current card state
 * @param rating User rating 1-4
 * @returns New state and scheduling info
 */
export function schedule(state: SM2State, rating: RatingValue): ScheduleResult {
  const EF = state.easeFactor;
  const I = state.interval;
  const R = state.reps;

  // Map rating to SM-2 quality (0-5), where:
  // Again=0, Hard=2, Good=4, Easy=5
  const quality = [0, 2, 4, 5][rating - 1] as 0 | 2 | 4 | 5;

  let newEF = EF;
  let newI = 1;
  let newR = 0;

  if (quality < 3) {
    // Failed — reset to beginning
    newR = 0;
    newI = 1;
  } else {
    // Passed
    if (R === 0) {
      newI = 1;
    } else if (R === 1) {
      newI = 6;
    } else {
      newI = Math.round(I * EF);
    }
    newR = R + 1;

    // Update ease factor
    newEF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3) newEF = 1.3;
  }

  const now = new Date();
  const dueDate = new Date(now.getTime() + newI * 24 * 60 * 60 * 1000);

  return {
    dueDate,
    intervalDays: newI,
    easeFactor: Math.round(newEF * 100) / 100,
  };
}

/**
 * Build updated state from scheduling result
 */
export function applySchedule(state: SM2State, result: ScheduleResult): SM2State {
  return {
    interval: result.intervalDays,
    reps: state.reps + 1,
    easeFactor: result.easeFactor,
    dueDate: result.dueDate.toISOString(),
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(state: SM2State): boolean {
  return new Date(state.dueDate) <= new Date();
}

/**
 * Format interval in human-readable form
 */
export function formatInterval(days: number): string {
  if (days < 1) return "<1d";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}
