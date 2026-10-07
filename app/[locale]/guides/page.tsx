import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { GuideCard } from '@/components/content/GuideCard';
import { Reveal, RevealItem } from '@/components/content/Reveal';
import { pageMetadata, type PageProps } from '@/lib/metadata';
import { GUIDES } from '@/lib/site';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'guides');
}

// Phase 7 adds search, the category filter and reading time once the MDX articles exist.
export default async function GuidesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('guides');
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <Reveal as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <RevealItem key={g.slug} as="li">
            <GuideCard guide={g} />
          </RevealItem>
        ))}
      </Reveal>
    </main>
  );
}
