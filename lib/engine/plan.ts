import { BOTTLENECK_IMPROVEMENT, HEALTH_THRESHOLDS } from './constants';
import { workingCPA } from './confidence';
import { lowestConfidence, metaNewAccountCost, testPlan, viability, type MetaCostEstimate, type TestPlan } from './estimates';
import { googleExistingCeiling, googleNewAccount, type GoogleNew } from './google';
import { effectiveAdSets, googleLearningCheck, metaLearningCheck, type LearningCheck } from './learning';
import { ecomLimits, leadLimits, requiredResults, resultCostLimits, type Limits } from './limits';
import { googleMetrics, metaMetrics, metaMetricSteps, monthlySpend, sumRows, type GoogleMetrics, type LeadFunnel, type MetaMetrics } from './metrics';
import { projectedCPA, solveSpend } from './projection';
import {
  allocationCPA,
  allocationResults,
  googleBreakdown,
  metaBreakdown,
  rampSchedule,
  splitBudget,
  toDaily,
  type Allocation,
  type AllocationReason,
  type Curves,
  type SplitResult,
} from './split';
import { div, step, val } from './steps';
import type {
  HealthFlag,
  PlanInput,
  Platform,
  RampStep,
  Source,
  SplitLine,
  StepRecord,
  Stepped,
  Verdict,
  Viability,
  Warning,
} from './types';

export type ScalingRow = { budget: number; results: number; cpa: number; cac?: number; roas: number; profitable: boolean };
export type BottleneckStage = { stage: 'booking' | 'show' | 'close'; rate: number; improvedRate: number; budgetSaved?: number; extraClients?: number };
export type FunnelStage = { key: string; value: number; low: number; high: number; unit: 'number' | 'currency' };
export type HealthItem = { value: number; flag: HealthFlag };

export type PlanResult = {
  input: Pick<PlanInput, 'businessType' | 'accountStatus' | 'goalType' | 'platforms'>;
  limits: Limits;
  costLimits: { max: number; target: number };
  existing?: { meta?: { total: MetaMetrics; rows: MetaMetrics[] }; google?: GoogleMetrics; funnel?: LeadFunnel };
  google?: { kind: 'new' | 'existing'; maxResults: number; maxSpend: number };
  newAccount?: {
    meta?: MetaCostEstimate;
    google?: GoogleNew;
    test: TestPlan;
    viability: Viability;
    biggestAssumption?: string;
    scaleEstimate: { results: number; low: number; expected: number; high: number };
  };
  budget: {
    monthly: number;
    daily: number;
    low: number;
    high: number;
    /** Platform results (leads or purchases). */
    results: number;
    resultsLow: number;
    resultsHigh: number;
    cpa: number;
    cac?: number;
    clients?: number;
    roas: number;
    revenue: number;
    reachable: boolean;
    isEstimate: boolean;
  };
  verdict: Verdict;
  /** "What it delivers": leads → bookings → shows → clients, or visits → carts → purchases → revenue. */
  funnel: FunnelStage[];
  learning?: LearningCheck;
  googleLearning?: { perCampaign: number; ok: boolean };
  split: { platforms: Allocation; reasons: Partial<Record<Platform, AllocationReason>>; lines: SplitLine[]; ramp: RampStep[] };
  scaling: { rows: ScalingRow[]; profitableLimit: number | null };
  bottleneck?: { stages: BottleneckStage[]; weakest: BottleneckStage['stage'] };
  health?: { cpm: HealthItem; ctr: HealthItem; cvr: HealthItem; frequency: HealthItem };
  warnings: Warning[];
  steps: StepRecord[];
};

