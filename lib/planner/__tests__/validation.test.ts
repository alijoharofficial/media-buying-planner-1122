import { describe, expect, it } from 'vitest';
import { buildPlan, FIXTURE_EXISTING_LEADS } from '@/lib/engine';
import { defaultValues, exampleValues, toPlanInput } from '@/lib/planner/convert';
import { aggregateGoogle, aggregateMeta, autoMap, parseCell, parseCsv } from '@/lib/planner/csv';
import { sanitizeValues } from '@/lib/planner/storage';
import type { FormValues } from '@/lib/planner/types';
import { validate } from '@/lib/planner/validation';

const modes: Array<Pick<FormValues, 'businessType' | 'accountStatus'>> = [
  { businessType: 'leads', accountStatus: 'existing' },
  { businessType: 'leads', accountStatus: 'new' },
  { businessType: 'ecommerce', accountStatus: 'existing' },
  { businessType: 'ecommerce', accountStatus: 'new' },
];

describe('planner validation', () => {
  it('flags required fields on an empty form', () => {
    const { errors } = validate(defaultValues());
    const codes = new Set(errors.map((e) => `${e.path}:${e.code}`));
    expect(codes.has('niche:required')).toBe(true);
    expect(codes.has('regions:required')).toBe(true);
    expect(codes.has('clientValue:required')).toBe(true);
    expect(errors.find((e) => e.path === 'eCpm')?.tab).toBe('estimates');
  });

  it.each(modes)('example data for %o is valid and matches the engine fixture', (m) => {
    const v = exampleValues({ ...defaultValues(), ...m });
    const { errors } = validate(v);
    expect(errors).toEqual([]);
    expect(buildPlan(toPlanInput(v)).budget.monthly).toBeGreaterThan(0);
  });

  it('example existing leads reproduces the 9.9 budget', () => {
    const v = exampleValues({ ...defaultValues(), businessType: 'leads', accountStatus: 'existing' });
    expect(buildPlan(toPlanInput(v)).budget.monthly).toBeCloseTo(buildPlan(FIXTURE_EXISTING_LEADS).budget.monthly, 2);
  });

  it('applies cross-field rules', () => {
    const v = exampleValues({ ...defaultValues(), businessType: 'leads', accountStatus: 'existing' });
    const row = v.metaRows[0];
    if (!row) throw new Error('no row');
    row.reach = (row.impressions ?? 0) + 1;
    row.clients = (row.shows ?? 0) + 1;
    const codes = validate(v).errors.map((e) => e.code);
    expect(codes).toContain('reachGtImpressions');
    expect(codes).toContain('clientsGtShows');
  });

  it('blocks ecommerce with no profit and range-checks percentages', () => {
    const v = exampleValues({ ...defaultValues(), businessType: 'ecommerce', accountStatus: 'new' });
    v.productCost = 60;
    v.returnRate = 120;
    const issues = validate(v).errors;
    expect(issues.find((e) => e.path === 'productCost')?.code).toBe('costsGteAov');
    expect(issues.find((e) => e.path === 'returnRate')).toMatchObject({ code: 'range', params: { min: 0, max: 80 } });
  });

  it('raises soft warnings without blocking', () => {
    const v = exampleValues({ ...defaultValues(), businessType: 'ecommerce', accountStatus: 'new' });
    v.eCtr = 12;
    const r = validate(v);
    expect(r.errors).toEqual([]);
    expect(r.warnings.map((w) => w.code)).toContain('ctrHigh');
  });

  it('sanitizes shared values to known keys', () => {
    const v = sanitizeValues({ businessType: 'ecommerce', evil: '<script>', margin: 'x', aov: 50 });
    expect(v.businessType).toBe('ecommerce');
    expect(v.aov).toBe(50);
    expect(v.margin).toBeUndefined();
    expect('evil' in v).toBe(false);
  });
});

describe('csv import', () => {
  it('maps and aggregates a Meta export by country', () => {
    const csv = 'Country,Amount spent (USD),Impressions,Reach,Link clicks,Purchases\nUS,"1,000.50",50000,20000,700,20\nUS,500,25000,10000,300,10\nGB,300,10000,5000,100,3';
    const table = parseCsv(csv);
    const map = autoMap(table.headers, 'meta');
    expect(map.spend).toBe(1);
    const rows = aggregateMeta(table, map);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ country: 'US', spend: 1500.5, purchases: 30 });
  });

  it('weights Google impression share by impressions', () => {
    const csv = 'Campaign report\nCampaign,Cost,Impr.,Clicks,Conversions,Search impr. share,Search lost IS (budget)\nA,100,1000,50,5,40%,10%\nB,100,3000,100,10,80%,< 10%';
    const table = parseCsv(csv);
    const totals = aggregateGoogle(table, autoMap(table.headers, 'google'));
    expect(totals.gCost).toBe(200);
    expect(totals.gImpressionShare).toBe(70);
    expect(parseCell('1.234,5')).toBe(1234.5);
  });
});
