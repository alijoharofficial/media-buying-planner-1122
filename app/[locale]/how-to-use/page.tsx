import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/content/ContentPage';
import { HowStepper } from '@/components/content/HowStepper';
import { Reveal, RevealItem } from '@/components/content/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { pageMetadata, type PageProps } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps) {
  return pageMetadata((await params).locale, 'pages.howTo', '/how-to-use');
}

const TABS = ['setup', 'business', 'account', 'estimates', 'planning', 'advanced'] as const;
const WHERE = ['spend', 'impressions', 'reach', 'clicks', 'leads', 'purchases', 'impressionShare', 'lostBudget', 'searchVolume', 'bids'] as const;

/** Small tab illustration: a stylised form with as many field rows as the tab has groups. */
function TabIllustration({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-28 shrink-0 text-accent" aria-hidden="true">
      <rect x="1" y="1" width="118" height="78" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border)" />
      <rect x="10" y="9" width={30 + index * 8} height="6" rx="3" fill="currentColor" opacity="0.8" />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x="10" y={24 + r * 17} width="22" height="4" rx="2" fill="var(--color-border-strong)" />
          <rect x="10" y={30 + r * 17} width={50 + ((index + r) % 3) * 15} height="7" rx="3" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
        </g>
      ))}
    </svg>
  );
}

export default async function HowToUsePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations('common.nav');
  const t = await getTranslations('pages.howTo');
  const tt = await getTranslations('planner.tabs');

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} crumb={{ name: tn('howToUse'), path: '/how-to-use' }} />
      <div className="mt-14">
        <HowStepper headingLevel="h2" />
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('tabsTitle')}</h2>
        <p className="mt-2 text-fg-muted">{t('tabsIntro')}</p>
        <Reveal as="ol" className="mt-8 grid gap-4 md:grid-cols-2">
          {TABS.map((tab, i) => (
            <RevealItem key={tab} as="li">
              <article className="flex h-full gap-4 rounded-xl border border-border bg-surface p-5 shadow-soft">
                <TabIllustration index={i} />
                <div>
                  <h3 className="font-semibold">
                    {i + 1}. {tt(tab)}
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">{t(`tabs.${tab}`)}</p>
                </div>
              </article>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('whereTitle')}</h2>
        <p className="mt-2 text-fg-muted">{t('whereIntro')}</p>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-muted text-start">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('where.number')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('where.meta')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('where.google')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {WHERE.map((row) => (
                <tr key={row}>
                  <th scope="row" className="px-4 py-3 text-start font-medium">{t(`where.rows.${row}.name`)}</th>
                  <td className="px-4 py-3 text-fg-muted">{t(`where.rows.${row}.meta`)}</td>
                  <td className="px-4 py-3 text-fg-muted">{t(`where.rows.${row}.google`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-14 flex justify-center">
        <ButtonLink href="/calculator" size="lg" shimmer>
          {t('cta')}
        </ButtonLink>
      </div>
    </main>
  );
}
