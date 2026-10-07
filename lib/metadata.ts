import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from './seo';

/** Title + description from `<namespace>.meta`, through buildMetadata (canonical, hreflang, OG, Twitter). */
export async function pageMetadata(locale: string, namespace: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.meta` });
  return buildMetadata({ locale, path, title: t('title'), description: t('description') });
}

export type PageProps = { params: Promise<{ locale: string }> };