const SCALING_MULTIPLIERS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/** Full media buying plan for any of the 4 modes. Pure: same input, same output. */
export function buildPlan(input: PlanInput): PlanResult {
  const s = input.settings;
  const type = input.businessType;
  const isNew = input.accountStatus === 'new';
  const ex = input.existing;
  const days = ex?.days ?? 30;
  const warnings: Warning[] = [];
  const steps: StepRecord[] = [];
  const warn = (code: string, severity: Warning['severity'] = 'warning', params?: Warning['params']) =>
    warnings.push({ code, severity, ...(params ? { params } : {}) });

  // ---------- Existing data: Meta rows ----------
  const wantsMeta = input.platforms.includes('meta');
  const wantsGoogle = input.platforms.includes('google');
  const metaRows = !isNew && wantsMeta ? (ex?.metaRows ?? []).filter((r) => r.spend > 0) : [];
  const metaTotalRow = metaRows.length ? sumRows(metaRows) : undefined;
  const clientValue = input.leads?.clientValue ?? 0;
  const metaTotal = metaTotalRow ? metaMetrics(metaTotalRow, type, clientValue) : undefined;
  if (metaRows.length > 1) warn('multiCountry', 'info', { countries: metaRows.length });

  // ---------- Business limits (9.1), CRM funnel overrides rate inputs ----------
  const funnel = metaTotal?.funnel;
  let limits: Limits;
  if (type === 'leads') {
    const lead = input.leads ?? { clientValue: 0, margin: 0, bookingRate: 0, showRate: 0, closeRate: 0 };
    const res = funnel
      ? leadLimits({ ...lead, bookingRate: funnel.bookingRate, showRate: funnel.showRate, closeRate: funnel.closeRate }, s.profitBuffer, 'crm')
      : leadLimits(lead, s.profitBuffer);
    steps.push(...res.steps);
    limits = res;
  } else {
    const res = ecomLimits(input.ecommerce ?? { aov: 0, productCost: 0, shipping: 0, paymentFee: 0, returnRate: 0 }, s.profitBuffer);
    steps.push(...res.steps);
    limits = res;
  }
  const costLimits = resultCostLimits(limits);
  const leadToClient = limits.kind === 'leads' ? limits.leadToClient : 1;

  // ---------- Curves ----------
  const curves: Curves = {};
  const splitCurves: Curves = {};
  let googleExisting: GoogleMetrics | undefined;
  let googleInfo: PlanResult['google'];
  let metaEst: Stepped<MetaCostEstimate> | undefined;
  let googleNew: Stepped<GoogleNew> | undefined;
  let metaCPM = metaTotal?.cpm;
  const profile = input.profile ?? (type === 'ecommerce' ? 'ecommerce' : 'leads');
  const seasonal = s.seasonalMultipliers[profile]?.[input.month ?? 0] ?? 1;
  if (seasonal !== 1) warn('seasonality', 'info', { multiplier: seasonal });

  if (!isNew) {
    if (metaTotal && metaTotal.results > 0) {
      steps.push(...metaMetricSteps(metaTotal, days, type));
      const w = workingCPA(metaTotal.cpa, metaTotal.results, s.minResultsForConfidence, ex?.benchmarkCPA?.meta);
      steps.push(...w.steps);
      if (w.lowConfidence) warn('lowConfidence', 'warning', { platform: 'meta', results: metaTotal.results });
      curves.meta = { baseCPA: w.cpa, threshold: monthlySpend(metaTotal.spend, days), penalty: s.scalingPenalty };
      splitCurves.meta = curves.meta;
    } else if (wantsMeta) warn('missingData', 'warning', { platform: 'meta' });

    const g = ex?.google;
    if (wantsGoogle && g && g.cost > 0 && g.conversions > 0) {
      googleExisting = googleMetrics(g, days, type, clientValue, leadToClient);
      const w = workingCPA(googleExisting.cpa, g.conversions, s.minResultsForConfidence, ex?.benchmarkCPA?.google);
      if (w.lowConfidence) warn('lowConfidence', 'warning', { platform: 'google', results: g.conversions });
      const ceiling = googleExistingCeiling(g, days);
      steps.push(...w.steps, ...ceiling.steps);
      curves.google = { baseCPA: w.cpa, threshold: ceiling.ceiling, penalty: s.scalingPenalty };
      splitCurves.google = { ...curves.google, cap: ceiling.ceiling };
      googleInfo = { kind: 'existing', maxResults: div(ceiling.ceiling, w.cpa), maxSpend: ceiling.ceiling };
    } else if (wantsGoogle) warn('missingData', 'warning', { platform: 'google' });
  } else {
    const metaE = input.estimates?.meta;
    if (wantsMeta && metaE) {
      metaEst = metaNewAccountCost(metaE, type, input.leads?.leadSource, s, seasonal);
      steps.push(...metaEst.steps);
      curves.meta = { baseCPA: metaEst.expected, threshold: Infinity, penalty: s.scalingPenalty };
      splitCurves.meta = curves.meta;
      metaCPM = metaE.cpm.value;
    }
    const googleE = input.estimates?.google;
    if (wantsGoogle && googleE) {
      googleNew = googleNewAccount(googleE, s);
      steps.push(...googleNew.steps);
      curves.google = { baseCPA: googleNew.expectedCPA, threshold: Infinity, penalty: s.scalingPenalty, cap: googleNew.maxUsefulSpend };
      splitCurves.google = curves.google;
      googleInfo = { kind: 'new', maxResults: googleNew.maxResults, maxSpend: googleNew.maxUsefulSpend };
    }
  }

  const activePlatforms = (Object.keys(curves) as Platform[]).filter((p) => curves[p]);
  const useCurves = activePlatforms.length > 1 ? splitCurves : curves;
  const split = (total: number): SplitResult => splitBudget(useCurves, total, type, isNew, s);
  const resultsAt = (total: number) => allocationResults(useCurves, split(total).alloc);

  // ---------- Budget ----------
  const required = input.goalType === 'target' ? requiredResults(type, input.targetResults ?? 0, limits) : 0;
  if (input.goalType === 'target' && type === 'leads') {
    steps.push(step('requiredLeads', [val('targetClients', input.targetResults ?? 0, 'number'), val('leadToClient', leadToClient, 'percent')], required, 'number'));
  }
  let monthly = 0;
  let reachable = true;
  if (activePlatforms.length) {
    if (input.goalType === 'target') {
      const firstCPA = curves[activePlatforms[0] as Platform]?.baseCPA ?? 0;
      monthly = solveSpend(resultsAt, required, required * firstCPA);
      if (!Number.isFinite(monthly)) {
        reachable = false;
        monthly = activePlatforms.reduce((sum, p) => sum + (useCurves[p]?.cap ?? 0), 0);
        warn('targetUnreachable', 'danger');
      }
    } else monthly = input.monthlyBudget ?? 0;
  }
  const platformSplit = split(monthly);
  const results = allocationResults(useCurves, platformSplit.alloc);
  const cpa = div(monthly, results);

  if (activePlatforms.length === 1) {
    const p = activePlatforms[0] as Platform;
    const c = curves[p];
    if (c && Number.isFinite(c.threshold)) {
      steps.push(
        step(
          input.goalType === 'target' ? 'budgetForTarget' : 'resultsForBudget',
          [
            val(input.goalType === 'target' ? 'requiredResults' : 'monthlyBudget', input.goalType === 'target' ? required : monthly, input.goalType === 'target' ? 'number' : 'currency'),
            val('baseCPA', c.baseCPA, 'currency'),
            val('baseSpend', c.threshold, 'currency'),
            val('scalingPenalty', s.scalingPenalty, 'percent', 'setting'),
          ],
          input.goalType === 'target' ? monthly : results,
          input.goalType === 'target' ? 'currency' : 'number',
          true,
        ),
        step('projectedCPA', [val('baseCPA', c.baseCPA, 'currency'), val('monthlyBudget', monthly, 'currency'), val('baseSpend', c.threshold, 'currency')], projectedCPA(c, monthly), 'currency'),
      );
    }
  }

  // ---------- Confidence range ----------
  const sourcesUsed: Source[] = isNew
    ? [...(metaEst ? [metaEst.source] : []), ...(googleNew && input.estimates?.google ? sourcesOfGoogle(input.estimates.google) : [])]
    : ['accounts'];
  const range = s.rangeMultipliers[lowestConfidence(sourcesUsed.length ? sourcesUsed : ['guess'])];
  const fixedBudget = input.goalType === 'budget';

  // ---------- New account test plan (9.6) ----------
  let newAccount: PlanResult['newAccount'];
  if (isNew) {
    const expectedCost = metaEst?.expected ?? googleNew?.expectedCPA ?? 0;
    const test = testPlan({
      type,
      maxCost: costLimits.max,
      targetCost: costLimits.target,
      expectedCost,
      leadToClient,
      atcToPurchase: input.estimates?.meta?.atcToPurchaseRate?.value,
      availableBudget: input.monthlyBudget,
      creatives: input.planning.creatives,
      testDays: input.planning.testDays,
      settings: s,
    });
    steps.push(...test.steps);
    if (test.creativeExceedsTest) warn('creativeExceedsTest', 'warning');
    if (test.optionB?.recommended) warn('optionB', 'info');
    if (test.testClients !== undefined) warn('testClientsFew', 'info', { clients: Math.round(test.testClients * 10) / 10 });
    const blended = cpa || expectedCost;
    const scaleResults = fixedBudget ? results : required;
    newAccount = {
      meta: metaEst,
      google: googleNew,
      test,
      viability: viability(blended, blended * range.high, costLimits.max),
      biggestAssumption: biggestAssumption(input),
      scaleEstimate: {
        results: scaleResults,
        low: scaleResults * blended * range.low,
        expected: scaleResults * blended,
        high: scaleResults * blended * range.high,
      },
    };
  }

  const budget: PlanResult['budget'] = {
    monthly,
    daily: toDaily(monthly),
    low: fixedBudget ? monthly : monthly * range.low,
    high: fixedBudget ? monthly : monthly * range.high,
    results,
    resultsLow: fixedBudget ? div(results, range.high) : results,
    resultsHigh: fixedBudget ? div(results, range.low) : results,
    cpa,
    roas: 0,
    revenue: 0,
    reachable,
    isEstimate: isNew,
  };
  const econ = economics(results, monthly, input, leadToClient);
  Object.assign(budget, econ);
  const delivery = deliveryFunnel(budget, limits, input, metaTotal, googleExisting);

  // ---------- Verdict ----------
  const verdict: Verdict = newAccount
    ? ({ viable: 'profitable', risky: 'optimize', notViable: 'notViable' } as const)[newAccount.viability]
    : cpa > 0 && cpa <= costLimits.target
      ? 'profitable'
      : cpa > 0 && cpa <= costLimits.max
        ? 'optimize'
        : 'notViable';

  // ---------- Split lines + learning (9.5, 9.8) ----------
  const alloc = platformSplit.alloc;
  const lines: SplitLine[] = [];
  let learning: LearningCheck | undefined;
  if (alloc.meta > 0 && curves.meta) {
    const metaLines = metaBreakdown({
      budget: alloc.meta,
      creatives: input.planning.creatives,
      targetCost: costLimits.target,
      isNew,
      includeRetargeting: input.planning.includeRetargeting,
      retargetingAudience: ex?.retargetingAudience,
      cpm: metaCPM,
      s,
    });
    lines.push(...metaLines);
    const prospecting = metaLines.find((l) => l.item === 'prospecting')?.amount ?? 0;
    const adSets = !isNew && ex?.metaCampaigns?.length ? effectiveAdSets(ex.metaCampaigns) : input.planning.adSets;
    const lc = metaLearningCheck({
      prospectingBudget: prospecting,
      cpa: projectedCPA(curves.meta, alloc.meta),
      adSets,
      threshold: s.learningThreshold,
      isEcommerce: type === 'ecommerce',
    });
    steps.push(...lc.steps);
    learning = lc;
    if (lc.limited) warn('learningLimited', 'warning', { adSets: 1 });
    if (lc.tooManyAdSets) warn('tooManyAdSets', 'warning', { current: adSets, supported: lc.supportedAdSets });
  }
  let googleLearning: PlanResult['googleLearning'];
  if (alloc.google > 0 && useCurves.google) {
    const brand = Boolean(isNew ? input.estimates?.google?.brandSearches : ex?.google?.brandSearches);
    lines.push(...googleBreakdown(alloc.google, brand, s));
    const gResults = allocationResults({ google: useCurves.google }, { meta: 0, google: alloc.google }) * (brand ? 1 - s.brandShare : 1);
    googleLearning = googleLearningCheck(gResults, 1, s.googleMinConversions);
    if (!googleLearning.ok) warn('googleMinConversions', 'warning', { perCampaign: Math.round(googleLearning.perCampaign), min: s.googleMinConversions });
    const cap = useCurves.google.cap;
    if (cap !== undefined && alloc.google >= cap - 1) warn('googleCeiling', 'warning', { ceiling: Math.round(cap) });
  }
  if (platformSplit.concentrated) warn('splitConcentrated', 'info');
  if (alloc.meta > 0 && alloc.google > 0) warn('doubleCounting', 'info');
  if (metaTotal && metaTotal.frequency > 5) warn('frequencyHigh', 'warning', { frequency: Math.round(metaTotal.frequency * 10) / 10 });

  const startDaily = isNew
    ? (newAccount?.test.testDaily ?? 0)
    : toDaily((metaTotal ? monthlySpend(metaTotal.spend, days) : 0) + (googleExisting?.monthlySpend ?? 0));
  const ramp = rampSchedule(startDaily, toDaily(monthly), s);

  // ---------- Scaling table ----------
  const maxCost = costLimits.max;
  const rows: ScalingRow[] = monthly > 0
    ? SCALING_MULTIPLIERS.map((m) => {
        const b = monthly * m;
        const a = split(b).alloc;
        const r = allocationResults(useCurves, a);
        const c = div(b, r);
        return { budget: b, results: r, cpa: c, ...economics(r, b, input, leadToClient), profitable: c > 0 && c <= maxCost };
      })
    : [];
  const profitableLimit = activePlatforms.length ? findProfitableLimit(useCurves, split, maxCost, monthly) : 0;

  return {
    input: { businessType: type, accountStatus: input.accountStatus, goalType: input.goalType, platforms: input.platforms },
    limits,
    costLimits,
    existing: isNew ? undefined : { meta: metaTotal ? { total: metaTotal, rows: metaRows.map((r) => metaMetrics(r, type, clientValue)) } : undefined, google: googleExisting, funnel },
    google: googleInfo,
    newAccount,
    budget,
    verdict,
    funnel: delivery,
    learning,
    googleLearning,
    split: { platforms: alloc, reasons: platformSplit.reasons, lines, ramp },
    scaling: { rows, profitableLimit },
    bottleneck: funnel && type === 'leads' ? bottleneck(funnel, input, results, monthly, resultsAt, curves, activePlatforms) : undefined,
    health: metaTotal ? health(metaTotal, type) : undefined,
    warnings,
    steps,
  };
}

