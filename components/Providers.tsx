'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

export function Providers({ children, nonce }: { children: ReactNode; nonce?: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange nonce={nonce}>
      {/* "user" makes every Framer Motion animation honour prefers-reduced-motion */}
      <MotionConfig reducedMotion="user">
        {/* Lazy features keep the animation engine out of the first JS load; components use `m.*`. */}
        <LazyMotion features={loadFeatures} strict>
          <ToastProvider>{children}</ToastProvider>
        </LazyMotion>
      </MotionConfig>
    </ThemeProvider>
  );
}
