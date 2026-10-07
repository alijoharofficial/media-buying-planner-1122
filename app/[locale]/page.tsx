import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCurrency } from '@/lib/format';

// Phase 1 placeholder: proves tokens, theme, logo, primitives and i18n. Full home page comes in Phase 5.
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');
  const tc = useTranslations('common.meta');

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Logo className="hidden sm:inline-flex" />
        <Logo variant="compact" className="sm:hidden" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
        <section>
          <p className="mb-3 text-sm font-semibold text-accent">{tc('tagline')}</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t('hero.title')}</h1>
          <p className="mt-4 text-lg text-fg-muted">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/calculator" size="lg" shimmer>
              {t('hero.ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/how-to-use" size="lg" variant="secondary">
              {t('hero.ctaSecondary')}
            </ButtonLink>
          </div>
        </section>
        <Card glass>
          <div className="flex items-center justify-between gap-2 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-2">
              {t('preview.budget')} <Tooltip content={t('preview.infoTooltip')} />
            </span>
            <Logo variant="icon" size={28} />
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums">{formatCurrency(4550, locale, 'USD')}</p>
          <Badge tone="success" className="mt-4">
            {t('preview.verdict')}
          </Badge>
        </Card>
      </main>
    </>
  );
}
