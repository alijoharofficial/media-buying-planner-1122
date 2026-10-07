'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/** Switches locale on the same page. Calculator inputs persist via localStorage autosave. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('common.language');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">{t('label')}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          const { search, hash } = window.location; // keep query and share-link hash
          startTransition(() => router.replace(`${pathname}${search}${hash}`, { locale: next, scroll: false }));
        }}
        className="h-10 cursor-pointer appearance-none rounded-lg border border-border bg-surface pe-8 ps-3 text-sm font-medium text-fg transition-colors hover:border-accent focus-glow"
      >
        {locales.map((l) => (
          <option key={l} value={l} lang={l}>
            {t(l)}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute end-2.5 text-fg-subtle" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </label>
  );
}
