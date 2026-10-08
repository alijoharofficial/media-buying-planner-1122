'use client';

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, type MouseEvent } from 'react';
import { CountUp } from '@/components/results/CountUp';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { formatCurrency, formatNumber } from '@/lib/format';

const AuroraCanvas = dynamic(() => import('./AuroraCanvas'), { ssr: false });

function words(text: string, locale: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Seg) return Array.from(new Seg(locale, { granularity: 'word' }).segment(text), (s) => s.segment);
  return text.split(/(\s+)/);
}

/** Word reveal done in CSS, so the text paints with the first HTML (no wait for hydration). */
function RevealText({ text, as: Tag, className, delay = 0 }: { text: string; as: 'h1' | 'p'; className: string; delay?: number }) {
  const locale = useLocale();
  const parts = useMemo(() => words(text, locale), [text, locale]);
  let n = 0;
  return (
    <Tag className={className}>
      {parts.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="word-rise" style={{ animationDelay: `${delay + n++ * 0.04}s` }}>
            {w}
          </span>
        ),
      )}
    </Tag>
  );
}

const CHART = 'M0 70 C 30 66, 50 58, 80 52 S 130 38, 160 34 S 210 20, 240 14';

export function Hero() {
  const t = useTranslations('home');
  const tc = useTranslations('common.meta');
  const locale = useLocale();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section onMouseMove={onMove} onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }} className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_70%_30%,var(--color-accent-soft),transparent),radial-gradient(50%_50%_at_20%_70%,rgb(99_102_241/0.12),transparent)]" />
      <div className="absolute inset-0 -z-10">
        <AuroraCanvas />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <m.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-semibold text-accent">
            {tc('tagline')}
          </m.p>
          <RevealText as="h1" text={t('hero.title')} className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl" />
          <RevealText as="p" text={t('hero.subtitle')} className="mt-5 max-w-xl text-lg text-fg-muted" delay={0.1} />
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/calculator" size="lg" shimmer>
              {t('hero.ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/how-to-use" size="lg" variant="secondary">
              {t('hero.ctaSecondary')}
            </ButtonLink>
          </m.div>
        </div>

        <div className="[perspective:1200px]">
          <m.div
            style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.6 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
            className="glass rounded-2xl border border-border p-6 shadow-lift"
            role="img"
            aria-label={t('preview.alt')}
          >
            <div className="flex items-center justify-between gap-3" aria-hidden="true">
              <span className="text-sm font-semibold">{t('preview.title')}</span>
              <span className="text-xs text-fg-subtle">{t('preview.sample')}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4" aria-hidden="true">
              <div>
                <p className="text-xs text-fg-muted">{t('preview.budget')}</p>
                <p className="text-3xl font-extrabold tracking-tight">
                  <CountUp value={4550} format={(v) => formatCurrency(v, locale, 'USD')} duration={1400} />
                </p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">{t('preview.daily')}</p>
                <p className="text-2xl font-bold">
                  <CountUp value={150} format={(v) => formatCurrency(v, locale, 'USD')} duration={1400} />
                </p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">{t('preview.leads')}</p>
                <p className="text-xl font-bold">
                  <CountUp value={154} format={(v) => formatNumber(v, locale)} duration={1400} />
                </p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">{t('preview.cpl')}</p>
                <p className="text-xl font-bold">
                  <CountUp value={29.5} format={(v) => formatCurrency(v, locale, 'USD', 2)} duration={1400} />
                </p>
              </div>
            </div>
            <svg viewBox="0 0 240 80" className="mt-5 h-24 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.25" />
                  <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <m.path d={`${CHART} L 240 80 L 0 80 Z`} fill="url(#hero-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} />
              <m.path d={CHART} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.3 }} />
            </svg>
            <m.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 1.6 }} className="mt-3" aria-hidden="true">
              <Badge tone="success" className="px-3 py-1 text-sm">
                ✓ {t('preview.verdict')}
              </Badge>
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
