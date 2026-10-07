import type { Source } from '@/lib/engine';
import type { Mode, TabId } from './types';

/**
 * Single source of truth for every planner field. Tabs, the generic Field component and the Zod schema
 * are all generated from these definitions. Copy lives in planner.fields.<labelKey ?? id>.{label,tooltip}.
 */

export type FieldKind =
  | 'currency'
  | 'number'
  | 'integer'
  | 'percent'
  | 'select'
  | 'toggle'
  | 'tags'
  | 'month'
  | 'niche'
  | 'regions'
  | 'currencyCode'
  | 'text';

type Pred = (m: Mode) => boolean;

export type FieldDef = {
  /** Form path (dot notation for nested settings). */
  id: string;
  tab: TabId;
  kind: FieldKind;
  /** Section heading key: planner.groups.<group>. */
  group?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean | Pred;
  show?: Pred;
  options?: readonly string[];
  /** Estimate fields carry a source label select. */
  source?: boolean;
  /** Example value shown as placeholder. */
  example?: number;
  /** Copy key when it differs from id. */
  labelKey?: string;
  labelParams?: Record<string, string>;
  /** Label variant by mode: planner.fields.<key>.label_<variant>. */
  labelVariant?: (m: Mode) => string;
};

export type RowFieldDef = Omit<FieldDef, 'tab' | 'show'> & { show?: (m: Mode, row: Record<string, unknown>) => boolean };

// ---------- Predicates ----------
export const is = {
  leads: (m: Mode) => m.businessType === 'leads',
  ecom: (m: Mode) => m.businessType === 'ecommerce',
  newAcc: (m: Mode) => m.accountStatus === 'new',
  existing: (m: Mode) => m.accountStatus === 'existing',
  meta: (m: Mode) => m.platforms.includes('meta'),
  google: (m: Mode) => m.platforms.includes('google'),
  target: (m: Mode) => m.goalType === 'target',
  budget: (m: Mode) => m.goalType === 'budget',
};
const all = (...ps: Pred[]): Pred => (m) => ps.every((p) => p(m));

