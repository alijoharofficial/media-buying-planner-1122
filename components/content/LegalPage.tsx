import { useTranslations } from 'next-intl';
import { BRAND_NAME } from '@/lib/brand';
import { CONTACT_EMAIL } from '@/lib/site';
import { ContentPage, type ContentSection } from './ContentPage';

/** Privacy, terms, disclaimer and cookie policy, all from legal.<page> in messages. */
export function LegalPage({ page }: { page: 'privacy' | 'terms' | 'disclaimer' | 'cookies' }) {
  const t = useTranslations(`legal.${page}`);
  const tl = useTranslations('legal');
  const fill = (s: string) => s.replaceAll('{brand}', BRAND_NAME).replaceAll('{email}', CONTACT_EMAIL);
  const sections = (t.raw('sections') as ContentSection[]).map((s) => ({
    heading: fill(s.heading),
    body: s.body?.map(fill),
    list: s.list?.map(fill),
  }));
  return <ContentPage eyebrow={tl('eyebrow')} title={t('title')} intro={fill(t('intro'))} updated={tl('updated', { date: tl('date') })} sections={sections} />;
}
