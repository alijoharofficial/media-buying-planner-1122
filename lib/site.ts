/** Shared site data: navigation (header + footer), features, FAQ order and the guides registry. Copy lives in messages. */

export const EXTERNAL = {
  expert: 'https://alijohar.work',
  tech24: 'https://tech24.cc',
  qr: 'https://www.qrcodegenerator.us/',
} as const;

export const CONTACT_EMAIL = '[EMAIL]';

/** Header nav: label key in common.nav. */
export const HEADER_NAV = [
  { key: 'planner', href: '/calculator' },
  { key: 'features', href: '/features' },
  { key: 'howToUse', href: '/how-to-use' },
  { key: 'guides', href: '/guides' },
  { key: 'faq', href: '/faq' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

/** Footer middle zone. */
export const FOOTER_QUICK = [
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'guides', href: '/guides' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
  { key: 'privacy', href: '/privacy-policy' },
  { key: 'terms', href: '/terms' },
  { key: 'disclaimer', href: '/disclaimer' },
  { key: 'cookies', href: '/cookie-policy' },
] as const;

export type IconName =
  | 'calculator'
  | 'funnel'
  | 'cart'
  | 'flask'
  | 'gauge'
  | 'table'
  | 'pie'
  | 'search'
  | 'target'
  | 'steps'
  | 'globe'
  | 'layers'
  | 'shield'
  | 'chat';

/**
 * Features (home cards, Features page, Services page). `service` marks the 8 listed in the footer;
 * the anchor is the section id on /services.
 */
export const FEATURES: Array<{ id: string; icon: IconName; service?: string }> = [
  { id: 'budgetCalculator', icon: 'calculator' },
  { id: 'leadFunnel', icon: 'funnel', service: 'lead-budget-calculator' },
  { id: 'ecomBreakEven', icon: 'cart', service: 'ecommerce-budget-calculator' },
  { id: 'testPlanner', icon: 'flask', service: 'new-account-test-planner' },
  { id: 'learningCheck', icon: 'gauge', service: 'learning-phase-check' },
  { id: 'scalingTable', icon: 'table', service: 'scaling-table' },
  { id: 'budgetSplit', icon: 'pie', service: 'budget-split-planner' },
  { id: 'googleCeiling', icon: 'search', service: 'google-search-ceiling' },
  { id: 'bottleneck', icon: 'target', service: 'bottleneck-finder' },
  { id: 'showCalculation', icon: 'steps' },
];

export const SERVICES = FEATURES.filter((f): f is (typeof FEATURES)[number] & { service: string } => Boolean(f.service));

export const HOW_STEPS = ['business', 'numbers', 'plan', 'calculation'] as const;

/** FAQ order; the first 6 show on the home page. Copy: faq.items.<id>. */
export const FAQ_IDS = [
  'guaranteed',
  'noData',
  'learningPerAdSet',
  'cacVsCpl',
  'googleAds',
  'dataStored',
  'impressionShare',
  'whichBudget',
  'newAccountPenalty',
  'scalingCost',
  'multiCountry',
  'leadSource',
  'returns',
  'currency',
  'benchmarks',
  'share',
  'free',
] as const;
export const HOME_FAQ_COUNT = 6;

export type GuideMeta = { slug: string; category: 'budgets' | 'metaAds' | 'ecommerce' | 'strategy'; icon: IconName; date: string };

/** Guides registry (newest first). Titles and summaries: guides.items.<slug>. Articles are written in Phase 7. */
export const GUIDES: GuideMeta[] = [
  { slug: 'lead-funnel-bottleneck', category: 'strategy', icon: 'target', date: '2026-10-05' },
  { slug: 'benchmarks-before-launch', category: 'strategy', icon: 'globe', date: '2026-10-04' },
  { slug: 'seasonality-q4-ad-costs', category: 'strategy', icon: 'layers', date: '2026-10-03' },
  { slug: 'test-budget-decision-rules', category: 'budgets', icon: 'flask', date: '2026-10-02' },
  { slug: 'meta-vs-google-budget-split', category: 'budgets', icon: 'pie', date: '2026-10-01' },
  { slug: 'scaling-ad-spend-costs', category: 'budgets', icon: 'table', date: '2026-09-30' },
  { slug: 'meta-learning-phase-50-results', category: 'metaAds', icon: 'gauge', date: '2026-09-29' },
  { slug: 'ecommerce-break-even-roas', category: 'ecommerce', icon: 'cart', date: '2026-09-28' },
  { slug: 'cost-per-lead-to-cac', category: 'budgets', icon: 'funnel', date: '2026-09-27' },
  { slug: 'meta-ads-budget-new-account', category: 'metaAds', icon: 'calculator', date: '2026-09-26' },
];
