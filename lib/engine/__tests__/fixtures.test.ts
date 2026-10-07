import { describe, expect, it } from 'vitest';
import {
  buildPlan,
  DEFAULT_SETTINGS,
  ecomLimits,
  FIXTURE_EXISTING_ECOMMERCE,
  FIXTURE_EXISTING_LEADS,
  FIXTURE_NEW_ECOMMERCE,
  FIXTURE_NEW_LEADS,
} from '@/lib/engine';

/** Relative tolerance check (default 1%) for "≈" values in the brief. */
const near = (actual: number, expected: number, rel = 0.01) =>
  expect(Math.abs(actual - expected) / Math.abs(expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(rel);

describe('9.9 existing leads', () => {
  const plan = buildPlan(FIXTURE_EXISTING_LEADS);
  const total = plan.existing?.meta?.total;

  it('computes account metrics and funnel', () => {
    expect(total?.cpa).toBeCloseTo(25, 2);
    expect(plan.existing?.funnel?.cac).toBeCloseTo(153.85, 2);
  });

  it('computes limits from CRM rates', () => {
    if (plan.limits.kind !== 'leads') throw new Error('expected lead limits');
    expect(plan.limits.leadToClient).toBeCloseTo(0.1625, 4);
    expect(plan.limits.maxCPL).toBeCloseTo(58.5, 2);
  });

  it('projects budget for 25 clients', () => {
    near(plan.budget.results, 154, 0.005);
    near(plan.budget.monthly, 4550);
    near(plan.budget.cpa, 29.5);
  });
});

describe('9.9 existing ecommerce', () => {
  const plan = buildPlan(FIXTURE_EXISTING_ECOMMERCE);
  const m = plan.existing?.meta?.total;

  it('computes account metrics', () => {
    expect(m?.cpm).toBeCloseTo(12, 4);
    expect(m?.ctr).toBeCloseTo(0.015, 6);
    expect(m?.cpa).toBeCloseTo(30, 4);
    expect(m?.roas).toBeCloseTo(3, 4);
    expect(m?.frequency).toBeCloseTo(2.78, 2);
  });

  it('computes break-even and target CPA', () => {
    if (plan.limits.kind !== 'ecommerce') throw new Error('expected ecommerce limits');
    expect(plan.limits.breakEvenCPA).toBeCloseTo(45, 4);
    expect(plan.limits.targetCPA).toBeCloseTo(36, 4);
  });

  it('projects budget for 200 sales', () => {
    near(plan.budget.monthly, 7150);
    near(plan.budget.results, 200, 0.001);
  });
});

describe('9.9 new leads', () => {
  const plan = buildPlan(FIXTURE_NEW_LEADS);

  it('estimates CPL with new account penalty', () => {
    expect(plan.newAccount?.meta?.estimated).toBeCloseTo(20.83, 2);
    expect(plan.newAccount?.meta?.expected).toBeCloseTo(26.04, 2);
  });

  it('computes max CPL and test budget', () => {
    if (plan.limits.kind !== 'leads') throw new Error('expected lead limits');
    expect(plan.limits.maxCPL).toBeCloseTo(40.95, 2);
    near(plan.newAccount?.test.testBudget ?? 0, 2047, 0.001);
  });
});

describe('9.9 new ecommerce', () => {
  it('computes profit per order and break-even ROAS', () => {
    const l = ecomLimits({ aov: 60, productCost: 18, shipping: 5, paymentFee: 0.03, returnRate: 0.1 }, DEFAULT_SETTINGS.profitBuffer);
    expect(l.profitPerOrder).toBeCloseTo(29.2, 4);
    expect(l.breakEvenROAS).toBeCloseTo(2.05, 2);
  });

  it('computes Option A test budget and scale threshold', () => {
    const plan = buildPlan(FIXTURE_NEW_ECOMMERCE);
    expect(plan.newAccount?.test.testBudget).toBeCloseTo(1460, 4);
    expect(plan.newAccount?.test.decision.scaleBelow).toBeCloseTo(20.44, 2);
  });
});
