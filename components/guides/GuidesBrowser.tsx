'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { GuideCard } from '@/components/content/GuideCard';
import { cn } from '@/lib/cn';
import type { GuideMeta } from '@/lib/site';

const CATEGORIES = ['budgets', 'metaAds', 'ecommerce', 'strategy'] as const;

/** Guides index: search, category filter and reading time. */
export function GuidesBrowser({ guides }: { guides: Array<GuideMeta & { minutes: number }> }) {
  const t = useTranslations('guides');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GuideMeta['category'] | 'all'>('all');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter(
      (g) =>
        (category === 'all' || g.category === category) &&
        (!q || `${t(`items.${g.slug}.title`)} ${t(`items.${g.slug}.summary`)}`.toLowerCase().includes(q)),
    );
  }, [guides, query, category, t]);

  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block md:w-80">
          <span className="sr-only">{t('index.searchLabel')}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('index.searchPlaceholder')}
            className="h-11 w-full rounded-lg border border-border-strong bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_4px_var(--color-ring)]"
          />
        </label>
        <div role="group" aria-label={t('index.filterLabel')} className="flex flex-wrap gap-2">
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-glow',
                category === c ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface text-fg-muted hover:border-accent hover:text-accent',
              )}
            >
              {c === 'all' ? t('index.all') : t(`categories.${c}`)}
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {t('index.count', { count: shown.length })}
      </p>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-fg-muted">{t('index.noResults')}</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => (
            <li key={g.slug}>
              <GuideCard guide={g} minutes={g.minutes} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
