import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'es', 'fr', 'de', 'ar', 'pt', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const rtlLocales: readonly Locale[] = ['ar'];
export const getDirection = (locale: Locale) => (rtlLocales.includes(locale) ? 'rtl' : 'ltr');

/** Message namespaces, one JSON file per namespace in messages/<locale>/. */
export const namespaces = ['common', 'home', 'planner', 'results'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  // Accept-Language is used on the first visit only; the NEXT_LOCALE cookie wins afterwards.
  localeDetection: true,
});
