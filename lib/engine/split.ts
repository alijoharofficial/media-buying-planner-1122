import { DAYS_PER_MONTH, MAX_RAMP_STEPS, META_MIN_RESULTS_PER_WEEK, MIN_SPLIT_STEP, WEEKS_PER_MONTH } from './constants';
import { marginalCost, projectedResults } from './projection';
import type { BusinessType, Curve, Platform, RampStep, Settings, SplitLine } from './types';

export type Curves = Partial<Record<Platform, Curve>>;
export type Allocation = Record<Platform, number>;
/** Translation key suffix for why a platform got its share (split.reasons.<key>). */
export type AllocationReason =
  | 'lowestMarginal'
  | 'googleCeiling'
  | 'concentrated'
  | 'belowMinimum'
  | 'searchIntentFirst'
  | 'metaFirst'
  | 'googleSmallShare'
  | 'remainder'
  | 'onlyPlatform';

export type SplitResult = { alloc: Allocation; reasons: Partial<Record<Platform, AllocationReason>>; concentrated: boolean };

/** Share of an ecommerce budget given to Google Search for a new account (capped by max useful spend). */
export const NEW_ECOM_GOOGLE_SHARE = 0.2;

/** 9.8 step 1: Meta = 10 results/week × CPA × weeks; Google = smart bidding minimum × CPA. */
export function platformMinimum(p: Platform, cpa: number, s: Settings) {
  return p === 'meta' ? META_MIN_RESULTS_PER_WEEK * cpa * WEEKS_PER_MONTH : s.googleMinConversions * cpa;
}

const platformsOf = (curves: Curves) => (Object.keys(curves) as Platform[]).filter((p) => curves[p]);

function cheapest(curves: Curves): Platform {
  return platformsOf(curves).reduce((best, p) => ((curves[p]?.baseCPA ?? Infinity) < (curves[best]?.baseCPA ?? Infinity) ? p : best));
}

/** Greedy marginal-cost allocation for accounts with data (9.8 step 2). Google stops at its ceiling (curve.cap). */
export function allocateByMarginalCost(curves: Curves, total: number): Allocation {
  const alloc: Allocation = { meta: 0, google: 0 };
  const platforms = platformsOf(curves);
  const stepSize = Math.max(MIN_SPLIT_STEP, total / 100);
  let left = total;
  while (left > 1e-6) {
    const amount = Math.min(stepSize, left);
    let best: Platform | undefined;
    let bestCost = Infinity;
    for (const p of platforms) {
      const c = curves[p];
      if (!c || (c.cap !== undefined && alloc[p] + amount > c.cap + 1e-6)) continue;
      const mc = marginalCost(c, alloc[p], amount);
      if (mc < bestCost) {
        bestCost = mc;
        best = p;
      }
    }
    // Every capped platform is full: the rest goes to an uncapped one (Meta) if selected.
    best ??= platforms.find((p) => curves[p]?.cap === undefined) ?? platforms[0];
    if (!best) break;
    alloc[best] += amount;
    left -= amount;
  }
  return alloc;
}

/** New account defaults (9.8 step 3). */
export function allocateNewAccount(curves: Curves, total: number, type: BusinessType): SplitResult {
  const alloc: Allocation = { meta: 0, google: 0 };
  const g = curves.google;
  const googleCap = g?.cap ?? Infinity;
  if (!curves.meta) return { alloc: { meta: 0, google: total }, reasons: { google: 'onlyPlatform' }, concentrated: false };
  if (!g) return { alloc: { meta: total, google: 0 }, reasons: { meta: 'onlyPlatform' }, concentrated: false };
  if (type === 'leads') {
    alloc.google = Math.min(total, googleCap);
    alloc.meta = total - alloc.google;
    return { alloc, reasons: { google: 'searchIntentFirst', meta: 'remainder' }, concentrated: false };
  }
  alloc.google = Math.min(total * NEW_ECOM_GOOGLE_SHARE, googleCap);
  alloc.meta = total - alloc.google;
  return { alloc, reasons: { meta: 'metaFirst', google: 'googleSmallShare' }, concentrated: false };
}