// ---------- Simple fields ----------
export const FIELDS: FieldDef[] = [
  // Setup
  { id: 'niche', tab: 'setup', kind: 'niche', required: true },
  { id: 'regions', tab: 'setup', kind: 'regions', required: true },
  { id: 'month', tab: 'setup', kind: 'month', required: true },
  { id: 'currency', tab: 'setup', kind: 'currencyCode', required: true },
  { id: 'targetResults', tab: 'setup', kind: 'integer', min: 1, required: true, show: is.target, example: 25, labelVariant: (m) => m.businessType },
  { id: 'monthlyBudget', tab: 'setup', kind: 'currency', min: 1, required: true, show: is.budget, example: 3000 },

  // Business numbers: leads
  { id: 'clientValue', tab: 'business', kind: 'currency', min: 0.01, required: true, show: is.leads, example: 600 },
  { id: 'margin', tab: 'business', kind: 'percent', min: 1, max: 100, required: true, show: is.leads, example: 60 },
  { id: 'bookingRate', tab: 'business', kind: 'percent', min: 0, max: 100, required: is.newAcc, show: is.leads, example: 35 },
  { id: 'showRate', tab: 'business', kind: 'percent', min: 0, max: 100, required: is.newAcc, show: is.leads, example: 65 },
  { id: 'closeRate', tab: 'business', kind: 'percent', min: 0, max: 100, required: is.newAcc, show: is.leads, example: 50 },
  { id: 'rateSource', tab: 'business', kind: 'select', options: ['crm', 'estimate', 'default'], required: true, show: is.leads },
  { id: 'leadSource', tab: 'business', kind: 'select', options: ['form', 'landing', 'both'], required: true, show: is.leads },

  // Business numbers: ecommerce
  { id: 'aov', tab: 'business', kind: 'currency', min: 0.01, required: true, show: is.ecom, example: 60 },
  { id: 'productCost', tab: 'business', kind: 'currency', min: 0, required: true, show: is.ecom, example: 18 },
  { id: 'shipping', tab: 'business', kind: 'currency', min: 0, required: true, show: is.ecom, example: 5 },
  { id: 'paymentFee', tab: 'business', kind: 'percent', min: 0, max: 20, required: true, show: is.ecom, example: 3 },
  { id: 'returnRate', tab: 'business', kind: 'percent', min: 0, max: 80, required: true, show: is.ecom, example: 10 },
  { id: 'ordersPerCustomer', tab: 'business', kind: 'number', min: 1, step: 0.1, show: is.ecom, example: 1.5 },
  { id: 'judgeOn', tab: 'business', kind: 'select', options: ['first', 'lifetime'], required: true, show: is.ecom },

  // Account data (existing accounts)
  { id: 'days', tab: 'account', kind: 'integer', min: 7, max: 365, required: true, show: is.existing, example: 30 },
  { id: 'retargetingAudience', tab: 'account', kind: 'integer', min: 0, group: 'metaPerformance', show: all(is.existing, is.meta), example: 15000 },
  { id: 'gCost', tab: 'account', kind: 'currency', min: 0, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 1500 },
  { id: 'gImpressions', tab: 'account', kind: 'integer', min: 0, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 20000 },
  { id: 'gClicks', tab: 'account', kind: 'integer', min: 0, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 900 },
  { id: 'gConversions', tab: 'account', kind: 'number', min: 0, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 45 },
  { id: 'gConversionValue', tab: 'account', kind: 'currency', min: 0, group: 'googlePerformance', show: all(is.existing, is.google, is.ecom), example: 4000 },
  { id: 'gImpressionShare', tab: 'account', kind: 'percent', min: 0.1, max: 100, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 55 },
  { id: 'gLostBudget', tab: 'account', kind: 'percent', min: 0, max: 100, required: true, group: 'googlePerformance', show: all(is.existing, is.google), example: 25 },
  { id: 'gLostRank', tab: 'account', kind: 'percent', min: 0, max: 100, group: 'googlePerformance', show: all(is.existing, is.google), example: 20 },
  { id: 'gBrand', tab: 'account', kind: 'toggle', group: 'googlePerformance', show: all(is.existing, is.google) },

  // Estimates (new accounts): Meta
  { id: 'eCpm', tab: 'estimates', kind: 'currency', min: 0.01, required: true, source: true, group: 'metaEstimates', show: all(is.newAcc, is.meta), example: 15 },
  { id: 'eCtr', tab: 'estimates', kind: 'percent', min: 0.01, max: 100, step: 0.1, required: true, source: true, group: 'metaEstimates', show: all(is.newAcc, is.meta), example: 1.2 },
  {
    id: 'eCvr',
    tab: 'estimates',
    kind: 'percent',
    min: 0.01,
    max: 100,
    step: 0.1,
    required: true,
    source: true,
    group: 'metaEstimates',
    show: (m) => is.newAcc(m) && is.meta(m) && (is.ecom(m) || m.leadSource !== 'form'),
    labelVariant: (m) => m.businessType,
    example: 8,
  },
  { id: 'eFormRate', tab: 'estimates', kind: 'percent', min: 0.01, max: 100, step: 0.1, required: true, source: true, group: 'metaEstimates', show: (m) => is.newAcc(m) && is.meta(m) && is.leads(m) && m.leadSource === 'form', example: 10 },
  { id: 'eAtcRate', tab: 'estimates', kind: 'percent', min: 0.01, max: 100, step: 0.1, source: true, group: 'metaEstimates', show: all(is.newAcc, is.meta, is.ecom), example: 30 },
  { id: 'eDailyMin', tab: 'estimates', kind: 'number', min: 0, group: 'metaCrossCheck', show: all(is.newAcc, is.meta), example: 2 },
  { id: 'eDailyMax', tab: 'estimates', kind: 'number', min: 0, group: 'metaCrossCheck', show: all(is.newAcc, is.meta), example: 6 },
  { id: 'eDailyBudget', tab: 'estimates', kind: 'currency', min: 0, group: 'metaCrossCheck', show: all(is.newAcc, is.meta), example: 50 },

  // Estimates (new accounts): Google
  { id: 'gKeywords', tab: 'estimates', kind: 'tags', group: 'googleEstimates', show: all(is.newAcc, is.google) },
  { id: 'gSearches', tab: 'estimates', kind: 'integer', min: 0, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 8000 },
  { id: 'gBidLow', tab: 'estimates', kind: 'currency', min: 0.01, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 1.5 },
  { id: 'gBidHigh', tab: 'estimates', kind: 'currency', min: 0.01, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 4 },
  { id: 'gIS', tab: 'estimates', kind: 'percent', min: 1, max: 100, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 50 },
  { id: 'gCtrNew', tab: 'estimates', kind: 'percent', min: 0.01, max: 100, step: 0.1, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 5 },
  { id: 'gCvrNew', tab: 'estimates', kind: 'percent', min: 0.01, max: 100, step: 0.1, required: true, source: true, group: 'googleEstimates', show: all(is.newAcc, is.google), example: 8 },
  { id: 'gBrandNew', tab: 'estimates', kind: 'toggle', group: 'googleEstimates', show: all(is.newAcc, is.google) },

  // Planning
  { id: 'adSets', tab: 'planning', kind: 'integer', min: 1, max: 50, required: true, show: is.meta, example: 2 },
  { id: 'creatives', tab: 'planning', kind: 'integer', min: 0, max: 50, required: true, show: is.meta, example: 4 },
  { id: 'testDays', tab: 'planning', kind: 'integer', min: 3, max: 60, required: true, show: is.newAcc, example: 14 },
  { id: 'includeRetargeting', tab: 'planning', kind: 'toggle', show: is.meta },
];

