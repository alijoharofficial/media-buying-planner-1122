/** Locale-aware formatting helpers built on Intl. */

export function formatNumber(value: number, locale: string, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

export function formatCurrency(value: number, locale: string, currency: string, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits }).format(value);
}

/** value is a ratio (0.25 = 25%). */
export function formatPercent(value: number, locale: string, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits }).format(value);
}

export function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
