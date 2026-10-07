import { setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/content/LegalPage';
import { pageMetadata, type PageProps } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'legal.disclaimer', '/disclaimer');
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage page="disclaimer" />;
}
