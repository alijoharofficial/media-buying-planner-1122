import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentType } from 'react';
import { GUIDES, type GuideMeta } from './site';
import { localizedSlug } from './slugs';

export { localizedSlug };

/** Article loaders, one entry per written MDX file (key: "<locale>/<canonical slug>"). Missing locales fall back to English. */
export const GUIDE_CONTENT: Record<string, () => Promise<{ default: ComponentType; faq?: FaqEntry[] }>> = {
  'en/meta-ads-budget-new-account': () => import('@/content/guides/en/meta-ads-budget-new-account.mdx'),
  'en/cost-per-lead-to-cac': () => import('@/content/guides/en/cost-per-lead-to-cac.mdx'),
  'en/ecommerce-break-even-roas': () => import('@/content/guides/en/ecommerce-break-even-roas.mdx'),
  'en/meta-learning-phase-50-results': () => import('@/content/guides/en/meta-learning-phase-50-results.mdx'),
  'en/scaling-ad-spend-costs': () => import('@/content/guides/en/scaling-ad-spend-costs.mdx'),
  'en/meta-vs-google-budget-split': () => import('@/content/guides/en/meta-vs-google-budget-split.mdx'),
  'en/test-budget-decision-rules': () => import('@/content/guides/en/test-budget-decision-rules.mdx'),
  'en/seasonality-q4-ad-costs': () => import('@/content/guides/en/seasonality-q4-ad-costs.mdx'),
  'en/benchmarks-before-launch': () => import('@/content/guides/en/benchmarks-before-launch.mdx'),
  'en/lead-funnel-bottleneck': () => import('@/content/guides/en/lead-funnel-bottleneck.mdx'),
  'es/meta-ads-budget-new-account': () => import('@/content/guides/es/meta-ads-budget-new-account.mdx'),
  'es/cost-per-lead-to-cac': () => import('@/content/guides/es/cost-per-lead-to-cac.mdx'),
  'es/ecommerce-break-even-roas': () => import('@/content/guides/es/ecommerce-break-even-roas.mdx'),
  'es/meta-learning-phase-50-results': () => import('@/content/guides/es/meta-learning-phase-50-results.mdx'),
  'es/scaling-ad-spend-costs': () => import('@/content/guides/es/scaling-ad-spend-costs.mdx'),
  'es/meta-vs-google-budget-split': () => import('@/content/guides/es/meta-vs-google-budget-split.mdx'),
  'es/test-budget-decision-rules': () => import('@/content/guides/es/test-budget-decision-rules.mdx'),
  'es/seasonality-q4-ad-costs': () => import('@/content/guides/es/seasonality-q4-ad-costs.mdx'),
  'es/benchmarks-before-launch': () => import('@/content/guides/es/benchmarks-before-launch.mdx'),
  'es/lead-funnel-bottleneck': () => import('@/content/guides/es/lead-funnel-bottleneck.mdx'),
  'fr/meta-ads-budget-new-account': () => import('@/content/guides/fr/meta-ads-budget-new-account.mdx'),
  'fr/cost-per-lead-to-cac': () => import('@/content/guides/fr/cost-per-lead-to-cac.mdx'),
  'fr/ecommerce-break-even-roas': () => import('@/content/guides/fr/ecommerce-break-even-roas.mdx'),
  'fr/meta-learning-phase-50-results': () => import('@/content/guides/fr/meta-learning-phase-50-results.mdx'),
  'fr/scaling-ad-spend-costs': () => import('@/content/guides/fr/scaling-ad-spend-costs.mdx'),
  'fr/meta-vs-google-budget-split': () => import('@/content/guides/fr/meta-vs-google-budget-split.mdx'),
  'fr/test-budget-decision-rules': () => import('@/content/guides/fr/test-budget-decision-rules.mdx'),
  'fr/seasonality-q4-ad-costs': () => import('@/content/guides/fr/seasonality-q4-ad-costs.mdx'),
  'fr/benchmarks-before-launch': () => import('@/content/guides/fr/benchmarks-before-launch.mdx'),
  'fr/lead-funnel-bottleneck': () => import('@/content/guides/fr/lead-funnel-bottleneck.mdx'),
  'de/meta-ads-budget-new-account': () => import('@/content/guides/de/meta-ads-budget-new-account.mdx'),
  'de/cost-per-lead-to-cac': () => import('@/content/guides/de/cost-per-lead-to-cac.mdx'),
  'de/ecommerce-break-even-roas': () => import('@/content/guides/de/ecommerce-break-even-roas.mdx'),
  'de/meta-learning-phase-50-results': () => import('@/content/guides/de/meta-learning-phase-50-results.mdx'),
  'de/scaling-ad-spend-costs': () => import('@/content/guides/de/scaling-ad-spend-costs.mdx'),
  'de/meta-vs-google-budget-split': () => import('@/content/guides/de/meta-vs-google-budget-split.mdx'),
  'de/test-budget-decision-rules': () => import('@/content/guides/de/test-budget-decision-rules.mdx'),
  'de/seasonality-q4-ad-costs': () => import('@/content/guides/de/seasonality-q4-ad-costs.mdx'),
  'de/benchmarks-before-launch': () => import('@/content/guides/de/benchmarks-before-launch.mdx'),
  'de/lead-funnel-bottleneck': () => import('@/content/guides/de/lead-funnel-bottleneck.mdx'),
  'ar/meta-ads-budget-new-account': () => import('@/content/guides/ar/meta-ads-budget-new-account.mdx'),
  'ar/cost-per-lead-to-cac': () => import('@/content/guides/ar/cost-per-lead-to-cac.mdx'),
  'ar/ecommerce-break-even-roas': () => import('@/content/guides/ar/ecommerce-break-even-roas.mdx'),
  'ar/meta-learning-phase-50-results': () => import('@/content/guides/ar/meta-learning-phase-50-results.mdx'),
  'ar/scaling-ad-spend-costs': () => import('@/content/guides/ar/scaling-ad-spend-costs.mdx'),
  'ar/meta-vs-google-budget-split': () => import('@/content/guides/ar/meta-vs-google-budget-split.mdx'),
  'ar/test-budget-decision-rules': () => import('@/content/guides/ar/test-budget-decision-rules.mdx'),
  'ar/seasonality-q4-ad-costs': () => import('@/content/guides/ar/seasonality-q4-ad-costs.mdx'),
  'ar/benchmarks-before-launch': () => import('@/content/guides/ar/benchmarks-before-launch.mdx'),
  'ar/lead-funnel-bottleneck': () => import('@/content/guides/ar/lead-funnel-bottleneck.mdx'),
  'pt/meta-ads-budget-new-account': () => import('@/content/guides/pt/meta-ads-budget-new-account.mdx'),
  'pt/cost-per-lead-to-cac': () => import('@/content/guides/pt/cost-per-lead-to-cac.mdx'),
  'pt/ecommerce-break-even-roas': () => import('@/content/guides/pt/ecommerce-break-even-roas.mdx'),
  'pt/meta-learning-phase-50-results': () => import('@/content/guides/pt/meta-learning-phase-50-results.mdx'),
  'pt/scaling-ad-spend-costs': () => import('@/content/guides/pt/scaling-ad-spend-costs.mdx'),
  'pt/meta-vs-google-budget-split': () => import('@/content/guides/pt/meta-vs-google-budget-split.mdx'),
  'pt/test-budget-decision-rules': () => import('@/content/guides/pt/test-budget-decision-rules.mdx'),
  'pt/seasonality-q4-ad-costs': () => import('@/content/guides/pt/seasonality-q4-ad-costs.mdx'),
  'pt/benchmarks-before-launch': () => import('@/content/guides/pt/benchmarks-before-launch.mdx'),
  'pt/lead-funnel-bottleneck': () => import('@/content/guides/pt/lead-funnel-bottleneck.mdx'),
};

