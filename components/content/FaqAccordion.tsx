'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export type FaqItem = { q: string; a: string };

/** Accessible accordion (button + region, aria-expanded/controls). */
export function FaqAccordion({ items, headingLevel = 3 }: { items: FaqItem[]; headingLevel?: 2 | 3 }) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(0);
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btn = `${base}-q-${i}`;
        const panel = `${base}-a-${i}`;
        return (
          <div key={item.q}>
            <H className="m-0">
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-semibold focus-glow"
              >
                {item.q}
                <span aria-hidden="true" className={cn('text-xl text-accent transition-transform duration-200', isOpen && 'rotate-45')}>
                  +
                </span>
              </button>
            </H>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 leading-relaxed text-fg-muted">{item.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