// ---------- Repeating rows (Account Data tab) ----------
export const CAMPAIGN_FIELDS: RowFieldDef[] = [
  { id: 'name', kind: 'text', labelKey: 'campaignName' },
  { id: 'budgetType', kind: 'select', options: ['CBO', 'ABO', 'ADVANTAGE'], required: true },
  { id: 'adSets', kind: 'integer', min: 1, required: true, labelKey: 'campaignAdSets', example: 3 },
  { id: 'adSetsWithSpend', kind: 'integer', min: 0, labelKey: 'adSetsWithSpend', example: 2, show: (_m, row) => row.budgetType === 'CBO' },
];

export const META_ROW_FIELDS: RowFieldDef[] = [
  { id: 'country', kind: 'text', labelKey: 'rowCountry' },
  { id: 'spend', kind: 'currency', min: 0, required: true, example: 2000 },
  { id: 'impressions', kind: 'integer', min: 0, required: true, example: 150000 },
  { id: 'reach', kind: 'integer', min: 0, required: true, example: 60000 },
  { id: 'linkClicks', kind: 'integer', min: 0, required: true, example: 1800 },
  { id: 'landingPageViews', kind: 'integer', min: 0, example: 1500 },
  { id: 'formLeads', kind: 'integer', min: 0, required: true, example: 60, show: (m) => is.leads(m) && m.leadSource !== 'landing' },
  { id: 'landingLeads', kind: 'integer', min: 0, required: true, example: 40, show: (m) => is.leads(m) && m.leadSource !== 'form' },
  { id: 'bookings', kind: 'integer', min: 0, example: 32, show: is.leads },
  { id: 'shows', kind: 'integer', min: 0, example: 22, show: is.leads },
  { id: 'clients', kind: 'integer', min: 0, example: 13, show: is.leads },
  { id: 'addToCarts', kind: 'integer', min: 0, example: 400, show: is.ecom },
  { id: 'checkouts', kind: 'integer', min: 0, example: 180, show: is.ecom },
  { id: 'purchases', kind: 'integer', min: 0, required: true, example: 100, show: is.ecom },
  { id: 'purchaseValue', kind: 'currency', min: 0, required: true, example: 9000, show: is.ecom },
];

// ---------- Advanced settings ----------
const SOURCES: Source[] = ['accounts', 'metaEstimate', 'benchmark', 'guess'];

