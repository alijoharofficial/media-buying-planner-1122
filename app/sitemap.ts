import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { languageAlternates, localeUrl } from '@/lib/seo';
import { publishedGuides } from '@/lib/guides';

const PAGES = ['/', '/calculator', '/features', '/how-to-use', '/guides', '/faq', '/about', '/services', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/cookie-policy'];
const BUILT = new Date();

/** Every page and published article in every locale, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Articles are listed once their English MDX is written.
  const articles = publishedGuides();
  const entries = [
    ...PAGES.map((path) => ({ path, lastModified: BUILT, priority: path === '/' ? 1 : path === '/calculator' ? 0.9 : 0.6 })),
    ...articles.map((g) => ({ path: `/guides/${g.slug}`, lastModified: new Date(g.date), priority: 0.7 })),
  ];
  return entries.flatMap(({ path, lastModified, priority }) =>
    locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
