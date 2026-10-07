import { DAYS_PER_MONTH } from './constants';
import { div, step, val } from './steps';
import type { BusinessType, GoogleExisting, MetaRow, StepRecord } from './types';

export const monthlySpend = (spend: number, days: number) => div(spend, days) * DAYS_PER_MONTH;

export const rowResults = (r: MetaRow, type: BusinessType) =>
  type === 'leads' ? (r.formLeads ?? 0) + (r.landingLeads ?? 0) : (r.purchases ?? 0);

export type LeadFunnel = {
  leads: number;
  bookings: number;
  shows: number;
  clients: number;
  bookingRate: number;
  showRate: number;
  closeRate: number;
  costPerBooking: number;
  costPerShow: number;
  cac: number;
};

export function leadFunnel(spend: number, leads: number, bookings: number, shows: number, clients: number): LeadFunnel {
  return {
    leads,
    bookings,
    shows,
    clients,
    bookingRate: div(bookings, leads),
    showRate: div(shows, bookings),
    closeRate: div(clients, shows),
    costPerBooking: div(spend, bookings),
    costPerShow: div(spend, shows),
    cac: div(spend, clients),
  };
}

export type MetaMetrics = {
  country?: string;
  spend: number;
  impressions: number;
  reach: number;
  linkClicks: number;
  results: number;
  cpm: number;
  ctr: number;
  cpc: number;
  cvr: number;
  cpa: number;
  roas: number;
  frequency: number;
  revenue: number;
  addToCarts: number;
  checkouts: number;
  funnel?: LeadFunnel;
};

/** 9.2 metrics for one Meta row (or a summed total row). */
export function metaMetrics(r: MetaRow, type: BusinessType, clientValue = 0): MetaMetrics {
  const results = rowResults(r, type);
  const hasCrm = type === 'leads' && (r.bookings ?? 0) > 0;
  const funnel = hasCrm ? leadFunnel(r.spend, results, r.bookings ?? 0, r.shows ?? 0, r.clients ?? 0) : undefined;
  const revenue = type === 'leads' ? (r.clients ?? 0) * clientValue : (r.purchaseValue ?? 0);
  return {
    country: r.country,
    spend: r.spend,
    impressions: r.impressions,
    reach: r.reach,
    linkClicks: r.linkClicks,
    results,
    cpm: div(r.spend, r.impressions) * 1000,
    ctr: div(r.linkClicks, r.impressions),
    cpc: div(r.spend, r.linkClicks),
    cvr: div(results, r.linkClicks),
    cpa: div(r.spend, results),
    roas: div(revenue, r.spend),
    frequency: div(r.impressions, r.reach),
    revenue,
    addToCarts: r.addToCarts ?? 0,
    checkouts: r.checkouts ?? 0,
    funnel,
  };
}

const NUMERIC_KEYS = [
  'spend', 'impressions', 'reach', 'linkClicks', 'landingPageViews', 'formLeads', 'landingLeads',
  'bookings', 'shows', 'clients', 'addToCarts', 'checkouts', 'purchases', 'purchaseValue',
] as const;

/** Sums country rows. Reach is summed too (an upper bound, since audiences can overlap). */
export function sumRows(rows: MetaRow[]): MetaRow {
  const total: MetaRow = { spend: 0, impressions: 0, reach: 0, linkClicks: 0 };
  for (const r of rows) for (const k of NUMERIC_KEYS) total[k] = (total[k] ?? 0) + (r[k] ?? 0);
  return total;
}

export function metaMetricSteps(m: MetaMetrics, days: number, type: BusinessType): StepRecord[] {
  const resultKey = type === 'leads' ? 'leads' : 'purchases';
  return [
    step('actualCPA', [val('spend', m.spend, 'currency'), val(resultKey, m.results, 'number')], m.cpa, 'currency'),
    step('cpm', [val('spend', m.spend, 'currency'), val('impressions', m.impressions, 'number')], m.cpm, 'currency'),
    step('ctr', [val('linkClicks', m.linkClicks, 'number'), val('impressions', m.impressions, 'number')], m.ctr, 'percent'),
    step('frequency', [val('impressions', m.impressions, 'number'), val('reach', m.reach, 'number')], m.frequency, 'number'),
    step('monthlyBaseSpend', [val('spend', m.spend, 'currency'), val('days', days, 'days')], monthlySpend(m.spend, days), 'currency'),
  ];
}

export type GoogleMetrics = {
  spend: number;
  monthlySpend: number;
  impressions: number;
  clicks: number;
  results: number;
  ctr: number;
  cpc: number;
  cvr: number;
  cpa: number;
  roas: number;
};

export function googleMetrics(g: GoogleExisting, days: number, type: BusinessType, clientValue = 0, leadToClient = 0): GoogleMetrics {
  const revenue = type === 'leads' ? g.conversions * leadToClient * clientValue : (g.conversionValue ?? 0);
  return {
    spend: g.cost,
    monthlySpend: monthlySpend(g.cost, days),
    impressions: g.impressions,
    clicks: g.clicks,
    results: g.conversions,
    ctr: div(g.clicks, g.impressions),
    cpc: div(g.cost, g.clicks),
    cvr: div(g.conversions, g.clicks),
    cpa: div(g.cost, g.conversions),
    roas: div(revenue, g.cost),
  };
}