function sourcesOfGoogle(g: NonNullable<NonNullable<PlanInput['estimates']>['google']>): Source[] {
  return [g.monthlySearches.source, g.bidLow.source, g.bidHigh.source, g.ctr.source, g.cvr.source];
}

/** Funnel stages for the recommended budget, with the same low/high spread as results. */
function deliveryFunnel(
  b: PlanResult['budget'],
  limits: Limits,
  input: PlanInput,
  meta: MetaMetrics | undefined,
  google: GoogleMetrics | undefined,
): FunnelStage[] {
  const lo = div(b.resultsLow, b.results) || 1;
  const hi = div(b.resultsHigh, b.results) || 1;
  const stage = (key: string, value: number, unit: FunnelStage['unit'] = 'number'): FunnelStage => ({ key, value, low: value * lo, high: value * hi, unit });
  if (limits.kind === 'leads') {
    const bookings = b.results * limits.bookingRate;
    const shows = bookings * limits.showRate;
    return [stage('leads', b.results), stage('bookings', bookings), stage('shows', shows), stage('clients', shows * limits.closeRate)];
  }
  const est = input.estimates;
  const clicksPerSale =
    meta && meta.results > 0 ? div(meta.linkClicks, meta.results)
      : google && google.results > 0 ? div(google.clicks, google.results)
        : est?.meta?.cvr?.value ? 1 / est.meta.cvr.value
          : est?.google?.cvr.value ? 1 / est.google.cvr.value
            : 0;
  const cartsPerSale = meta && meta.addToCarts > 0 && meta.results > 0 ? div(meta.addToCarts, meta.results) : est?.meta?.atcToPurchaseRate?.value ? 1 / est.meta.atcToPurchaseRate.value : 0;
  return [
    ...(clicksPerSale ? [stage('visits', b.results * clicksPerSale)] : []),
    ...(cartsPerSale ? [stage('carts', b.results * cartsPerSale)] : []),
    stage('purchases', b.results),
    stage('revenue', b.revenue, 'currency'),
  ];
}

