import { SOURCE_ORDER } from './constants';
import { div, step, val } from './steps';
import type { BusinessType, LeadSource, MetaEstimates, Settings, Source, Sourced, Stepped, Viability } from './types';

/** CPM ÷ (1000 × CTR × conversion rate). */
export const estimatedCost = (cpm: number, ctr: number, cvr: number) => div(cpm, 1000 * ctr * cvr);

export function lowestConfidence(sources: Source[]): Source {
  return sources.reduce<Source>((worst, s) => (SOURCE_ORDER.indexOf(s) > SOURCE_ORDER.indexOf(worst) ? s : worst), 'accounts');
}

export type MetaCostEstimate = { estimated: number; expected: number; low: number; high: number; source: Source; seasonal: number };

/** 9.6 New-account Meta cost per result with penalty, seasonality and source-based range. */
export function metaNewAccountCost(
  est: MetaEstimates,
  type: BusinessType,
  leadSource: LeadSource | undefined,
  settings: Settings,
  seasonal = 1,
): Stepped<MetaCostEstimate> {
  const useForm = type === 'leads' && leadSource === 'form';
  const conv: Sourced = (useForm ? est.formCompletionRate : est.cvr) ?? { value: 0, source: 'guess' };
  const estimated = estimatedCost(est.cpm.value, est.ctr.value, conv.value);
  const expected = estimated * (1 + settings.newAccountPenalty) * seasonal;
  const source = lowestConfidence([est.cpm.source, est.ctr.source, conv.source]);
  const range = settings.rangeMultipliers[source];
  const convKey = useForm ? 'formCompletionRate' : type === 'leads' ? 'landingPageCVR' : 'siteCVR';

  return {
    estimated,
    expected,
    low: expected * range.low,
    high: expected * range.high,
    source,
    seasonal,
    steps: [
      step(
        type === 'leads' ? (useForm ? 'estimatedCPLForm' : 'estimatedCPL') : 'estimatedCPA',
        [
          val('cpm', est.cpm.value, 'currency', 'assumption', est.cpm.source),
          val('ctr', est.ctr.value, 'percent', 'assumption', est.ctr.source),
          val(convKey, conv.value, 'percent', 'assumption', conv.source),
        ],
        estimated,
        'currency',
      ),
      step(
        'expectedCost',
        [
          val('estimatedCost', estimated, 'currency'),
          val('newAccountPenalty', settings.newAccountPenalty, 'percent', 'setting'),
          val('seasonalMultiplier', seasonal, 'multiplier', 'setting'),
        ],
        expected,
        'currency',
      ),
      step(
        'costRange',
        [val('expectedCost', expected, 'currency'), val('rangeLow', range.low, 'multiplier', 'setting', source), val('rangeHigh', range.high, 'multiplier', 'setting', source)],
        expected * range.high,
        'currency',
        true,
      ),
    ],
  };
}

export type TestPlan = {
  /** Leads: "up to" budget. Ecommerce: Option A. */
  testBudget: number;
  testDaily: number;
  /** Ecommerce Option B: optimize for Add to Cart first when the budget is below Option A. */
  optionB?: { recommended: boolean; maxCostPerATC: number };
  creativeCost: number;
  creativeExceedsTest: boolean;
  stopLoss: { low: number; high: number };
  decision: { scaleBelow: number; stopAbove: number };
  /** Leads only: clients the test is expected to produce. */
  testClients?: number;
};

/** 9.6 Decision-first test plan for new accounts. */
export function testPlan(args: {
  type: BusinessType;
  maxCost: number;
  targetCost: number;
  expectedCost: number;
  leadToClient?: number;
  atcToPurchase?: number;
  availableBudget?: number;
  creatives: number;
  testDays: number;
  settings: Settings;
}): Stepped<TestPlan> {
  const { type, maxCost, targetCost, settings: s } = args;
  const testBudget = s.learningThreshold * maxCost;
  const testDaily = div(testBudget, Math.max(1, args.testDays));
  const creativeCost = args.creatives * s.creativeTestMultiplier * targetCost;
  const scaleBelow = s.scaleThreshold * maxCost;
  const optionB =
    type === 'ecommerce'
      ? {
          recommended: args.availableBudget !== undefined && args.availableBudget < testBudget,
          maxCostPerATC: maxCost * (args.atcToPurchase ?? 0),
        }
      : undefined;
  const testResults = div(testBudget, args.expectedCost);
  const testClients = type === 'leads' ? testResults * (args.leadToClient ?? 0) : undefined;

  return {
    testBudget,
    testDaily,
    optionB,
    creativeCost,
    creativeExceedsTest: creativeCost > testBudget,
    stopLoss: { low: s.stopLossLow * maxCost, high: s.stopLossHigh * maxCost },
    decision: { scaleBelow, stopAbove: maxCost },
    testClients,
    steps: [
      step(
        type === 'leads' ? 'testBudgetLeads' : 'testBudgetOptionA',
        [val('learningThreshold', s.learningThreshold, 'number', 'setting'), val(type === 'leads' ? 'maxCPL' : 'breakEvenCPA', maxCost, 'currency')],
        testBudget,
        'currency',
      ),
      step('testDaily', [val('testBudget', testBudget, 'currency'), val('testDays', args.testDays, 'days')], testDaily, 'currency'),
      step(
        'creativeCheck',
        [val('creatives', args.creatives, 'number'), val('creativeTestMultiplier', s.creativeTestMultiplier, 'multiplier', 'setting'), val('targetCost', targetCost, 'currency')],
        creativeCost,
        'currency',
        true,
      ),
      step('scaleThreshold', [val('scaleThreshold', s.scaleThreshold, 'percent', 'setting'), val('maxCost', maxCost, 'currency')], scaleBelow, 'currency'),
      ...(testClients !== undefined
        ? [
            step(
              'testClients',
              [val('testLeads', testResults, 'number'), val('leadToClient', args.leadToClient ?? 0, 'percent')],
              testClients,
              'number',
              true,
            ),
          ]
        : []),
    ],
  };
}

/** Viable (high ≤ max) / Risky (expected ≤ max < high) / Not viable (expected > max). */
export function viability(expected: number, high: number, max: number): Viability {
  if (high <= max) return 'viable';
  if (expected <= max) return 'risky';
  return 'notViable';
}
