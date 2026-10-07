import type { Settings, Source } from './types';

export const WEEKS_PER_MONTH = 4.345;
export const DAYS_PER_MONTH = 30.4;
/** Meta platform minimum: results per week the account needs to keep delivering (9.8). */
export const META_MIN_RESULTS_PER_WEEK = 10;
/** Bottleneck finder improvement, in percentage points. */
export const BOTTLENECK_IMPROVEMENT = 0.1;
export const MIN_SPLIT_STEP = 50;
export const MAX_RAMP_STEPS = 40;

/** Best confidence first. */
export const SOURCE_ORDER: Source[] = ['accounts', 'metaEstimate', 'benchmark', 'guess'];

const flat = () => Array.from({ length: 12 }, () => 1);

export const DEFAULT_SETTINGS: Settings = {
  learningThreshold: 50,
  googleMinConversions: 30,
  scalingPenalty: 0.15,
  profitBuffer: 0.25,
  newAccountPenalty: 0.25,
  creativeTestMultiplier: 2.5,
  scaleThreshold: 0.7,
  stopLossLow: 2,
  stopLossHigh: 3,
  minResultsForConfidence: 50,
  retargetingViewsPerMonth: 8,
  retargetingCap: 0.2,
  minRetargetingAudience: 1000,
  brandShare: 0.1,
  maxStepIncrease: 0.2,
  stepDays: 3,
  rangeMultipliers: {
    accounts: { low: 0.85, high: 1.2 },
    metaEstimate: { low: 0.8, high: 1.3 },
    benchmark: { low: 0.8, high: 1.4 },
    guess: { low: 0.7, high: 1.6 },
  },
  // Editable estimates: ecommerce Nov 1.3 and Dec 1.2 are placeholders, everything else 1.0.
  seasonalMultipliers: {
    ecommerce: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.3, 1.2],
    leads: flat(),
    messaging: flat(),
  },
};

/** Account health thresholds (placeholders, tune with real data). [green if >=, amber if >=] or for frequency [green if <=, amber if <=]. */
export const HEALTH_THRESHOLDS = {
  ctr: [0.01, 0.006],
  cvrLeads: [0.05, 0.02],
  cvrEcommerce: [0.02, 0.01],
  frequency: [3, 5],
} as const;
