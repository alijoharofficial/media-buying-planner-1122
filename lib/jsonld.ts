import { BRAND_NAME, SITE_URL } from './brand';
import { EXTERNAL } from './site';
import { localeUrl } from './seo';

/** JSON-LD builders. Rendered by <JsonLd>. */

const ORG_ID = `${SITE_URL}/#organization`;

export function organization() {
  return { '@type': 'Organization', '@id': ORG_ID, name: BRAND_NAME, url: SITE_URL, logo: `${SITE_URL}/pwa-icon/512` };
}

export function website(locale: string, description: string) {
  return { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: BRAND_NAME, url: localeUrl(locale), description, inLanguage: locale, publisher: { '@id': ORG_ID } };
}

export function webApplication(locale: string, description: string) {
  return {
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: BRAND_NAME,
    url: localeUrl(locale, '/calculator'),
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORG_ID },
  };
}

export function faqPage(items: Array<{ q: string; a: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function breadcrumbs(locale: string, items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: localeUrl(locale, it.path) })),
  };
}

export function article(args: { locale: string; path: string; title: string; description: string; date: string; image: string }) {
  const tech24 = { '@type': 'Organization', name: 'TECH24', url: EXTERNAL.tech24 };
  return {
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    datePublished: args.date,
    dateModified: args.date,
    inLanguage: args.locale,
    mainEntityOfPage: localeUrl(args.locale, args.path),
    image: args.image,
    author: tech24,
    publisher: { ...tech24, logo: { '@type': 'ImageObject', url: `${SITE_URL}/pwa-icon/512` } },
  };
}

/** Wrap one or more nodes in a @graph document. */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
