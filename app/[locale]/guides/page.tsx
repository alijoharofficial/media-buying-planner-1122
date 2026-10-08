import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { ClientMessages } from '@/components/ClientMessages';
import { GuidesBrowser } from '@/components/guides/GuidesBrowser';
import { publishedGuides, readingMinutes } from '@/lib/guides';
import { pageMetadata, type PageProps } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'guides', '/guides');
}

export default async function GuidesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations('common.nav');
  const t = await getTranslations('guides');
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} crumb={{ name: tn('guides'), path: '/guides' }} />
      <ClientMessages namespaces={['guides']}>
        <GuidesBrowser guides={publishedGuides().map((g) => ({ ...g, minutes: readingMinutes(locale, g.slug) }))} />
      </ClientMessages>
    </main>
  );
}
