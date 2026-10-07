import { DEFAULT_SETTINGS } from './constants';
import type { PlanInput } from './types';

/** Example inputs per mode (brief 9.9). Used by unit tests and "Load example data". */

const planning = { adSets: 1, creatives: 3, testDays: 14, includeRetargeting: false };

export const FIXTURE_EXISTING_LEADS: PlanInput = {
  businessType: 'leads',
  accountStatus: 'existing',
  platforms: ['meta'],
  goalType: 'target',
  targetResults: 25,
  profile: 'leads',
  leads: { clientValue: 600, margin: 0.6, bookingRate: 0.4, showRate: 0.7, closeRate: 0.6, rateSource: 'crm', leadSource: 'landing' },
  existing: {
    days: 30,
    metaCampaigns: [{ name: 'Leads', budgetType: 'ABO', adSets: 1 }],
    metaRows: [
      { country: 'US', spend: 2000, impressions: 100000, reach: 45000, linkClicks: 1200, landingPageViews: 1000, landingLeads: 80, bookings: 32, shows: 22, clients: 13 },
    ],
  },
  planning,
  settings: { ...DEFAULT_SETTINGS, scalingPenalty: 0.15 },
};

export const FIXTURE_EXISTING_ECOMMERCE: PlanInput = {
  businessType: 'ecommerce',
  accountStatus: 'existing',
  platforms: ['meta'],
  goalType: 'target',
  targetResults: 200,
  profile: 'ecommerce',
  // Margin 50% on a 90 AOV is expressed as a 45 product cost.
  ecommerce: { aov: 90, productCost: 45, shipping: 0, paymentFee: 0, returnRate: 0, judgeOn: 'first' },
  existing: {
    days: 30,
    metaCampaigns: [{ name: 'Sales', budgetType: 'CBO', adSets: 3, adSetsWithSpend: 2 }],
    metaRows: [
      { country: 'US', spend: 3000, impressions: 250000, reach: 90000, linkClicks: 3750, landingPageViews: 3200, addToCarts: 400, checkouts: 180, purchases: 100, purchaseValue: 9000 },
    ],
  },
  planning,
  settings: { ...DEFAULT_SETTINGS, profitBuffer: 0.25 },
};

export const FIXTURE_NEW_LEADS: PlanInput = {
  businessType: 'leads',
  accountStatus: 'new',
  platforms: ['meta'],
  goalType: 'target',
  targetResults: 20,
  profile: 'leads',
  leads: { clientValue: 600, margin: 0.6, bookingRate: 0.35, showRate: 0.65, closeRate: 0.5, rateSource: 'estimate', leadSource: 'landing' },
  estimates: {
    meta: {
      cpm: { value: 20, source: 'benchmark' },
      ctr: { value: 0.012, source: 'benchmark' },
      cvr: { value: 0.08, source: 'guess' },
    },
  },
  planning,
  settings: { ...DEFAULT_SETTINGS, newAccountPenalty: 0.25 },
};

export const FIXTURE_NEW_ECOMMERCE: PlanInput = {
  businessType: 'ecommerce',
  accountStatus: 'new',
  platforms: ['meta'],
  goalType: 'target',
  targetResults: 100,
  profile: 'ecommerce',
  ecommerce: { aov: 60, productCost: 18, shipping: 5, paymentFee: 0.03, returnRate: 0.1, judgeOn: 'first' },
  estimates: {
    meta: {
      cpm: { value: 15, source: 'benchmark' },
      ctr: { value: 0.015, source: 'benchmark' },
      cvr: { value: 0.02, source: 'benchmark' },
      atcToPurchaseRate: { value: 0.3, source: 'guess' },
    },
  },
  planning,
  settings: DEFAULT_SETTINGS,
};

export const FIXTURES = {
  'leads-existing': FIXTURE_EXISTING_LEADS,
  'ecommerce-existing': FIXTURE_EXISTING_ECOMMERCE,
  'leads-new': FIXTURE_NEW_LEADS,
  'ecommerce-new': FIXTURE_NEW_ECOMMERCE,
} as const;
