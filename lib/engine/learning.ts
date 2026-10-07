import { WEEKS_PER_MONTH } from './constants';
import { div, step, val } from './steps';
import type { MetaCampaign, Stepped } from './types';

/** ABO = all ad sets; CBO = ad sets getting spend; Advantage+ = 1. */
export function effectiveAdSets(campaigns: MetaCampaign[]) {
  return campaigns.reduce((sum, c) => {
    if (c.budgetType === 'ADVANTAGE') return sum + 1;
    if (c.budgetType === 'CBO') return sum + Math.max(1, c.adSetsWithSpend ?? c.adSets);
    return sum + Math.max(1, c.adSets);
  }, 0);
}

export const learningFloor = (threshold: number, cpa: number, adSets: number) => threshold * cpa * adSets * WEEKS_PER_MONTH;

export type LearningCheck = {
  resultsPerAdSetPerWeek: number;
  floorOneAdSet: number;
  supportedAdSets: number;
  recommendedAdSets: number;
  limited: boolean;
  tooManyAdSets: boolean;
  optimizeForATC: boolean;
};

/** 9.5 Meta learning-phase check. Never forces the budget up. */
export function metaLearningCheck(args: {
  prospectingBudget: number;
  cpa: number;
  adSets: number;
  threshold: number;
  isEcommerce: boolean;
}): Stepped<LearningCheck> {
  const { prospectingBudget, cpa, threshold } = args;
  const adSets = Math.max(1, args.adSets);
  const monthlyResults = div(prospectingBudget, cpa);
  const resultsPerAdSetPerWeek = monthlyResults / WEEKS_PER_MONTH / adSets;
  const floorOneAdSet = learningFloor(threshold, cpa, 1);
  const weekly = prospectingBudget / WEEKS_PER_MONTH;
  const supportedAdSets = Math.max(1, Math.floor(div(weekly, threshold * cpa)));
  const limited = prospectingBudget < floorOneAdSet;
  return {
    resultsPerAdSetPerWeek,
    floorOneAdSet,
    supportedAdSets,
    recommendedAdSets: limited ? 1 : supportedAdSets,
    limited,
    tooManyAdSets: !limited && adSets > supportedAdSets,
    optimizeForATC: limited && args.isEcommerce,
    steps: [
      step(
        'learningPerAdSet',
        [val('monthlyResults', monthlyResults, 'number'), val('weeksPerMonth', WEEKS_PER_MONTH, 'number', 'setting'), val('adSets', adSets, 'number')],
        resultsPerAdSetPerWeek,
        'number',
      ),
      step(
        'learningFloor',
        [val('learningThreshold', threshold, 'number', 'setting'), val('cpa', cpa, 'currency'), val('weeksPerMonth', WEEKS_PER_MONTH, 'number', 'setting')],
        floorOneAdSet,
        'currency',
      ),
      step(
        'supportedAdSets',
        [val('weeklyBudget', weekly, 'currency'), val('learningThreshold', threshold, 'number', 'setting'), val('cpa', cpa, 'currency')],
        supportedAdSets,
        'number',
        true,
      ),
    ],
  };
}

/** 9.5 Google: each campaign should reach the smart bidding minimum per 30 days. */
export function googleLearningCheck(monthlyResults: number, campaigns: number, minConversions: number) {
  const perCampaign = div(monthlyResults, Math.max(1, campaigns));
  return { perCampaign, ok: perCampaign >= minConversions };
}
