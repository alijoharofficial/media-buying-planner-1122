import type { Metadata } from 'next';
import { locales, routing } from '@/i18n/routing';
import { BRAND_NAME, SITE_URL } from './brand';

/** Absolute URL for a locale + path ("/" for home). */
export const localeUrl = (locale: string, path = '/') => `${SITE_URL}/${locale}${path === '/' ? '' : path}`;

/** Path for a locale: the same path everywhere, or a per-locale function (translated article slugs). */
export type LocalePath = string | ((locale: string) => string);
const pathFor = (p: LocalePath, locale: string) => (typeof p === 'function' ? p(locale) : p);

/** hreflang alternates for all 7 locales plus x-default (English). */
export function languageAlternates(path: LocalePath = '/') {
  return {
    ...Object.fromEntries(locales.map((l) => [l, localeUrl(l, pathFor(path, l))])),
    'x-default': localeUrl(routing.defaultLocale, pathFor(path, routing.defaultLocale)),
  };
}

const OG_LOCALE: Record<string, string> = { en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', ar: 'ar_AR', pt: 'pt_BR', zh: 'zh_CN' };

/** OG image from the single dynamic template route (/og). */
export const ogImageUrl = (title: string, locale: string, eyebrow?: string) =>
  `${SITE_URL}/og?${new URLSearchParams({ title, locale, ...(eyebrow ? { eyebrow } : {}) }).toString()}`;

type BuildArgs = {
  locale: string;
  /** Path without locale, e.g. "/faq", or a per-locale function for translated slugs. */
  path: LocalePath;
  title: string;
  description: string;
  /** When true, title is used as-is (home, articles) instead of the "%s | Media Buying Planner" template. */
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  /** Text on the OG image; defaults to the title without the brand suffix. */
  ogTitle?: string;
};

/** One metadata builder for every page: canonical, hreflang, Open Graph and Twitter cards. */
export function buildMetadata({ locale, path, title, description, absoluteTitle, type = 'website', publishedTime, ogTitle }: BuildArgs): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${BRAND_NAME}`;
  const url = localeUrl(locale, pathFor(path, locale));
  const image = { url: ogImageUrl(ogTitle ?? title, locale), width: 1200, height: 630, alt: ogTitle ?? title };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: BRAND_NAME,
      locale: OG_LOCALE[locale] ?? 'en_US',
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l] ?? l),
      images: [image],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image.url] },
  };
}
