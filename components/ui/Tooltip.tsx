'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type TooltipProps = {
  content: ReactNode;
  /** Accessible label for the trigger. Defaults to the translated "More information". */
  label?: string;
  className?: string;
};

/** "i" info tooltip. Opens on hover, keyboard focus and tap; closes on Escape or outside tap. */
export function Tooltip({ content, label, className }: TooltipProps) {
  const t = useTranslations('common.ui');
  const id = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label ?? t('moreInfo')}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex size-5 items-center justify-center rounded-full border border-border-strong text-[11px] font-bold italic text-fg-muted transition-colors hover:border-accent hover:text-accent focus-glow"
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full start-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-bg-elevated p-3 text-start text-xs font-normal leading-relaxed text-fg shadow-lift rtl:translate-x-1/2"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
