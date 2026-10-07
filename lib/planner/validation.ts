import { z } from 'zod';
import {
  CAMPAIGN_FIELDS,
  FIELDS,
  META_ROW_FIELDS,
  SETTING_FIELDS,
  fieldById,
  is,
  isRequired,
  isVisible,
  type FieldDef,
  type RowFieldDef,
} from './fields';
import type { FormValues, Mode, TabId } from './types';

export type Issue = { path: string; code: string; params?: Record<string, number | string>; tab: TabId };
export type ValidationResult = { errors: Issue[]; warnings: Issue[] };

export const modeOf = (v: Pick<FormValues, keyof Mode>): Mode => ({
  businessType: v.businessType,
  accountStatus: v.accountStatus,
  platforms: v.platforms,
  goalType: v.goalType,
  leadSource: v.leadSource,
});

// ---------- Schema generated from the field config ----------

function fieldSchema(f: FieldDef | RowFieldDef, required: boolean): z.ZodType {
  let s: z.ZodType;
  switch (f.kind) {
    case 'niche':
    case 'currencyCode':
      s = z.string().min(1);
      break;
    case 'regions':
      s = z.array(z.string()).min(1);
      break;
    case 'month':
      s = z.number().int().min(0).max(11);
      break;
    case 'select':
      s = z.enum((f.options ?? []) as [string, ...string[]]);
      break;
    case 'toggle':
      s = z.boolean();
      break;
    case 'tags':
      s = z.array(z.string());
      break;
    case 'text':
      s = z.string();
      break;
    default: {
      let n = z.number();
      if (f.kind === 'integer') n = n.int();
      if (f.min !== undefined) n = n.min(f.min);
      if (f.max !== undefined) n = n.max(f.max);
      s = n;
    }
  }
  return required ? s : s.optional();
}

/** Nest dotted paths ("settings.a.b") into z.object shapes. */
function nest(entries: Array<[string, z.ZodType]>): z.ZodObject {
  const tree: Record<string, unknown> = {};
  for (const [path, schema] of entries) {
    const parts = path.split('.');
    let node = tree;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) node[p] = schema;
      else node = (node[p] ??= {}) as Record<string, unknown>;
    });
  }
  const build = (n: Record<string, unknown>): z.ZodObject =>
    z.object(Object.fromEntries(Object.entries(n).map(([k, v]) => [k, v instanceof z.ZodType ? v : build(v as Record<string, unknown>)])));
  return build(tree);
}

function rowSchema(defs: RowFieldDef[], m: Mode) {
  return z.object({}).passthrough().superRefine((row, ctx) => {
    for (const f of defs) {
      if (f.show && !f.show(m, row)) continue;
      const r = fieldSchema(f, isRequired(f, m)).safeParse((row as Record<string, unknown>)[f.id]);
      if (!r.success) for (const issue of r.error.issues) ctx.addIssue({ ...issue, path: [f.id, ...issue.path] } as never);
    }
  });
}

/** Base schema: Step 0 answers, shared by every mode. */
export const baseSchema = z.object({
  businessType: z.enum(['leads', 'ecommerce']),
  accountStatus: z.enum(['new', 'existing']),
  platforms: z.array(z.enum(['meta', 'google'])).min(1),
  goalType: z.enum(['target', 'budget']),
});

/** Base schema extended with the fields visible in this mode. */
export function schemaFor(m: Mode) {
  const visible = [...FIELDS, ...SETTING_FIELDS].filter((f) => isVisible(f, m));
  const shape = nest(visible.map((f) => [f.id, fieldSchema(f, isRequired(f, m))]));
  let schema = baseSchema.extend(shape.shape);
  if (is.existing(m)) {
    schema = schema.extend({
      metaCampaigns: z.array(rowSchema(CAMPAIGN_FIELDS, m)),
      metaRows: is.meta(m) ? z.array(rowSchema(META_ROW_FIELDS, m)).min(1) : z.array(z.unknown()),
    });
  }
  return schema;
}

