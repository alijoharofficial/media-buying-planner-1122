import { useFormatter, useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { GuideMeta } from '@/lib/site';

const HUES: Record<GuideMeta['category'], string> = {
  budgets: 'from-indigo-500/25 to-cyan-400/25',
  metaAds: 'from-violet-500/25 to-indigo-400/25',
  ecommerce: 'from-cyan-500/25 to-emerald-400/25',
  strategy: 'from-amber-400/25 to-rose-400/25',
};

/** Cover illustration generated from one template: category gradient, chart lines and the guide icon (no photos). */
export function GuideCover({ guide, large }: { guide: GuideMeta; large?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br ${HUES[guide.category]} ${large ? 'aspect-[21/9] rounded-2xl' : 'aspect-[16/9]'}`} aria-hidden="true">
      <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full text-accent/30" preserveAspectRatio="none">
        <path d="M0 70 C 40 60, 60 40, 90 45 S 140 20, 160 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M0 80 C 40 75, 70 60, 100 62 S 140 45, 160 40" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className={`relative flex items-center justify-center rounded-2xl bg-surface/80 text-accent shadow-soft transition-transform duration-300 group-hover:scale-110 ${large ? 'size-24' : 'size-16'}`}>
        <Icon name={guide.icon} size={large ? 44 : 30} />
      </span>
    </div>
  );
}

/** Guide card: cover, category, title link, summary, date and reading time. */
export function GuideCard({ guide, minutes }: { guide: GuideMeta; minutes?: number }) {
  const t = useTranslations('guides');
  const format = useFormatter();
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift">
      <GuideCover guide={guide} />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">{t(`categories.${guide.category}`)}</span>
        <h3 className="font-semibold leading-snug">
          <Link href={`/guides/${guide.slug}`} className="after:absolute after:inset-0 focus-glow rounded">
            {t(`items.${guide.slug}.title`)}
          </Link>
        </h3>
        <p className="text-sm text-fg-muted">{t(`items.${guide.slug}.summary`)}</p>
        <p className="mt-auto flex gap-2 pt-2 text-xs text-fg-subtle">
          <time dateTime={guide.date}>{format.dateTime(new Date(guide.date), { dateStyle: 'medium' })}</time>
          {minutes ? <span>· {t('article.readingTime', { minutes })}</span> : null}
        </p>
      </div>
    </article>
  );
}
