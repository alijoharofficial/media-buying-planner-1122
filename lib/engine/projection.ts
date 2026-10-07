import type { Curve } from './types';

/** 9.4 Diminishing returns: CPA rises by `penalty` per doubling of spend above the threshold. */
export function projectedCPA(c: Curve, spend: number) {
  if (spend <= c.threshold || c.threshold <= 0) return c.baseCPA;
  return c.baseCPA * Math.pow(1 + c.penalty, Math.log2(spend / c.threshold));
}

export function projectedResults(c: Curve, spend: number) {
  const s = c.cap !== undefined ? Math.min(spend, c.cap) : spend;
  if (s <= 0 || c.baseCPA <= 0) return 0;
  return s / projectedCPA(c, s);
}

/** Binary search for the smallest spend where a non-decreasing results function reaches target. */
export function solveSpend(resultsAt: (spend: number) => number, target: number, start: number, maxSpend = 1e13) {
  if (target <= 0) return 0;
  let lo = 0;
  let hi = Math.max(1, start);
  while (resultsAt(hi) < target && hi < maxSpend) hi *= 2;
  if (resultsAt(hi) < target) return Infinity;
  for (let i = 0; i < 100 && hi - lo > 0.01; i++) {
    const mid = (lo + hi) / 2;
    if (resultsAt(mid) < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** 9.4 Spend that delivers `target` results on one curve. reachable=false when a cap blocks it. */
export function budgetForResults(c: Curve, target: number): { budget: number; reachable: boolean } {
  if (target <= 0 || c.baseCPA <= 0) return { budget: 0, reachable: target <= 0 };
  if (c.cap !== undefined && projectedResults(c, c.cap) < target) return { budget: c.cap, reachable: false };
  return { budget: solveSpend((s) => projectedResults(c, s), target, target * c.baseCPA), reachable: true };
}

/** Highest spend where projected CPA stays at or below maxCPA. */
export function profitableLimit(c: Curve, maxCPA: number) {
  if (c.baseCPA <= 0 || maxCPA <= 0) return 0;
  if (c.baseCPA > maxCPA) return 0;
  if (c.penalty <= 0) return c.cap ?? Infinity;
  const limit = c.threshold * Math.pow(2, Math.log(maxCPA / c.baseCPA) / Math.log(1 + c.penalty));
  return c.cap !== undefined ? Math.min(limit, c.cap) : limit;
}

/** Δspend ÷ Δresults at the current allocation (9.8). Infinity when no more results are available. */
export function marginalCost(c: Curve, spend: number, stepSize: number) {
  const gain = projectedResults(c, spend + stepSize) - projectedResults(c, spend);
  return gain > 1e-9 ? stepSize / gain : Infinity;
}
