import { useLocale, useTranslations } from 'next-intl';
import type { ComponentProps, ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@/lib/brand';
import { EXTERNAL } from '@/lib/site';
import { localizedSlug } from '@/lib/slugs';

/** "Try it in Media Buying Planner" CTA box, used inside every article. */
export function TryPlanner({ text }: { text?: string }) {
  const t = useTranslations('guides.article.cta');
  return (
    <aside className="not-prose my-10 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-bold text-fg">{t('title', { brand: BRAND_NAME })}</p>
        <p className="mt-1 text-sm text-fg-muted">{text ?? t('text')}</p>
      </div>
      <ButtonLink href="/calculator" shimmer className="shrink-0">
        {t('button')}
      </ButtonLink>
    </aside>
  );
}

/** Highlighted note or worked example. */
export function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-xl border-s-4 border-accent bg-surface-muted p-5 text-[0.95rem] leading-relaxed text-fg">
      {title && <p className="mb-2 font-semibold">{title}</p>}
      <div className="flex flex-col gap-2 [&_p]:text-fg-muted">{children}</div>
    </div>
  );
}

/** A formula line, shown in a monospace-free, readable box. */
export function Formula({ children }: { children: ReactNode }) {
  return <p className="not-prose my-4 rounded-lg border border-border bg-surface px-4 py-3 text-center font-semibold text-fg">{children}</p>;
}

/** Internal links stay in the current locale; external links open in a new tab. */
export function SmartLink({ href = '', children, ...rest }: ComponentProps<'a'>) {
  const locale = useLocale();
  if (href.startsWith('/guides/')) return <Link href={`/guides/${localizedSlug(href.slice('/guides/'.length), locale)}`}>{children}</Link>;
  if (href.startsWith('/')) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener" {...rest}>
      {children}
    </a>
  );
}

/** Byline: "Guide by TECH24". */
export function Byline({ date, minutes }: { date: ReactNode; minutes: number }) {
  const t = useTranslations('guides.article');
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-fg-muted">
      <a href={EXTERNAL.tech24} target="_blank" rel="noopener" className="font-semibold text-accent hover:underline">
        {t('byline')}
      </a>
      <span aria-hidden="true">·</span>
      {date}
      <span aria-hidden="true">·</span>
      <span>{t('readingTime', { minutes })}</span>
    </p>
  );
}

/** Author box: "Written by the TECH24 team". */
export function AuthorBox() {
  const t = useTranslations('guides.article');
  return (
    <aside className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-fg" aria-hidden="true">
        T24
      </span>
      <div>
        <p className="font-semibold">{t('authorTitle')}</p>
        <p className="mt-1 text-sm text-fg-muted">{t('authorText')}</p>
        <a href={EXTERNAL.tech24} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          {t('authorLink')} <Icon name="globe" size={14} />
        </a>
      </div>
    </aside>
  );
}
