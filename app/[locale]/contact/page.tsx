import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/content/ContactForm';
import { PageHeader } from '@/components/content/ContentPage';
import { pageMetadata, type PageProps } from '@/lib/metadata';
import { EXTERNAL } from '@/lib/site';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'pages.contact', '/contact');
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations('common.nav');
  const t = await getTranslations('pages.contact');
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} crumb={{ name: tn('contact'), path: '/contact' }} />
      <div className="relative mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <aside className="flex flex-col gap-4 rounded-2xl border border-border p-6">
          <h2 className="font-semibold">{t('expertTitle')}</h2>
          <p className="text-sm text-fg-muted">{t('expertText')}</p>
          <a href={EXTERNAL.expert} target="_blank" rel="noopener" className="text-sm font-semibold text-accent hover:underline">
            {t('expertLink')} <span className="rtl-mirror" aria-hidden="true">↗</span>
          </a>
        </aside>
      </div>
    </main>
  );
}