// ---------- Issue mapping ----------

function defForPath(path: string): FieldDef | RowFieldDef | undefined {
  const [head, , col] = path.split('.');
  if (head === 'metaRows') return META_ROW_FIELDS.find((f) => f.id === col);
  if (head === 'metaCampaigns') return CAMPAIGN_FIELDS.find((f) => f.id === col);
  return fieldById(path);
}

export function tabOfPath(path: string): TabId {
  const head = path.split('.')[0] ?? '';
  if (head === 'metaRows' || head === 'metaCampaigns') return 'account';
  if (head === 'settings') return 'advanced';
  return (FIELDS.find((f) => f.id === head)?.tab ?? 'setup') as TabId;
}

function toIssue(i: z.core.$ZodIssue): Issue {
  const path = i.path.join('.');
  const def = defForPath(path);
  const tab = tabOfPath(path);
  const bounded = def?.min !== undefined && def?.max !== undefined;
  const range = { min: def?.min ?? 0, max: def?.max ?? 0 };
  switch (i.code) {
    case 'invalid_type':
      if (i.expected === 'int') return { path, code: 'integer', tab };
      return { path, code: i.input === undefined || i.input === null ? 'required' : 'invalid', tab };
    case 'too_small':
      if (i.origin === 'array' || i.origin === 'string') return { path, code: path === 'metaRows' ? 'rowsRequired' : 'required', tab };
      return bounded ? { path, code: 'range', params: range, tab } : { path, code: 'min', params: { min: Number(i.minimum) }, tab };
    case 'too_big':
      return bounded ? { path, code: 'range', params: range, tab } : { path, code: 'max', params: { max: Number(i.maximum) }, tab };
    case 'invalid_value':
      return { path, code: 'required', tab };
    default:
      return { path, code: 'invalid', tab };
  }
}

// ---------- Cross-field rules (all in one place) ----------

const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

type Add = (path: string, code: string, params?: Issue['params']) => void;

/** Hard cross-field rules (8): block calculation. */
export function crossFieldRules(v: FormValues, m: Mode, add: Add) {
  if (is.existing(m) && is.meta(m)) {
    v.metaRows.forEach((r, i) => {
      const p = `metaRows.${i}`;
      const imp = n(r.impressions);
      const clicks = n(r.linkClicks);
      if (imp !== undefined && (n(r.reach) ?? 0) > imp) add(`${p}.reach`, 'reachGtImpressions');
      if (imp !== undefined && (clicks ?? 0) > imp) add(`${p}.linkClicks`, 'clicksGtImpressions');
      if (clicks !== undefined && (n(r.landingPageViews) ?? 0) > clicks) add(`${p}.landingPageViews`, 'lpvGtClicks');
      if (is.leads(m)) {
        const leads = (m.leadSource !== 'landing' ? (n(r.formLeads) ?? 0) : 0) + (m.leadSource !== 'form' ? (n(r.landingLeads) ?? 0) : 0);
        if ((n(r.bookings) ?? 0) > leads) add(`${p}.bookings`, 'bookingsGtLeads');
        if ((n(r.shows) ?? 0) > (n(r.bookings) ?? 0)) add(`${p}.shows`, 'showsGtBookings');
        if ((n(r.clients) ?? 0) > (n(r.shows) ?? 0)) add(`${p}.clients`, 'clientsGtShows');
      }
    });
    v.metaCampaigns.forEach((c, i) => {
      if (c.budgetType === 'CBO' && (n(c.adSetsWithSpend) ?? 0) > (n(c.adSets) ?? Infinity)) add(`metaCampaigns.${i}.adSetsWithSpend`, 'adSetsSpendGtAdSets');
    });
  }
  if (is.ecom(m)) {
    const aov = n(v.aov);
    if (aov !== undefined && aov > 0) {
      const costs = (n(v.productCost) ?? 0) + (n(v.shipping) ?? 0) + (aov * (n(v.paymentFee) ?? 0)) / 100 + (aov * (n(v.returnRate) ?? 0)) / 100;
      if (costs >= aov) add('productCost', 'costsGteAov');
    }
  }
  if (is.existing(m) && is.google(m) && (n(v.gClicks) ?? 0) > (n(v.gImpressions) ?? Infinity)) add('gClicks', 'clicksGtImpressions');
  if (is.newAcc(m) && is.google(m) && (n(v.gBidLow) ?? 0) > (n(v.gBidHigh) ?? Infinity)) add('gBidLow', 'bidLowGtHigh');
  if ((n(v.settings.stopLossLow) ?? 0) > (n(v.settings.stopLossHigh) ?? Infinity)) add('settings.stopLossLow', 'stopLossOrder');
}

