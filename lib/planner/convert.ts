import benchmarks from '@/data/benchmarks.json';
import { DEFAULT_SETTINGS, FIXTURES, type PlanInput, type Platform, type Profile, type Settings, type Source } from '@/lib/engine';
import { PERCENT_SETTINGS } from './fields';
import { profileOfNiche } from './options';
import type { CampaignRowForm, FormValues, MetaRowForm, Num } from './types';

const round = (x: number) => Math.round(x * 1e6) / 1e6;
const pct = (x: Num) => (x === undefined ? 0 : x / 100);
const toPct = (x: number | undefined): Num => (x === undefined ? undefined : round(x * 100));
const num = (x: Num) => x ?? 0;

// ---------- Settings ----------
export function settingsToForm(s: Settings): Settings {
  const out = structuredClone(s);
  for (const k of PERCENT_SETTINGS) out[k] = round(s[k] * 100);
  return out;
}

export function settingsFromForm(s: Settings): Settings {
  const out = structuredClone(s);
  for (const k of PERCENT_SETTINGS) out[k] = s[k] / 100;
  return out;
}

// ---------- Defaults ----------
export const emptyMetaRow = (country = ''): MetaRowForm => ({
  country,
  spend: undefined,
  impressions: undefined,
  reach: undefined,
  linkClicks: undefined,
  landingPageViews: undefined,
  formLeads: undefined,
  landingLeads: undefined,
  bookings: undefined,
  shows: undefined,
  clients: undefined,
  addToCarts: undefined,
  checkouts: undefined,
  purchases: undefined,
  purchaseValue: undefined,
});

export const emptyCampaign = (): CampaignRowForm => ({ name: '', budgetType: 'ABO', adSets: undefined, adSetsWithSpend: undefined });

const ESTIMATE_FIELD_IDS = ['eCpm', 'eCtr', 'eCvr', 'eFormRate', 'eAtcRate', 'gSearches', 'gBidLow', 'gBidHigh', 'gIS', 'gCtrNew', 'gCvrNew'];

export function defaultValues(): FormValues {
  return {
    businessType: 'leads',
    accountStatus: 'new',
    platforms: ['meta'],
    goalType: 'target',
    niche: '',
    regions: [],
    month: new Date().getMonth(),
    currency: 'USD',
    targetResults: undefined,
    monthlyBudget: undefined,
    clientValue: undefined,
    margin: undefined,
    bookingRate: undefined,
    showRate: undefined,
    closeRate: undefined,
    rateSource: 'estimate',
    leadSource: 'landing',
    aov: undefined,
    productCost: undefined,
    shipping: undefined,
    paymentFee: undefined,
    returnRate: undefined,
    ordersPerCustomer: undefined,
    judgeOn: 'first',
    days: 30,
    metaCampaigns: [emptyCampaign()],
    metaRows: [emptyMetaRow()],
    retargetingAudience: undefined,
    gCost: undefined,
    gImpressions: undefined,
    gClicks: undefined,
    gConversions: undefined,
    gConversionValue: undefined,
    gImpressionShare: undefined,
    gLostBudget: undefined,
    gLostRank: undefined,
    gBrand: false,
    eCpm: undefined,
    eCtr: undefined,
    eCvr: undefined,
    eFormRate: undefined,
    eAtcRate: undefined,
    eDailyMin: undefined,
    eDailyMax: undefined,
    eDailyBudget: undefined,
    gKeywords: [],
    gSearches: undefined,
    gBidLow: undefined,
    gBidHigh: undefined,
    gIS: undefined,
    gCtrNew: undefined,
    gCvrNew: undefined,
    gBrandNew: false,
    sources: Object.fromEntries(ESTIMATE_FIELD_IDS.map((id) => [id, 'benchmark' as Source])),
    adSets: 1,
    creatives: 3,
    testDays: 14,
    includeRetargeting: false,
    settings: settingsToForm(DEFAULT_SETTINGS),
  };
}

// ---------- Benchmarks ----------
type BenchRow = { profile: string; region: string; platform: string; cpm?: number; cpc?: number; ctr: number; cvr: number };

