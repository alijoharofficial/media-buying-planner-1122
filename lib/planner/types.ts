import type { AccountStatus, BudgetType, BusinessType, GoalType, LeadSource, Platform, RateSource, Settings, Source } from '@/lib/engine';

/** Form values. Percentages are stored as 0 to 100 here and converted to ratios in toPlanInput. Empty numbers are undefined. */
export type Num = number | undefined;

export type CampaignRowForm = { name: string; budgetType: BudgetType; adSets: Num; adSetsWithSpend: Num };

export type MetaRowForm = {
  country: string;
  spend: Num;
  impressions: Num;
  reach: Num;
  linkClicks: Num;
  landingPageViews: Num;
  formLeads: Num;
  landingLeads: Num;
  bookings: Num;
  shows: Num;
  clients: Num;
  addToCarts: Num;
  checkouts: Num;
  purchases: Num;
  purchaseValue: Num;
};

/** Settings with percent fields as 0 to 100. */
export type SettingsForm = Settings;

export type FormValues = {
  // Step 0
  businessType: BusinessType;
  accountStatus: AccountStatus;
  platforms: Platform[];
  goalType: GoalType;
  // Setup
  niche: string;
  regions: string[];
  month: number;
  currency: string;
  targetResults: Num;
  monthlyBudget: Num;
  // Business: leads
  clientValue: Num;
  margin: Num;
  bookingRate: Num;
  showRate: Num;
  closeRate: Num;
  rateSource: RateSource;
  leadSource: LeadSource;
  // Business: ecommerce
  aov: Num;
  productCost: Num;
  shipping: Num;
  paymentFee: Num;
  returnRate: Num;
  ordersPerCustomer: Num;
  judgeOn: 'first' | 'lifetime';
  // Account data
  days: Num;
  metaCampaigns: CampaignRowForm[];
  metaRows: MetaRowForm[];
  retargetingAudience: Num;
  gCost: Num;
  gImpressions: Num;
  gClicks: Num;
  gConversions: Num;
  gConversionValue: Num;
  gImpressionShare: Num;
  gLostBudget: Num;
  gLostRank: Num;
  gBrand: boolean;
  // Estimates: Meta
  eCpm: Num;
  eCtr: Num;
  eCvr: Num;
  eFormRate: Num;
  eAtcRate: Num;
  eDailyMin: Num;
  eDailyMax: Num;
  eDailyBudget: Num;
  // Estimates: Google
  gKeywords: string[];
  gSearches: Num;
  gBidLow: Num;
  gBidHigh: Num;
  gIS: Num;
  gCtrNew: Num;
  gCvrNew: Num;
  gBrandNew: boolean;
  /** Source label per estimate field id. */
  sources: Record<string, Source>;
  // Planning
  adSets: Num;
  creatives: Num;
  testDays: Num;
  includeRetargeting: boolean;
  // Advanced
  settings: SettingsForm;
};

export type Mode = Pick<FormValues, 'businessType' | 'accountStatus' | 'platforms' | 'goalType' | 'leadSource'>;

export type TabId = 'setup' | 'business' | 'account' | 'estimates' | 'planning' | 'advanced';
