import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@/lib/brand';
import { EXTERNAL, FOOTER_QUICK, SERVICES } from '@/lib/site';

const linkClass = 'text-sm text-fg-muted transition-colors hover:text-accent focus-glow rounded';

/** Three zones (stack on mobile, mirror in RTL via logical layout) plus the bottom bar. */
export function Footer() {
  const t = useTranslations('common');
  const tf = useTranslations('features.items');
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-20 border-t border-border bg-bg-elevated">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Logo size={32} />
          <p className="text-sm text-fg-muted">{t('meta.tagline')}</p>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-fg-muted">{t('footer.expertText')}</p>
            <a href={EXTERNAL.expert} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline focus-glow">
              {t('footer.expertLink')} <span className="rtl-mirror" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h2 className="text-sm font-semibold">{t('footer.quickLinks')}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1">
            {FOOTER_QUICK.map((l) => (
              <li key={l.key}>
                <Link href={l.href} className={linkClass}>
                  {t(`nav.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.features')}>
          <h2 className="text-sm font-semibold">{t('footer.features')}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link href={{ pathname: '/services', hash: s.service }} className={linkClass}>
                  {tf(`${s.id}.service`)}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border pt-3">
              <a href={EXTERNAL.qr} target="_blank" rel="noopener" className={linkClass}>
                {t('footer.qr')} <span className="rtl-mirror" aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-fg-muted md:flex-row">
          <p>
            © {year} {BRAND_NAME} ·{' '}
            <a href={EXTERNAL.tech24} target="_blank" rel="noopener" className="hover:text-accent focus-glow rounded">
              {t('footer.guidesBy')}
            </a>
          </p>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
