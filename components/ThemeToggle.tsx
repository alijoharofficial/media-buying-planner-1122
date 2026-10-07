'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';

const subscribe = () => () => {};

/** Light/dark toggle. Follows the system until the user picks; next-themes saves the choice. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('common.theme');
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      title={isDark ? t('light') : t('dark')}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent focus-glow',
        className,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Sun shown in dark mode (switch to light), moon in light mode. Hidden until mounted to avoid mismatch. */}
        {!mounted ? null : isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  );
}