/** Clients, CAC, revenue and ROAS for a number of platform results at a spend. */
function economics(results: number, spend: number, input: PlanInput, leadToClient: number) {
  if (input.businessType === 'leads') {
    const clients = results * leadToClient;
    const revenue = clients * (input.leads?.clientValue ?? 0);
    return { clients, cac: div(spend, clients), revenue, roas: div(revenue, spend) };
  }
  const revenue = results * (input.ecommerce?.aov ?? 0);
  return { revenue, roas: div(revenue, spend) };
}

/** Name of the estimate input with the lowest-confidence source (new accounts). */
function biggestAssumption(input: PlanInput): string | undefined {
  const items: Array<[string, Source]> = [];
  const m = input.estimates?.meta;
  if (m && input.platforms.includes('meta')) {
    items.push(['cpm', m.cpm.source], ['ctr', m.ctr.source]);
    const useForm = input.businessType === 'leads' && input.leads?.leadSource === 'form';
    const conv = useForm ? m.formCompletionRate : m.cvr;
    if (conv) items.push([useForm ? 'formCompletionRate' : 'cvr', conv.source]);
  }
  const g = input.estimates?.google;
  if (g && input.platforms.includes('google')) {
    items.push(['monthlySearches', g.monthlySearches.source], ['bidLow', g.bidLow.source], ['googleCtr', g.ctr.source], ['googleCvr', g.cvr.source]);
  }
  if (!items.length) return undefined;
  const worst = lowestConfidence(items.map(([, src]) => src));
  return items.find(([, src]) => src === worst)?.[0];
}

