import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Planner } from '@/components/planner/Planner';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'planner.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'planner' });

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-fg-muted">{t('intro')}</p>
      </header>
      <Planner />
    </main>
  );
}