/** Full platform split: minimums first, then data-driven or new-account rules. */
export function splitBudget(curves: Curves, total: number, type: BusinessType, isNew: boolean, s: Settings): SplitResult {
  const platforms = platformsOf(curves);
  if (platforms.length === 1) {
    const only = platforms[0] as Platform;
    const alloc: Allocation = { meta: 0, google: 0 };
    alloc[only] = total;
    return { alloc, reasons: { [only]: 'onlyPlatform' }, concentrated: false };
  }
  const minimums = platforms.map((p) => platformMinimum(p, curves[p]?.baseCPA ?? 0, s));
  if (total < minimums.reduce((a, b) => a + b, 0)) {
    const best = cheapest(curves);
    const alloc: Allocation = { meta: 0, google: 0 };
    alloc[best] = total;
    return { alloc, reasons: { [best]: 'concentrated' }, concentrated: true };
  }
  const result = isNew
    ? allocateNewAccount(curves, total, type)
    : { alloc: allocateByMarginalCost(curves, total), reasons: {}, concentrated: false };

  // A platform left below its own minimum cannot exit learning; move its share to the other one.
  for (const p of platforms) {
    const other = platforms.find((o) => o !== p) as Platform;
    const share = result.alloc[p];
    if (share > 0 && share < platformMinimum(p, curves[p]?.baseCPA ?? 0, s) && (curves[other]?.cap === undefined || result.alloc[other] + share <= (curves[other]?.cap ?? Infinity))) {
      result.alloc[other] += share;
      result.alloc[p] = 0;
      result.reasons[p] = 'belowMinimum';
    }
  }
  if (!isNew) {
    for (const p of platforms) {
      if (result.reasons[p]) continue;
      const c = curves[p];
      result.reasons[p] = c?.cap !== undefined && result.alloc[p] >= c.cap - 1 ? 'googleCeiling' : 'lowestMarginal';
    }
  }
  return result;
}

/** Results delivered by an allocation. */
export function allocationResults(curves: Curves, alloc: Allocation) {
  return platformsOf(curves).reduce((sum, p) => sum + projectedResults(curves[p] as Curve, alloc[p]), 0);
}

/** Blended cost per result of an allocation. */
export function allocationCPA(curves: Curves, alloc: Allocation) {
  const results = allocationResults(curves, alloc);
  return results > 0 ? (alloc.meta + alloc.google) / results : 0;
}

/** 9.8 step 4: creative testing, retargeting, prospecting inside Meta. */
export function metaBreakdown(args: {
  budget: number;
  creatives: number;
  targetCost: number;
  isNew: boolean;
  includeRetargeting: boolean;
  retargetingAudience?: number;
  cpm?: number;
  s: Settings;
}): SplitLine[] {
  const { budget, s } = args;
  if (budget <= 0) return [];
  const creative = Math.min(budget, args.creatives * s.creativeTestMultiplier * args.targetCost);
  let retargeting = 0;
  let retargetingReason = 'retargetingOff';
  if (args.includeRetargeting) {
    if (args.isNew) retargetingReason = 'retargetingNewAccount';
    else if ((args.retargetingAudience ?? 0) < s.minRetargetingAudience) retargetingReason = 'retargetingAudienceSmall';
    else {
      const wanted = ((args.retargetingAudience ?? 0) * s.retargetingViewsPerMonth * (args.cpm ?? 0)) / 1000;
      retargeting = Math.min(wanted, s.retargetingCap * budget, budget - creative);
      retargetingReason = wanted > s.retargetingCap * budget ? 'retargetingCapped' : 'retargetingAudience';
    }
  }
  const prospecting = Math.max(0, budget - creative - retargeting);
  return [
    { platform: 'meta', item: 'prospecting', amount: prospecting, reason: 'prospecting' },
    { platform: 'meta', item: 'creativeTesting', amount: creative, reason: 'creativeTesting' },
    { platform: 'meta', item: 'retargeting', amount: retargeting, reason: retargetingReason },
  ];
}

/** 9.8 step 5: brand and non-brand inside Google. */
export function googleBreakdown(budget: number, brandSearches: boolean, s: Settings): SplitLine[] {
  if (budget <= 0) return [];
  const brand = brandSearches ? budget * s.brandShare : 0;
  return [
    { platform: 'google', item: 'nonBrand', amount: budget - brand, reason: 'nonBrand' },
    { platform: 'google', item: 'brand', amount: brand, reason: brandSearches ? 'brand' : 'noBrandSearches' },
  ];
}

/** 9.8 step 6: daily budget increases of at most maxStepIncrease every stepDays. */
export function rampSchedule(startDaily: number, targetDaily: number, s: Settings): RampStep[] {
  if (startDaily <= 0 || startDaily >= targetDaily) return [{ day: 0, daily: targetDaily }];
  const steps: RampStep[] = [{ day: 0, daily: startDaily }];
  let daily = startDaily;
  while (daily < targetDaily && steps.length < MAX_RAMP_STEPS) {
    daily = Math.min(targetDaily, daily * (1 + s.maxStepIncrease));
    steps.push({ day: steps.length * s.stepDays, daily });
  }
  return steps;
}

export const toDaily = (monthly: number) => monthly / DAYS_PER_MONTH;
