import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { use, type ReactNode } from 'react';
import { FaqAccordion } from '@/components/content/FaqAccordion';
import { FeatureGrid } from '@/components/content/FeatureGrid';
import { GuideCard } from '@/components/content/GuideCard';
import { HowStepper } from '@/components/content/HowStepper';
import { Reveal, RevealItem } from '@/components/content/Reveal';
import { Hero } from '@/components/home/Hero';
import { JsonLd } from '@/components/JsonLd';
import { graph, webApplication } from '@/lib/jsonld';
import { SupportBanner } from '@/components/SupportBanner';
import { ButtonLink } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/brand';
import { buildMetadata } from '@/lib/seo';
import { FAQ_IDS, GUIDES, HOME_FAQ_COUNT } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({ locale, path: '/', title: `${BRAND_NAME} | ${t('title')}`, absoluteTitle: true, description: t('description'), ogTitle: t('title') });
}

function Section({ id, title, intro, children, cta }: { id?: string; title: string; intro?: string; children: ReactNode; cta?: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-20">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <RevealItem>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        </RevealItem>
        {intro && (
          <RevealItem>
            <p className="mt-3 text-fg-muted">{intro}</p>
          </RevealItem>
        )}
      </Reveal>
      {children}
      {cta && <div className="mt-10 flex justify-center">{cta}</div>}
    </section>
  );
}

const PREVIEW_TABS = ['setup', 'business', 'account', 'estimates', 'planning', 'advanced'] as const;

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');
  const tf = useTranslations('faq.items');
  const tt = useTranslations('planner.tabs');

  return (
    <main id="main">
      <Hero />
      <JsonLd data={graph(webApplication(locale, t('meta.description')))} />

      {/* Trust strip */}
      <div className="border-y border-border bg-surface/60">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm font-medium text-fg-muted">
          {(['types', 'platforms', 'accounts', 'languages'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              {t(`trust.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      <Section title={t('features.title')} intro={t('features.intro')} cta={<ButtonLink href="/features" variant="secondary">{t('features.cta')}</ButtonLink>}>
        <FeatureGrid />
      </Section>

      <Section id="how-it-works" title={t('how.title')} intro={t('how.intro')}>
        <HowStepper />
      </Section>

      {/* Planner preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal className="grid items-center gap-10 rounded-3xl border border-border bg-surface p-6 shadow-soft md:grid-cols-2 md:p-10">
          <RevealItem>
            <h2 className="text-3xl font-bold tracking-tight">{t('preview.sectionTitle')}</h2>
            <p className="mt-3 text-fg-muted">{t('preview.sectionText')}</p>
            <ButtonLink href="/calculator" size="lg" shimmer className="mt-6">
              {t('hero.ctaPrimary')}
            </ButtonLink>
          </RevealItem>
          <RevealItem>
            <div aria-hidden="true" className="rounded-2xl border border-border bg-bg p-4">
              <div className="flex gap-1 overflow-hidden rounded-xl bg-surface-muted p-1 text-xs">
                {PREVIEW_TABS.slice(0, 4).map((tab, i) => (
                  <span key={tab} className={i === 1 ? 'rounded-lg bg-surface px-3 py-1.5 font-semibold shadow-soft' : 'px-3 py-1.5 text-fg-muted'}>
                    {tt(tab)}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['clientValue', 'margin', 'bookingRate', 'closeRate'].map((f) => (
                  <div key={f} className="flex flex-col gap-1.5">
                    <span className="h-2.5 w-20 rounded bg-border-strong/60" />
                    <span className="h-9 rounded-lg border border-border-strong bg-surface" />
                  </div>
                ))}
              </div>
              <div className="mt-4 h-10 rounded-lg bg-accent/90" />
            </div>
          </RevealItem>
        </Reveal>
      </section>

      <Section title={t('guides.title')} intro={t('guides.intro')} cta={<ButtonLink href="/guides" variant="secondary">{t('guides.cta')}</ButtonLink>}>
        <Reveal as="ul" className="grid gap-6 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g) => (
            <RevealItem key={g.slug} as="li" className="relative">
              <GuideCard guide={g} />
            </RevealItem>
          ))}
        </Reveal>
      </Section>

      <Section title={t('faq.title')} cta={<ButtonLink href="/faq" variant="secondary">{t('faq.cta')}</ButtonLink>}>
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQ_IDS.slice(0, HOME_FAQ_COUNT).map((id) => ({ q: tf(`${id}.q`), a: tf(`${id}.a`) }))} />
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <SupportBanner />
      </div>
    </main>
  );
}