export type FaqEntry = { q: string; a: string };

const file = (locale: string, slug: string) => join(process.cwd(), 'content/guides', locale, `${slug}.mdx`);

/** Locale used to render an article: the requested one if written, else English. */
export function contentLocale(locale: string, slug: string) {
  return GUIDE_CONTENT[`${locale}/${slug}`] ? locale : 'en';
}

export function isPublished(slug: string) {
  return Boolean(GUIDE_CONTENT[`en/${slug}`]);
}

export const publishedGuides = (): GuideMeta[] => GUIDES.filter((g) => isPublished(g.slug));

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug && isPublished(slug));
}


/** Path of a guide in a locale, without the locale prefix. */
export const guidePath = (slug: string, locale: string) => `/guides/${localizedSlug(slug, locale)}`;

/** Resolve a URL slug: exact match for this locale, or a slug from another locale (to redirect). */
export function resolveGuideSlug(urlSlug: string, locale: string): { guide: GuideMeta; exact: boolean } | undefined {
  const published = publishedGuides();
  const exact = published.find((g) => localizedSlug(g.slug, locale) === urlSlug);
  if (exact) return { guide: exact, exact: true };
  const other = published.find((g) => g.slug === urlSlug || Object.values(g.slugs ?? {}).includes(urlSlug));
  return other ? { guide: other, exact: false } : undefined;
}

/** Reading time from the MDX source (prose only), at about 220 words a minute. */
export function readingMinutes(locale: string, slug: string) {
  const path = file(contentLocale(locale, slug), slug);
  if (!existsSync(path)) return 0;
  const text = readFileSync(path, 'utf8')
    .replace(/^export const[\s\S]*?^\]\s*$/m, ' ') // FAQ export counts separately below
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>[\]()-]/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
