/** CSV import for Meta Ads Manager and Google Ads exports: parse, auto-map columns, aggregate. */

export type CsvTable = { headers: string[]; rows: string[][] };

/** RFC 4180 style parser (quotes, escaped quotes, commas, semicolons or tabs). */
export function parseCsv(text: string): CsvTable {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/).find((l) => l.trim()) ?? '';
  const delim = [',', ';', '\t'].reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ',');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) {
      row.push(cell.trim());
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x !== '')) rows.push(row);
  // Google exports start with a title line: use the first row that has 3+ cells as headers.
  const headerIdx = Math.max(0, rows.findIndex((r) => r.filter(Boolean).length >= 3));
  return { headers: rows[headerIdx] ?? [], rows: rows.slice(headerIdx + 1) };
}

export type CsvTarget = 'meta' | 'google';

/** Planner field to header aliases (lower case). */
export const COLUMN_ALIASES: Record<CsvTarget, Record<string, string[]>> = {
  meta: {
    country: ['country', 'region'],
    spend: ['amount spent', 'amount spent (usd)', 'spend', 'cost'],
    impressions: ['impressions'],
    reach: ['reach'],
    linkClicks: ['link clicks', 'clicks (link)', 'outbound clicks'],
    landingPageViews: ['landing page views', 'website landing page views'],
    formLeads: ['on-facebook leads', 'instant form leads', 'leads (form)', 'meta leads'],
    landingLeads: ['website leads', 'leads', 'results'],
    addToCarts: ['adds to cart', 'website adds to cart', 'add to cart'],
    checkouts: ['checkouts initiated', 'website checkouts initiated'],
    purchases: ['purchases', 'website purchases'],
    purchaseValue: ['purchases conversion value', 'website purchases conversion value', 'purchase value'],
  },
  google: {
    gCost: ['cost'],
    gImpressions: ['impr.', 'impressions'],
    gClicks: ['clicks'],
    gConversions: ['conversions', 'conv.'],
    gConversionValue: ['conv. value', 'conversion value', 'all conv. value'],
    gImpressionShare: ['search impr. share', 'search impression share'],
    gLostBudget: ['search lost is (budget)', 'search lost impression share (budget)'],
    gLostRank: ['search lost is (rank)', 'search lost impression share (rank)'],
  },
};

/** Field id to column index (-1 = not mapped). Exact alias matches win over partial ones. */
export function autoMap(headers: string[], target: CsvTarget): Record<string, number> {
  const lower = headers.map((h) => h.toLowerCase().trim());
  const used = new Set<number>();
  const map: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES[target])) {
    let idx = lower.findIndex((h, i) => !used.has(i) && aliases.includes(h));
    if (idx < 0) idx = lower.findIndex((h, i) => !used.has(i) && aliases.some((a) => h.startsWith(a)));
    map[field] = idx;
    if (idx >= 0) used.add(idx);
  }
  return map;
}

/** Parses "1,234.5", "12.3%", "< 10%", "--". Returns undefined when not a number. */
export function parseCell(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const s = raw.replace(/[<>%\s]/g, '').replace(/[^\d.,-]/g, '');
  if (!s || s === '-' || s === '--') return undefined;
  // "1.234,56" (comma decimal) vs "1,234.56"
  const normalized = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

const isTotalRow = (r: string[]) => r.some((c) => /^total/i.test(c));

/** Meta: one aggregated row per country (or one row if no country column). */
export function aggregateMeta(table: CsvTable, map: Record<string, number>) {
  const groups = new Map<string, Record<string, number>>();
  for (const r of table.rows) {
    if (isTotalRow(r)) continue;
    const countryIdx = map.country ?? -1;
    const country = countryIdx >= 0 ? (r[countryIdx] ?? '') : '';
    const acc = groups.get(country) ?? {};
    for (const [field, idx] of Object.entries(map)) {
      if (field === 'country' || idx < 0) continue;
      const v = parseCell(r[idx]);
      if (v !== undefined) acc[field] = (acc[field] ?? 0) + v;
    }
    groups.set(country, acc);
  }
  return Array.from(groups.entries()).map(([country, vals]) => ({ country, ...vals }));
}

/** Google: totals; impression share fields weighted by impressions. */
export function aggregateGoogle(table: CsvTable, map: Record<string, number>) {
  const totals: Record<string, number> = {};
  const shareKeys = ['gImpressionShare', 'gLostBudget', 'gLostRank'];
  const weights: Record<string, number> = {};
  for (const r of table.rows) {
    if (isTotalRow(r)) continue;
    const imp = parseCell(r[map.gImpressions ?? -1]) ?? 0;
    for (const [field, idx] of Object.entries(map)) {
      if (idx < 0) continue;
      const v = parseCell(r[idx]);
      if (v === undefined) continue;
      if (shareKeys.includes(field)) {
        totals[field] = (totals[field] ?? 0) + v * (imp || 1);
        weights[field] = (weights[field] ?? 0) + (imp || 1);
      } else totals[field] = (totals[field] ?? 0) + v;
    }
  }
  for (const k of shareKeys) if (weights[k]) totals[k] = Math.round(((totals[k] ?? 0) / (weights[k] ?? 1)) * 100) / 100;
  return totals;
}