/** Soft warnings (8): shown, but calculation is allowed. */
export function softWarnings(v: FormValues, m: Mode, add: Add) {
  const minResults = n(v.settings.minResultsForConfidence) ?? 50;
  if (is.existing(m) && is.meta(m)) {
    let total = 0;
    v.metaRows.forEach((r, i) => {
      const p = `metaRows.${i}`;
      const imp = n(r.impressions) ?? 0;
      const clicks = n(r.linkClicks) ?? 0;
      const results = is.leads(m)
        ? (m.leadSource !== 'landing' ? (n(r.formLeads) ?? 0) : 0) + (m.leadSource !== 'form' ? (n(r.landingLeads) ?? 0) : 0)
        : (n(r.purchases) ?? 0);
      total += results;
      if (is.ecom(m) && (n(r.checkouts) ?? 0) > 0 && results > (n(r.checkouts) ?? 0)) add(`${p}.purchases`, 'purchasesGtCheckouts');
      if (imp > 0 && clicks / imp > 0.1) add(`${p}.linkClicks`, 'ctrHigh');
      if (clicks > 0 && results / clicks > 0.5) add(`${p}.linkClicks`, 'cvrHigh');
      if ((n(r.reach) ?? 0) > 0 && imp / (n(r.reach) ?? 1) > 5) add(`${p}.impressions`, 'frequencyHigh');
    });
    if (v.metaRows.length && total < minResults) add('metaRows', 'fewResults', { results: total, min: minResults });
  }
  if (is.existing(m) && is.google(m)) {
    const conv = n(v.gConversions);
    if (conv !== undefined && (n(v.gClicks) ?? 0) > 0 && conv / (n(v.gClicks) ?? 1) > 0.5) add('gConversions', 'cvrHigh');
    if (conv !== undefined && conv < minResults) add('gConversions', 'fewResults', { results: conv, min: minResults });
  }
  if (is.newAcc(m)) {
    if ((n(v.eCtr) ?? 0) > 10 && is.meta(m)) add('eCtr', 'ctrHigh');
    if ((n(v.eCvr) ?? 0) > 50 && is.meta(m)) add('eCvr', 'cvrHigh');
    if ((n(v.gCvrNew) ?? 0) > 50 && is.google(m)) add('gCvrNew', 'cvrHigh');
  }
}

/** Validate all visible inputs. Pure, so it runs on every change for tab badges. */
export function validate(values: FormValues): ValidationResult {
  const m = modeOf(values);
  const parsed = schemaFor(m).safeParse(values);
  const errors: Issue[] = parsed.success ? [] : parsed.error.issues.map(toIssue);
  const warnings: Issue[] = [];
  const seen = new Set(errors.map((e) => e.path));
  crossFieldRules(values, m, (path, code, params) => {
    if (!seen.has(path)) errors.push({ path, code, tab: tabOfPath(path), ...(params ? { params } : {}) });
  });
  softWarnings(values, m, (path, code, params) => warnings.push({ path, code, tab: tabOfPath(path), ...(params ? { params } : {}) }));
  return { errors, warnings };
}
