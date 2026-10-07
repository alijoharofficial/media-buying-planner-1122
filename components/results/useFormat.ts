'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import type { Unit } from '@/lib/engine';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

/** Locale + currency aware formatters for result values. */
export function useFormat(currency: string) {
  const locale = useLocale();
  return useMemo(() => {
    const money = (v: number, digits?: number) => formatCurrency(v, locale, currency, digits ?? (Math.abs(v) < 100 ? 2 : 0));
    const num = (v: number, digits?: number) => formatNumber(v, locale, digits ?? (Math.abs(v) < 10 ? 2 : 0));
    const pct = (v: number, digits = 1) => formatPercent(v, locale, digits);
    const unit = (v: number, u: Unit) =>
      u === 'currency' ? money(v) : u === 'percent' ? pct(v, 2) : u === 'multiplier' ? `${formatNumber(v, locale, 2)}×` : num(v);
    return { money, num, pct, unit, locale };
  }, [locale, currency]);
}
