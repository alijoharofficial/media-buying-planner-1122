import { describe, expect, it } from 'vitest';
import {
  buildPlan,
  DEFAULT_SETTINGS,
  FIXTURE_EXISTING_LEADS,
  FIXTURE_NEW_LEADS,
  googleExistingCeiling,
  googleNewAccount,
  metaLearningCheck,
  rampSchedule,
  splitBudget,
} from '@/lib/engine';

const s = DEFAULT_SETTINGS;

describe('google model', () => {
  it('new account ceiling', () => {
    const g = googleNewAccount(
      {
        monthlySearches: { value: 10000, source: 'benchmark' },
        bidLow: { value: 2, source: 'benchmark' },
        bidHigh: { value: 4, source: 'benchmark' },
        impressionShare: { value: 0.5, source: 'guess' },
        ctr: { value: 0.05, source: 'benchmark' },
        cvr: { value: 0.1, source: 'benchmark' },
      },
      s,
    );
    expect(g.maxClicks).toBeCloseTo(250);
    expect(g.maxResults).toBeCloseTo(25);
    expect(g.maxUsefulSpend).toBeCloseTo(750);
  });

  it('existing account ceiling adds budget-lost impressions', () => {
    const c = googleExistingCeiling({ cost: 3040, impressions: 30400, clicks: 1520, conversions: 76, impressionShare: 0.6, lostISBudget: 0.3 }, 30.4);
    expect(c.monthlySpend).toBeCloseTo(3040);
    expect(c.extraSpend).toBeCloseTo(1520);
    expect(c.ceiling).toBeCloseTo(4560);
  });
});

describe('split and ramp', () => {
  it('concentrates budget when minimums cannot be covered', () => {
    const r = splitBudget(
      { meta: { baseCPA: 30, threshold: 1000, penalty: 0.15 }, google: { baseCPA: 20, threshold: 1000, penalty: 0.15, cap: 2000 } },
      500,
      'ecommerce',
      false,
      s,
    );
    expect(r.concentrated).toBe(true);
    expect(r.alloc.google).toBe(500);
  });

  it('stops Google at its ceiling and gives the rest to Meta', () => {
    const r = splitBudget(
      { meta: { baseCPA: 30, threshold: 3000, penalty: 0.15 }, google: { baseCPA: 20, threshold: 2000, penalty: 0.15, cap: 2000 } },
      10000,
      'ecommerce',
      false,
      s,
    );
    expect(r.alloc.google).toBeLessThanOrEqual(2000);
    expect(r.alloc.meta + r.alloc.google).toBeCloseTo(10000);
  });

  it('ramps by at most 20% every 3 days', () => {
    const steps = rampSchedule(100, 200, s);
    expect(steps[1]).toEqual({ day: 3, daily: 120 });
    expect(steps.at(-1)?.daily).toBe(200);
  });
});

describe('learning check', () => {
  it('flags learning limited without forcing budget up', () => {
    const lc = metaLearningCheck({ prospectingBudget: 1000, cpa: 30, adSets: 3, threshold: 50, isEcommerce: true });
    expect(lc.limited).toBe(true);
    expect(lc.recommendedAdSets).toBe(1);
    expect(lc.optimizeForATC).toBe(true);
  });
});

describe('buildPlan extras', () => {
  it('existing leads: bottleneck, health, steps', () => {
    const p = buildPlan(FIXTURE_EXISTING_LEADS);
    expect(p.bottleneck?.stages).toHaveLength(3);
    expect(p.health?.frequency.flag).toBe('green');
    expect(p.steps.length).toBeGreaterThan(5);
    expect(p.scaling.rows).toHaveLength(7);
  });

  it('new leads with Meta + Google splits Google first', () => {
    const p = buildPlan({
      ...FIXTURE_NEW_LEADS,
      platforms: ['meta', 'google'],
      goalType: 'budget',
      monthlyBudget: 5000,
      estimates: {
        ...FIXTURE_NEW_LEADS.estimates,
        google: {
          monthlySearches: { value: 20000, source: 'benchmark' },
          bidLow: { value: 2, source: 'benchmark' },
          bidHigh: { value: 4, source: 'benchmark' },
          impressionShare: { value: 0.6, source: 'guess' },
          ctr: { value: 0.06, source: 'benchmark' },
          cvr: { value: 0.12, source: 'benchmark' },
        },
      },
    });
    expect(p.split.platforms.google).toBeCloseTo(2160);
    expect(p.split.platforms.meta).toBeCloseTo(2840);
    expect(p.warnings.some((w) => w.code === 'doubleCounting')).toBe(true);
  });
});