export const SETTING_FIELDS: FieldDef[] = [
  { id: 'settings.learningThreshold', tab: 'advanced', kind: 'integer', min: 1, required: true, group: 'learning' },
  { id: 'settings.googleMinConversions', tab: 'advanced', kind: 'integer', min: 1, required: true, group: 'learning' },
  { id: 'settings.minResultsForConfidence', tab: 'advanced', kind: 'integer', min: 1, required: true, group: 'learning' },
  { id: 'settings.scalingPenalty', tab: 'advanced', kind: 'percent', min: 0, max: 100, required: true, group: 'costs' },
  { id: 'settings.profitBuffer', tab: 'advanced', kind: 'percent', min: 0, max: 100, required: true, group: 'costs' },
  { id: 'settings.newAccountPenalty', tab: 'advanced', kind: 'percent', min: 0, max: 100, required: true, group: 'costs' },
  { id: 'settings.creativeTestMultiplier', tab: 'advanced', kind: 'number', min: 0, step: 0.1, required: true, group: 'testing' },
  { id: 'settings.scaleThreshold', tab: 'advanced', kind: 'percent', min: 1, max: 100, required: true, group: 'testing' },
  { id: 'settings.stopLossLow', tab: 'advanced', kind: 'number', min: 0, step: 0.5, required: true, group: 'testing' },
  { id: 'settings.stopLossHigh', tab: 'advanced', kind: 'number', min: 0, step: 0.5, required: true, group: 'testing' },
  { id: 'settings.retargetingViewsPerMonth', tab: 'advanced', kind: 'number', min: 0, required: true, group: 'retargeting' },
  { id: 'settings.retargetingCap', tab: 'advanced', kind: 'percent', min: 0, max: 100, required: true, group: 'retargeting' },
  { id: 'settings.minRetargetingAudience', tab: 'advanced', kind: 'integer', min: 0, required: true, group: 'retargeting' },
  { id: 'settings.brandShare', tab: 'advanced', kind: 'percent', min: 0, max: 100, required: true, group: 'budgetSteps' },
  { id: 'settings.maxStepIncrease', tab: 'advanced', kind: 'percent', min: 1, max: 100, required: true, group: 'budgetSteps' },
  { id: 'settings.stepDays', tab: 'advanced', kind: 'integer', min: 1, max: 30, required: true, group: 'budgetSteps' },
  ...SOURCES.flatMap((src): FieldDef[] => [
    { id: `settings.rangeMultipliers.${src}.low`, tab: 'advanced', kind: 'number', min: 0.1, max: 1, step: 0.05, required: true, group: 'ranges', labelKey: 'rangeLow', labelParams: { source: src } },
    { id: `settings.rangeMultipliers.${src}.high`, tab: 'advanced', kind: 'number', min: 1, max: 5, step: 0.05, required: true, group: 'ranges', labelKey: 'rangeHigh', labelParams: { source: src } },
  ]),
];

/** Settings stored as 0 to 100 in the form. */
export const PERCENT_SETTINGS = ['scalingPenalty', 'profitBuffer', 'newAccountPenalty', 'scaleThreshold', 'retargetingCap', 'brandShare', 'maxStepIncrease'] as const;

export const ESTIMATE_SOURCES = SOURCES;

export const ALL_FIELDS = [...FIELDS, ...SETTING_FIELDS];

export const fieldById = (id: string) => ALL_FIELDS.find((f) => f.id === id);

export const isVisible = (f: { show?: Pred }, m: Mode) => (f.show ? f.show(m) : true);
export const isRequired = (f: { required?: boolean | Pred }, m: Mode) => (typeof f.required === 'function' ? f.required(m) : Boolean(f.required));

/** Tabs shown for a mode, in order. */
export function visibleTabs(m: Mode): TabId[] {
  return (['setup', 'business', 'account', 'estimates', 'planning', 'advanced'] as TabId[]).filter((t) =>
    t === 'account' ? is.existing(m) : t === 'estimates' ? is.newAcc(m) : true,
  );
}
