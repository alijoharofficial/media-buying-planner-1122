import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ComponentType } from 'react';
import { GUIDES, type GuideMeta } from './site';

/** Article loaders, one entry per written MDX file (key: "<locale>/<slug>"). Add locales in Phase 8. */
export const GUIDE_CONTENT: Record<string, () => Promise<{ default: ComponentType; faq?: FaqEntry[] }>> = {
  'en/meta-ads-budget-new-account': () => import('@/content/guides/en/meta-ads-budget-new-account.mdx'),
  'en/cost-per-lead-to-cac': () => import('@/content/guides/en/cost-per-lead-to-cac.mdx'),
  'en/ecommerce-break-even-roas': () => import('@/content/guides/en/ecommerce-break-even-roas.mdx'),
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
