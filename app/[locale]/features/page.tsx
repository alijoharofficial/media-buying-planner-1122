import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { FeatureGrid } from '@/components/content/FeatureGrid';
import { SupportBanner } from '@/components/SupportBanner';
import { ButtonLink } from '@/components/ui/Button';
import { pageMetadata, type PageProps } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'pages.features', '/features');
}

export default async function FeaturesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations('common.nav');
  const t = await getTranslations('pages.features');
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} crumb={{ name: tn('features'), path: '/features' }} />
      <div className="mt-12">
        <FeatureGrid detailed />
      </div>
      <div className="mt-12 flex justify-center">
        <ButtonLink href="/calculator" size="lg" shimmer>
          {t('cta')}
        </ButtonLink>
      </div>
      <SupportBanner className="mt-16" />
    </main>
  );
}
