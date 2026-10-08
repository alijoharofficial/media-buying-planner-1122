'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { FunnelStage } from '@/lib/engine';
import { useFormat } from './useFormat';

/** Animated funnel: count stages as bars sized to the first stage, revenue as a closing figure. */
export function Funnel({ stages, currency }: { stages: FunnelStage[]; currency: string }) {
  const t = useTranslations('results.deliver');
  const f = useFormat(currency);
  const counts = stages.filter((s) => s.unit === 'number');
  const money = stages.filter((s) => s.unit === 'currency');
  const max = Math.max(1, ...counts.map((s) => s.value));
  const fmt = (s: FunnelStage, v: number) => (s.unit === 'currency' ? f.money(v, 0) : f.num(v, v < 10 ? 1 : 0));
  const ranged = (s: FunnelStage) => Math.abs(s.high - s.low) > 0.01 * Math.max(1, s.value);

  return (
    <ol className="flex flex-col gap-3">
      {counts.map((s, i) => (
        <li key={s.key} className="grid grid-cols-[minmax(6rem,9rem)_1fr] items-center gap-3">
          <span className="text-sm font-medium text-fg-muted">{t(`stages.${s.key}`)}</span>
          <div className="relative h-10 overflow-hidden rounded-lg bg-surface-muted">
            <m.div
              className="absolute inset-y-0 start-0 rounded-lg bg-accent"
              style={{ opacity: 1 - i * 0.15 }}
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(4, (s.value / max) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="relative flex h-full items-center gap-2 px-3 text-sm font-semibold text-fg">
              <span className="rounded bg-surface/80 px-1.5 tabular-nums">{fmt(s, s.value)}</span>
              {ranged(s) && <span className="rounded bg-surface/80 px-1.5 text-xs font-normal text-fg-muted">{t('range', { low: fmt(s, s.low), high: fmt(s, s.high) })}</span>}
            </span>
          </div>
        </li>
      ))}
      {money.map((s) => (
        <li key={s.key} className="grid grid-cols-[minmax(6rem,9rem)_1fr] items-center gap-3">
          <span className="text-sm font-medium text-fg-muted">{t(`stages.${s.key}`)}</span>
          <span className="text-lg font-bold tabular-nums">
            {fmt(s, s.value)}
            {ranged(s) && <span className="ms-2 text-xs font-normal text-fg-muted">{t('range', { low: fmt(s, s.low), high: fmt(s, s.high) })}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
