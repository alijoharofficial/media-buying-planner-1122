/** Engine types. All percentages are ratios (0.25 = 25%). All money is in the planner currency. */

export type BusinessType = 'leads' | 'ecommerce';
export type AccountStatus = 'new' | 'existing';
export type Platform = 'meta' | 'google';
export type GoalType = 'target' | 'budget';
export type Profile = 'ecommerce' | 'leads' | 'messaging';
export type BudgetType = 'CBO' | 'ABO' | 'ADVANTAGE';
export type LeadSource = 'form' | 'landing' | 'both';
/** Confidence source of an estimate, best first. */
export type Source = 'accounts' | 'metaEstimate' | 'benchmark' | 'guess';
export type RateSource = 'crm' | 'estimate' | 'default';

export type RangeMultiplier = { low: number; high: number };

export type Settings = {
  learningThreshold: number;
  googleMinConversions: number;
  scalingPenalty: number;
  profitBuffer: number;
  newAccountPenalty: number;
  creativeTestMultiplier: number;
  scaleThreshold: number;
  stopLossLow: number;
  stopLossHigh: number;
  minResultsForConfidence: number;
  retargetingViewsPerMonth: number;
  retargetingCap: number;
  minRetargetingAudience: number;
  brandShare: number;
  maxStepIncrease: number;
  stepDays: number;
  rangeMultipliers: Record<Source, RangeMultiplier>;
  /** 12 values per profile, January first. */
  seasonalMultipliers: Record<Profile, number[]>;
};

export type LeadBusiness = {
  clientValue: number;
  margin: number;
  bookingRate: number;
  showRate: number;
  closeRate: number;
  rateSource?: RateSource;
  leadSource?: LeadSource;
};

export type EcomBusiness = {
  aov: number;
  productCost: number;
  shipping: number;
  paymentFee: number;
  returnRate: number;
  ordersPerCustomer?: number;
  judgeOn?: 'first' | 'lifetime';
};

export type MetaCampaign = { name?: string; budgetType: BudgetType; adSets: number; adSetsWithSpend?: number };

export type MetaRow = {
  country?: string;
  spend: number;
  impressions: number;
  reach: number;
  linkClicks: number;
  landingPageViews?: number;
  // leads
  formLeads?: number;
  landingLeads?: number;
  bookings?: number;
  shows?: number;
  clients?: number;
  // ecommerce
  addToCarts?: number;
  checkouts?: number;
  purchases?: number;
  purchaseValue?: number;
};

export type GoogleExisting = {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue?: number;
  impressionShare: number;
  lostISBudget: number;
  lostISRank?: number;
  brandSearches?: boolean;
};

export type ExistingData = {
  days: number;
  metaCampaigns?: MetaCampaign[];
  metaRows?: MetaRow[];
  retargetingAudience?: number;
  google?: GoogleExisting;
  /** Benchmark cost per result used to blend low-volume data (9.3). */
  benchmarkCPA?: { meta?: number; google?: number };
};

export type Sourced = { value: number; source: Source };

export type MetaEstimates = {
  cpm: Sourced;
  ctr: Sourced;
  /** Landing page (leads) or site (ecommerce) conversion rate per click. */
  cvr?: Sourced;
  formCompletionRate?: Sourced;
  atcToPurchaseRate?: Sourced;
};

export type GoogleEstimates = {
  monthlySearches: Sourced;
  bidLow: Sourced;
  bidHigh: Sourced;
  impressionShare: Sourced;
  ctr: Sourced;
  cvr: Sourced;
  brandSearches?: boolean;
};

export type Planning = { adSets: number; creatives: number; testDays: number; includeRetargeting: boolean };

export type PlanInput = {
  businessType: BusinessType;
  accountStatus: AccountStatus;
  platforms: Platform[];
  goalType: GoalType;
  /** Clients (leads) or sales (ecommerce) per month. */
  targetResults?: number;
  monthlyBudget?: number;
  /** 0 = January. */
  month?: number;
  profile?: Profile;
  leads?: LeadBusiness;
  ecommerce?: EcomBusiness;
  existing?: ExistingData;
  estimates?: { meta?: MetaEstimates; google?: GoogleEstimates };
  planning: Planning;
  settings: Settings;
};

// ---------- Calculation steps (for the "Show the calculation" view) ----------

export type Unit = 'currency' | 'percent' | 'number' | 'multiplier' | 'days';
export type ValueTag = 'input' | 'assumption' | 'setting';

export type StepValue = { key: string; value: number; unit: Unit; tag: ValueTag; source?: Source | RateSource };

/** Translation keys derive from id: steps.<id>.title / .desc / .formula */
export type StepRecord = {
  id: string;
  inputs: StepValue[];
  result: { value: number; unit: Unit };
  long?: boolean;
};

export type Stepped<T> = T & { steps: StepRecord[] };

// ---------- Outputs ----------

export type Severity = 'info' | 'warning' | 'danger';
export type Warning = { code: string; severity: Severity; params?: Record<string, number | string> };

export type Curve = {
  baseCPA: number;
  /** Spend up to which cost per result stays at baseCPA. */
  threshold: number;
  penalty: number;
  /** Hard spend cap (Google maximum useful spend). */
  cap?: number;
};

export type SplitLine = {
  platform: Platform;
  item: 'prospecting' | 'creativeTesting' | 'retargeting' | 'brand' | 'nonBrand';
  amount: number;
  reason: string;
};

export type RampStep = { day: number; daily: number };

export type Verdict = 'profitable' | 'optimize' | 'notViable';
export type Viability = 'viable' | 'risky' | 'notViable';
export type HealthFlag = 'green' | 'amber' | 'red' | 'neutral';
