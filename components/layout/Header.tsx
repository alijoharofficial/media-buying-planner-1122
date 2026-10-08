'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, usePathname } from '@/i18n/navigation';
import { getDirection, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { HEADER_NAV } from '@/lib/site';

/** Sticky header with blur on scroll and a mobile slide-in menu. */
export function Header() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // The panel sits at the inline end, so it slides in from the right (LTR) or the left (RTL).
  const offscreen = getDirection(locale) === 'rtl' ? '-100%' : '100%';
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={cn('no-print sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300', scrolled ? 'glass border-b border-border shadow-soft' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="rounded-lg focus-glow">
          <Logo size={32} asText className="max-sm:hidden" />
          <Logo variant="compact" size={30} asText className="sm:hidden" />
        </Link>

        <nav aria-label={t('nav.label')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {HEADER_NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-glow',
                    isActive(item.href) ? 'text-accent' : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="max-sm:hidden" />
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t('nav.openMenu')}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted hover:text-fg focus-glow lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <m.div className="fixed inset-0 z-40 bg-navy/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden="true" />
            <m.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              className="fixed inset-y-0 end-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-6 bg-bg-elevated p-5 shadow-lift lg:hidden"
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between">
                <Logo variant="compact" size={28} />
                <button type="button" onClick={() => setOpen(false)} aria-label={t('nav.closeMenu')} className="inline-flex size-10 items-center justify-center rounded-lg border border-border focus-glow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <nav aria-label={t('nav.label')}>
                <ul className="flex flex-col gap-1">
                  {HEADER_NAV.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className={cn('block rounded-lg px-3 py-3 text-base font-medium focus-glow', isActive(item.href) ? 'bg-accent-soft text-accent' : 'hover:bg-surface-muted')}
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <LanguageSwitcher className="mt-auto w-full [&_select]:w-full" />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
