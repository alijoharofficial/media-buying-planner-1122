import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { Reveal, RevealItem } from '@/components/content/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { pageMetadata, type PageProps } from '@/lib/metadata';
import { EXTERNAL, SERVICES } from '@/lib/site';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'pages.services');
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.services');
  const tf = await getTranslations('features.items');

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <Reveal className="mx-auto mt-12 flex max-w-4xl flex-col gap-5">
        {SERVICES.map((s) => (
          <RevealItem key={s.id}>
            <section id={s.service} aria-labelledby={`${s.service}-title`} className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:flex-row sm:items-center">
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name={s.icon} size={28} />
              </span>
              <div className="flex-1">
                <h2 id={`${s.service}-title`} className="text-lg font-semibold">
                  {tf(`${s.id}.service`)}
                </h2>
                <p className="mt-1 text-sm text-fg-muted">{tf(`${s.id}.long`)}</p>
              </div>
              <ButtonLink href="/calculator" variant="secondary" size="sm" aria-label={t('useItFor', { service: tf(`${s.id}.service`) })}>
                {t('useIt')}
              </ButtonLink>
            </section>
          </RevealItem>
        ))}
        <RevealItem>
          <section id="expert-opinion" className="rounded-2xl bg-gradient-to-br from-brand to-accent-strong p-8 text-white shadow-lift">
            <h2 className="text-2xl font-bold">{t('expertTitle')}</h2>
            <p className="mt-2 max-w-2xl text-white/85">{t('expertText')}</p>
            <a href={EXTERNAL.expert} target="_blank" rel="noopener" className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 focus-glow">
              {t('expertCta')} <span className="rtl-mirror" aria-hidden="true">↗</span>
            </a>
          </section>
        </RevealItem>
      </Reveal>
    </main>
  );
}
