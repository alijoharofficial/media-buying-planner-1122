import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage, type ContentSection } from '@/components/content/ContentPage';
import { SupportBanner } from '@/components/SupportBanner';
import { BRAND_NAME } from '@/lib/brand';
import { pageMetadata, type PageProps } from '@/lib/metadata';
import { EXTERNAL } from '@/lib/site';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'pages.about');
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');
  const fill = (s: string) => s.replaceAll('{brand}', BRAND_NAME);
  const sections = (t.raw('sections') as ContentSection[]).map((s) => ({ heading: fill(s.heading), body: s.body?.map(fill), list: s.list?.map(fill) }));

  return (
    <ContentPage eyebrow={t('eyebrow')} title={fill(t('title'))} intro={fill(t('intro'))} sections={sections} footer={<SupportBanner />}>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">{t('creditsTitle')}</h2>
        <p className="leading-relaxed text-fg-muted">
          {t('creditsText')}{' '}
          <a href={EXTERNAL.tech24} target="_blank" rel="noopener" className="font-medium text-accent hover:underline">
            {t('creditsLink')}
          </a>
        </p>
      </section>
    </ContentPage>
  );
}