/** Highest total spend whose blended cost per result stays at or below the max. null = no limit found. */
function findProfitableLimit(curves: Curves, split: (t: number) => SplitResult, maxCost: number, around: number): number | null {
  const cpaAt = (t: number) => allocationCPA(curves, split(t).alloc);
  const start = Math.max(around, 100);
  if (cpaAt(1) > maxCost) return 0;
  let hi = start;
  while (cpaAt(hi) <= maxCost && hi < start * 1024) hi *= 2;
  if (cpaAt(hi) <= maxCost) return null;
  let lo = 0;
  for (let i = 0; i < 60 && hi - lo > 1; i++) {
    const mid = (lo + hi) / 2;
    if (cpaAt(mid) <= maxCost) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** 10.6 Weakest funnel stage and the budget saved (target goal) or clients gained (budget goal) at +10 points. */
function bottleneck(
  f: LeadFunnel,
  input: PlanInput,
  results: number,
  monthly: number,
  resultsAt: (t: number) => number,
  curves: Curves,
  platforms: Platform[],
): PlanResult['bottleneck'] {
  const rates = { booking: f.bookingRate, show: f.showRate, close: f.closeRate };
  const l2c = rates.booking * rates.show * rates.close;
  const stages: BottleneckStage[] = (Object.keys(rates) as BottleneckStage['stage'][]).map((stage) => {
    const rate = rates[stage];
    const improvedRate = Math.min(1, rate + BOTTLENECK_IMPROVEMENT);
    const newL2C = div(l2c, rate) * improvedRate;
    if (input.goalType === 'target' && platforms.length) {
      const req = div(input.targetResults ?? 0, newL2C);
      const firstCPA = curves[platforms[0] as Platform]?.baseCPA ?? 0;
      const newBudget = solveSpend(resultsAt, req, req * firstCPA);
      return { stage, rate, improvedRate, budgetSaved: Number.isFinite(newBudget) ? Math.max(0, monthly - newBudget) : 0 };
    }
    return { stage, rate, improvedRate, extraClients: results * (newL2C - l2c) };
  });
  const score = (st: BottleneckStage) => st.budgetSaved ?? st.extraClients ?? 0;
  const weakest = stages.reduce((a, b) => (score(b) > score(a) ? b : a)).stage;
  return { stages, weakest };
}

function flagHigh(v: number, [green, amber]: readonly [number, number]): HealthFlag {
  return v >= green ? 'green' : v >= amber ? 'amber' : 'red';
}

function health(m: MetaMetrics, type: PlanInput['businessType']): PlanResult['health'] {
  const [fGreen, fAmber] = HEALTH_THRESHOLDS.frequency;
  return {
    cpm: { value: m.cpm, flag: 'neutral' },
    ctr: { value: m.ctr, flag: flagHigh(m.ctr, HEALTH_THRESHOLDS.ctr) },
    cvr: { value: m.cvr, flag: flagHigh(m.cvr, type === 'leads' ? HEALTH_THRESHOLDS.cvrLeads : HEALTH_THRESHOLDS.cvrEcommerce) },
    frequency: { value: m.frequency, flag: m.frequency <= fGreen ? 'green' : m.frequency <= fAmber ? 'amber' : 'red' },
  };
}
