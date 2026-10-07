import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { namespaces, routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const loadNamespace = async (ns: string, loc: string) =>
    (await import(`../messages/${loc}/${ns}.json`)).default as Record<string, unknown>;

  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        return [ns, await loadNamespace(ns, locale)] as const;
      } catch {
        // Untranslated namespace: fall back to English until Phase 8 fills it in.
        return [ns, await loadNamespace(ns, routing.defaultLocale)] as const;
      }
    }),
  );

  return { locale, messages: Object.fromEntries(entries) };
});