/** Placeholder default benchmark for a profile and platform (data/benchmarks.json). */
export function defaultBenchmark(profile: Profile, platform: Platform): BenchRow | undefined {
  return (benchmarks.rows as BenchRow[]).find((r) => r.profile === profile && r.platform === platform && r.region === 'default');
}

function benchmarkCPA(profile: Profile, platform: Platform) {
  const b = defaultBenchmark(profile, platform);
  if (!b || !b.ctr || !b.cvr) return undefined;
  return platform === 'meta' ? (b.cpm ?? 0) / (1000 * b.ctr * b.cvr) : (b.cpc ?? 0) / b.cvr;
}

// ---------- Form to engine ----------
const src = (v: FormValues, id: string): Source => v.sources[id] ?? 'guess';

export function toPlanInput(v: FormValues): PlanInput {
  const profile = profileOfNiche(v.niche) ?? (v.businessType === 'ecommerce' ? 'ecommerce' : 'leads');
  const isNew = v.accountStatus === 'new';
  return {
    businessType: v.businessType,
    accountStatus: v.accountStatus,
    platforms: v.platforms,
    goalType: v.goalType,
    targetResults: v.targetResults,
    monthlyBudget: v.monthlyBudget,
    month: v.month,
    profile,
    leads:
      v.businessType === 'leads'
        ? {
            clientValue: num(v.clientValue),
            margin: pct(v.margin),
            bookingRate: pct(v.bookingRate),
            showRate: pct(v.showRate),
            closeRate: pct(v.closeRate),
            rateSource: v.rateSource,
            leadSource: v.leadSource,
          }
        : undefined,
    ecommerce:
      v.businessType === 'ecommerce'
        ? {
            aov: num(v.aov),
            productCost: num(v.productCost),
            shipping: num(v.shipping),
            paymentFee: pct(v.paymentFee),
            returnRate: pct(v.returnRate),
            ordersPerCustomer: v.ordersPerCustomer,
            judgeOn: v.judgeOn,
          }
        : undefined,
    existing: isNew
      ? undefined
      : {
          days: num(v.days) || 30,
          metaCampaigns: v.metaCampaigns.map((c) => ({ name: c.name, budgetType: c.budgetType, adSets: c.adSets ?? 1, adSetsWithSpend: c.adSetsWithSpend })),
          metaRows: v.metaRows.map((r) => ({
            country: r.country,
            spend: num(r.spend),
            impressions: num(r.impressions),
            reach: num(r.reach),
            linkClicks: num(r.linkClicks),
            landingPageViews: r.landingPageViews,
            formLeads: v.leadSource !== 'landing' ? r.formLeads : 0,
            landingLeads: v.leadSource !== 'form' ? r.landingLeads : 0,
            bookings: r.bookings,
            shows: r.shows,
            clients: r.clients,
            addToCarts: r.addToCarts,
            checkouts: r.checkouts,
            purchases: r.purchases,
            purchaseValue: r.purchaseValue,
          })),
          retargetingAudience: v.retargetingAudience,
          google: v.platforms.includes('google')
            ? {
                cost: num(v.gCost),
                impressions: num(v.gImpressions),
                clicks: num(v.gClicks),
                conversions: num(v.gConversions),
                conversionValue: v.gConversionValue,
                impressionShare: pct(v.gImpressionShare),
                lostISBudget: pct(v.gLostBudget),
                lostISRank: pct(v.gLostRank),
                brandSearches: v.gBrand,
              }
            : undefined,
          benchmarkCPA: { meta: benchmarkCPA(profile, 'meta'), google: benchmarkCPA(profile, 'google') },
        },
    estimates: isNew
      ? {
          meta: v.platforms.includes('meta')
            ? {
                cpm: { value: num(v.eCpm), source: src(v, 'eCpm') },
                ctr: { value: pct(v.eCtr), source: src(v, 'eCtr') },
                cvr: v.eCvr !== undefined ? { value: pct(v.eCvr), source: src(v, 'eCvr') } : undefined,
                formCompletionRate: v.eFormRate !== undefined ? { value: pct(v.eFormRate), source: src(v, 'eFormRate') } : undefined,
                atcToPurchaseRate: v.eAtcRate !== undefined ? { value: pct(v.eAtcRate), source: src(v, 'eAtcRate') } : undefined,
              }
            : undefined,
          google: v.platforms.includes('google')
            ? {
                monthlySearches: { value: num(v.gSearches), source: src(v, 'gSearches') },
                bidLow: { value: num(v.gBidLow), source: src(v, 'gBidLow') },
                bidHigh: { value: num(v.gBidHigh), source: src(v, 'gBidHigh') },
                impressionShare: { value: pct(v.gIS), source: src(v, 'gIS') },
                ctr: { value: pct(v.gCtrNew), source: src(v, 'gCtrNew') },
                cvr: { value: pct(v.gCvrNew), source: src(v, 'gCvrNew') },
                brandSearches: v.gBrandNew,
              }
            : undefined,
        }
      : undefined,
    planning: {
      adSets: v.adSets ?? 1,
      creatives: v.creatives ?? 0,
      testDays: v.testDays ?? 14,
      includeRetargeting: v.includeRetargeting,
    },
    settings: settingsFromForm(v.settings),
  };
}

