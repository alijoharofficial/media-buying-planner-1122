'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, revealOnScroll, stagger } from '@/lib/motion';

/** Scroll-triggered fade/slide reveal. Children with `RevealItem` stagger in. */
export function Reveal({ children, className, as = 'div', delay = 0 }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'ul' | 'ol'; delay?: number }) {
  const M = m[as];
  return (
    <M className={className} variants={stagger(0.08, delay)} {...revealOnScroll}>
      {children}
    </M>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const M = m[as];
  return (
    <M className={className} variants={fadeUp}>
      {children}
    </M>
  );
}
