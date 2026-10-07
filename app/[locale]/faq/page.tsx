import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { FaqAccordion } from '@/components/content/FaqAccordion';
import { ButtonLink } from '@/components/ui/Button';
import { JsonLd } from '@/components/JsonLd';
import { faqPage, graph } from '@/lib/jsonld';
import { pageMetadata, type PageProps } from '@/lib/metadata';
import { FAQ_IDS } from '@/lib/site';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'faq', '/faq');
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations('common.nav');
  const t = await getTranslations('faq');
  const items = FAQ_IDS.map((id) => ({ q: t(`items.${id}.q`), a: t(`items.${id}.a`) }));
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} crumb={{ name: tn('faq'), path: '/faq' }} />
      <div className="mx-auto mt-12 max-w-3xl">
        <FaqAccordion headingLevel={2} items={items} />
        <JsonLd data={graph(faqPage(items))} />
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-fg-muted">{t('more')}</p>
          <ButtonLink href="/contact" variant="secondary">
            {t('contact')}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
