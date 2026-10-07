import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export const EXPERT_URL = 'https://alijohar.work';

/** Expert opinion banner (brief 13). One component, used on Home, after results and after articles. */
export function SupportBanner({ variant = 'default', className }: { variant?: 'default' | 'compact'; className?: string }) {
  const t = useTranslations('common.support');
  return (
    <aside
      aria-label={t('tagline')}
      className={cn(
        'relative overflow-hidden rounded-2xl p-[2px] [background:linear-gradient(120deg,var(--gradient-aurora-1),var(--gradient-aurora-2),var(--gradient-aurora-3),var(--gradient-aurora-1))] [background-size:300%_300%] motion-safe:animate-[support-border_8s_ease_infinite]',
        className,
      )}
    >
      <div className={cn('flex flex-col items-start gap-4 rounded-[14px] bg-bg-elevated md:flex-row md:items-center md:justify-between', variant === 'compact' ? 'p-5' : 'p-6 md:p-8')}>
        <div>
          <p className={cn('font-bold tracking-tight', variant === 'compact' ? 'text-lg' : 'text-xl md:text-2xl')}>{t('tagline')}</p>
          <p className="mt-1 text-fg-muted">{t('subline')}</p>
        </div>
        <a
          href={EXPERT_URL}
          target="_blank"
          rel="noopener"
          className="shimmer inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg shadow-soft transition-transform hover:-translate-y-0.5 focus-glow"
        >
          {t('button')} <span className="rtl-mirror" aria-hidden="true">↗</span>
        </a>
      </div>
    </aside>
  );
}