// ---------- Example data (fixtures to form) ----------
const EXAMPLE_NICHE = { leads: 'beautyClinic', ecommerce: 'fashion' } as const;

/** Form values for the example of the current business type and account status (brief 9.9 fixtures). */
export function exampleValues(current: FormValues): FormValues {
  const key = `${current.businessType}-${current.accountStatus}` as keyof typeof FIXTURES;
  const f = FIXTURES[key];
  const base = defaultValues();
  const v: FormValues = {
    ...base,
    businessType: f.businessType,
    accountStatus: f.accountStatus,
    platforms: f.platforms,
    goalType: f.goalType,
    niche: EXAMPLE_NICHE[f.businessType],
    regions: ['US'],
    currency: 'USD',
    month: current.month,
    targetResults: f.targetResults,
    settings: settingsToForm(f.settings),
  };
  if (f.leads) {
    Object.assign(v, {
      clientValue: f.leads.clientValue,
      margin: toPct(f.leads.margin),
      bookingRate: toPct(f.leads.bookingRate),
      showRate: toPct(f.leads.showRate),
      closeRate: toPct(f.leads.closeRate),
      rateSource: f.leads.rateSource ?? 'estimate',
      leadSource: f.leads.leadSource ?? 'landing',
    });
  }
  if (f.ecommerce) {
    Object.assign(v, {
      aov: f.ecommerce.aov,
      productCost: f.ecommerce.productCost,
      shipping: f.ecommerce.shipping,
      paymentFee: toPct(f.ecommerce.paymentFee),
      returnRate: toPct(f.ecommerce.returnRate),
      judgeOn: f.ecommerce.judgeOn ?? 'first',
    });
  }
  if (f.existing) {
    v.days = f.existing.days;
    v.metaCampaigns = (f.existing.metaCampaigns ?? []).map((c) => ({ name: c.name ?? '', budgetType: c.budgetType, adSets: c.adSets, adSetsWithSpend: c.adSetsWithSpend }));
    v.metaRows = (f.existing.metaRows ?? []).map((r) => ({ ...emptyMetaRow(r.country ?? ''), ...r, country: r.country ?? '' }));
  }
  const m = f.estimates?.meta;
  if (m) {
    v.eCpm = m.cpm.value;
    v.eCtr = toPct(m.ctr.value);
    v.eCvr = toPct(m.cvr?.value);
    v.eAtcRate = toPct(m.atcToPurchaseRate?.value);
    v.sources = { ...v.sources, eCpm: m.cpm.source, eCtr: m.ctr.source, ...(m.cvr ? { eCvr: m.cvr.source } : {}), ...(m.atcToPurchaseRate ? { eAtcRate: m.atcToPurchaseRate.source } : {}) };
  }
  return v;
}
