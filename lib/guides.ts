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
