import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

/** Title + description from `<namespace>.meta`. Inner pages use the layout's "%s | Media Buying Planner" template. Phase 6 extends this. */
export async function pageMetadata(locale: string, namespace: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.meta` });
  return { title: t('title'), description: t('description') };
}

export type PageProps = { params: Promise<{ locale: string }> };
