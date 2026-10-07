import { DAYS_PER_MONTH } from './constants';
import { div, step, val } from './steps';
import type { GoogleEstimates, GoogleExisting, Settings, Stepped } from './types';
import { lowestConfidence } from './estimates';
import { monthlySpend } from './metrics';

export type GoogleNew = {
  availableImpressions: number;
  maxClicks: number;
  maxResults: number;
  avgCPC: number;
  maxUsefulSpend: number;
  /** Expected cost per result including the new account penalty. */
  expectedCPA: number;
  low: number;
  high: number;
};

/** 9.7 Google Search model for a new account. */
export function googleNewAccount(g: GoogleEstimates, settings: Settings): Stepped<GoogleNew> {
  const availableImpressions = g.monthlySearches.value * g.impressionShare.value;
  const maxClicks = availableImpressions * g.ctr.value;
  const maxResults = maxClicks * g.cvr.value;
  const avgCPC = (g.bidLow.value + g.bidHigh.value) / 2;
  const maxUsefulSpend = maxClicks * avgCPC;
  const expectedCPA = div(avgCPC, g.cvr.value) * (1 + settings.newAccountPenalty);
  const range = settings.rangeMultipliers[lowestConfidence([g.monthlySearches.source, g.bidLow.source, g.bidHigh.source, g.ctr.source, g.cvr.source])];
  const a = (k: string, s: { value: number; source: GoogleEstimates['ctr']['source'] }, unit: 'number' | 'percent' | 'currency') =>
    val(k, s.value, unit, 'assumption', s.source);

  return {
    availableImpressions,
    maxClicks,
    maxResults,
    avgCPC,
    maxUsefulSpend,
    expectedCPA,
    low: expectedCPA * range.low,
    high: expectedCPA * range.high,
    steps: [
      step('googleImpressions', [a('monthlySearches', g.monthlySearches, 'number'), a('impressionShare', g.impressionShare, 'percent')], availableImpressions, 'number'),
      step('googleMaxClicks', [val('availableImpressions', availableImpressions, 'number'), a('ctr', g.ctr, 'percent')], maxClicks, 'number'),
      step('googleMaxResults', [val('maxClicks', maxClicks, 'number'), a('cvr', g.cvr, 'percent')], maxResults, 'number'),
      step('googleAvgCPC', [a('bidLow', g.bidLow, 'currency'), a('bidHigh', g.bidHigh, 'currency')], avgCPC, 'currency'),
      step('googleMaxSpend', [val('maxClicks', maxClicks, 'number'), val('avgCPC', avgCPC, 'currency')], maxUsefulSpend, 'currency'),
      step(
        'googleExpectedCPA',
        [val('avgCPC', avgCPC, 'currency'), a('cvr', g.cvr, 'percent'), val('newAccountPenalty', settings.newAccountPenalty, 'percent', 'setting')],
        expectedCPA,
        'currency',
        true,
      ),
    ],
  };
}

export type GoogleCeiling = {
  monthlySpend: number;
  extraImpressions: number;
  extraSpend: number;
  ceiling: number;
  /** Monthly results available up to the ceiling at the current CPA. */
  maxResults: number;
};

/** 9.7 Existing account: spend ceiling from impression share lost to budget. */
export function googleExistingCeiling(g: GoogleExisting, days: number): Stepped<GoogleCeiling> {
  const ms = monthlySpend(g.cost, days);
  const monthlyImpressions = div(g.impressions, days) * DAYS_PER_MONTH;
  const extraImpressions = monthlyImpressions * div(g.lostISBudget, g.impressionShare);
  const ctr = div(g.clicks, g.impressions);
  const cpc = div(g.cost, g.clicks);
  const extraSpend = extraImpressions * ctr * cpc;
  const ceiling = ms + extraSpend;
  const cpa = div(g.cost, g.conversions);
  return {
    monthlySpend: ms,
    extraImpressions,
    extraSpend,
    ceiling,
    maxResults: div(ceiling, cpa),
    steps: [
      step(
        'googleExtraImpressions',
        [val('monthlyImpressions', monthlyImpressions, 'number'), val('lostISBudget', g.lostISBudget, 'percent'), val('impressionShare', g.impressionShare, 'percent')],
        extraImpressions,
        'number',
      ),
      step('googleExtraSpend', [val('extraImpressions', extraImpressions, 'number'), val('ctr', ctr, 'percent'), val('cpc', cpc, 'currency')], extraSpend, 'currency'),
      step('googleCeiling', [val('monthlySpend', ms, 'currency'), val('extraSpend', extraSpend, 'currency')], ceiling, 'currency'),
    ],
  };
}
