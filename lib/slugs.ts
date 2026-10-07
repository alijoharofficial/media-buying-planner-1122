import { GUIDES } from './site';

/** URL slug of a guide in a locale (translated when available). Client-safe (no fs). */
export const localizedSlug = (slug: string, locale: string) => GUIDES.find((g) => g.slug === slug)?.slugs?.[locale] ?? slug;
