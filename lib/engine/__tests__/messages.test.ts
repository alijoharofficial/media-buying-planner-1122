import { describe, expect, it } from 'vitest';
import results from '@/messages/en/results.json';
import {
  buildPlan,
  FIXTURE_EXISTING_ECOMMERCE,
  FIXTURE_EXISTING_LEADS,
  FIXTURE_NEW_ECOMMERCE,
  FIXTURE_NEW_LEADS,
  type PlanInput,
} from '@/lib/engine';

const google = {
  monthlySearches: { value: 20000, source: 'benchmark' as const },
  bidLow: { value: 2, source: 'benchmark' as const },
  bidHigh: { value: 4, source: 'guess' as const },
  impressionShare: { value: 0.5, source: 'guess' as const },
  ctr: { value: 0.05, source: 'benchmark' as const },
  cvr: { value: 0.1, source: 'benchmark' as const },
  brandSearches: true,
};

const variants: PlanInput[] = [
  FIXTURE_EXISTING_LEADS,
  FIXTURE_EXISTING_ECOMMERCE,
  FIXTURE_NEW_LEADS,
  FIXTURE_NEW_ECOMMERCE,
  { ...FIXTURE_NEW_LEADS, leads: { ...FIXTURE_NEW_LEADS.leads!, leadSource: 'form' }, estimates: { meta: { ...FIXTURE_NEW_LEADS.estimates!.meta!, formCompletionRate: { value: 0.12, source: 'guess' } } } },
  { ...FIXTURE_NEW_LEADS, platforms: ['meta', 'google'], goalType: 'budget', monthlyBudget: 6000, estimates: { ...FIXTURE_NEW_LEADS.estimates, google } },
  { ...FIXTURE_NEW_ECOMMERCE, platforms: ['google'], estimates: { google }, month: 10, goalType: 'budget', monthlyBudget: 500 },
  {
    ...FIXTURE_EXISTING_ECOMMERCE,
    platforms: ['meta', 'google'],
    planning: { adSets: 6, creatives: 4, testDays: 14, includeRetargeting: true },
    existing: {
      ...FIXTURE_EXISTING_ECOMMERCE.existing!,
      retargetingAudience: 20000,
      metaRows: [...FIXTURE_EXISTING_ECOMMERCE.existing!.metaRows!, { country: 'GB', spend: 300, impressions: 20000, reach: 3000, linkClicks: 200, purchases: 8, purchaseValue: 700 }],
      google: { cost: 1000, impressions: 20000, clicks: 800, conversions: 20, conversionValue: 1800, impressionShare: 0.5, lostISBudget: 0.2, brandSearches: true },
    },
  },
  { ...FIXTURE_EXISTING_LEADS, goalType: 'budget', monthlyBudget: 900, existing: { ...FIXTURE_EXISTING_LEADS.existing!, metaCampaigns: [{ budgetType: 'CBO', adSets: 4, adSetsWithSpend: 3 }] } },
];

const R = results as unknown as Record<string, Record<string, unknown>>;
const has = (obj: unknown, path: string) => path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj) !== undefined;

describe('every engine output has English copy', () => {
  const plans = variants.map(buildPlan);

  it('steps, formulas and value labels', () => {
    for (const p of plans)
      for (const s of p.steps) {
        for (const k of ['title', 'desc', 'formula']) expect(has(R.steps, `${s.id}.${k}`), `steps.${s.id}.${k}`).toBe(true);
        for (const v of s.inputs) expect(has(R.values, v.key), `values.${v.key}`).toBe(true);
        const formula = (R.steps as Record<string, { formula: string }>)[s.id]?.formula ?? '';
        for (const m of formula.matchAll(/\{(\w+)\}/g)) expect(s.inputs.some((v) => v.key === m[1]), `${s.id} placeholder ${m[1]}`).toBe(true);
      }
  });

  it('warnings, split reasons, funnel stages and assumptions', () => {
    for (const p of plans) {
      for (const w of p.warnings) expect(has(R.warnings, `codes.${w.code}`), `warnings.codes.${w.code}`).toBe(true);
      for (const l of p.split.lines) expect(has(R.split, `reasons.${l.reason}`), `split.reasons.${l.reason}`).toBe(true);
      for (const r of Object.values(p.split.reasons)) expect(has(R.split, `platformReasons.${r}`), `platformReasons.${r}`).toBe(true);
      for (const st of p.funnel) expect(has(R.deliver, `stages.${st.key}`), `stages.${st.key}`).toBe(true);
      if (p.newAccount?.biggestAssumption) expect(has(R.decision, `assumptionFields.${p.newAccount.biggestAssumption}`)).toBe(true);
    }
  });
});
