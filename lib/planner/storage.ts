import type { Platform } from '@/lib/engine';
import { defaultValues } from './convert';
import type { FormValues } from './types';

/** All browser storage goes through these guards: storage can be missing or throw (private mode, blocked). */
function read<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: autosave is a convenience only */
  }
}

const KEYS = { draft: 'mbp:planner:v1', scenarios: 'mbp:scenarios:v1', benchmarks: 'mbp:benchmarks:v1' };

/** Merge stored or shared values onto defaults, keeping only known planner keys. */
export function sanitizeValues(input: unknown): FormValues {
  const base = defaultValues();
  if (!input || typeof input !== 'object') return base;
  const src = input as Record<string, unknown>;
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base)) {
    if (!(key in src)) continue;
    const def = (base as Record<string, unknown>)[key];
    const val = src[key];
    if (key === 'settings' || key === 'sources') out[key] = { ...(def as object), ...(val && typeof val === 'object' ? val : {}) };
    else if (Array.isArray(def) ? Array.isArray(val) : def === undefined ? typeof val === 'number' : typeof val === typeof def) out[key] = val;
  }
  return out as FormValues;
}

// ---------- Draft autosave ----------
export type Draft = { values: FormValues; started: boolean };
export const loadDraft = (): Draft | undefined => {
  const d = read<Draft>(KEYS.draft);
  return d ? { values: sanitizeValues(d.values), started: Boolean(d.started) } : undefined;
};
export const saveDraft = (d: Draft) => write(KEYS.draft, d);
export const clearDraft = () => write(KEYS.draft, undefined);

// ---------- Scenarios ----------
export type Scenario = { id: string; name: string; savedAt: number; values: FormValues };
export const MAX_SCENARIOS = 20;
export const loadScenarios = (): Scenario[] => (read<Scenario[]>(KEYS.scenarios) ?? []).map((s) => ({ ...s, values: sanitizeValues(s.values) }));
export function saveScenario(name: string, values: FormValues): Scenario[] {
  const list = [{ id: crypto.randomUUID(), name, savedAt: Date.now(), values }, ...loadScenarios()].slice(0, MAX_SCENARIOS);
  write(KEYS.scenarios, list);
  return list;
}
export function deleteScenario(id: string): Scenario[] {
  const list = loadScenarios().filter((s) => s.id !== id);
  write(KEYS.scenarios, list);
  return list;
}

// ---------- Share link (URL hash, no server storage) ----------
const HASH_PREFIX = '#plan=';

export function encodeShare(values: FormValues): string {
  const bytes = new TextEncoder().encode(JSON.stringify(values));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return HASH_PREFIX + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShare(hash: string): FormValues | undefined {
  if (!hash.startsWith(HASH_PREFIX)) return undefined;
  try {
    const b64 = hash.slice(HASH_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return sanitizeValues(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return undefined;
  }
}

// ---------- My benchmarks (7.9) ----------
/** Rates stored as 0 to 100, like form values. */
export type BenchmarkRow = {
  id: string;
  niche: string;
  region: string;
  platform: Platform;
  month: number;
  cpm?: number;
  ctr?: number;
  cvr?: number;
  cost?: number;
  savedAt: number;
};

export const loadBenchmarks = (): BenchmarkRow[] => read<BenchmarkRow[]>(KEYS.benchmarks) ?? [];
export function addBenchmark(row: Omit<BenchmarkRow, 'id' | 'savedAt'>): BenchmarkRow[] {
  const list = [{ ...row, id: crypto.randomUUID(), savedAt: Date.now() }, ...loadBenchmarks()];
  write(KEYS.benchmarks, list);
  return list;
}
export function deleteBenchmark(id: string): BenchmarkRow[] {
  const list = loadBenchmarks().filter((r) => r.id !== id);
  write(KEYS.benchmarks, list);
  return list;
}

/** Average of the most recent matching rows (same niche + region + platform). */
export function averageBenchmarks(rows: BenchmarkRow[], niche: string, regions: string[], platform: Platform, take = 3) {
  const matches = rows
    .filter((r) => r.niche === niche && r.platform === platform && (regions.length === 0 || regions.includes(r.region)))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, take);
  if (!matches.length) return undefined;
  const avg = (k: 'cpm' | 'ctr' | 'cvr' | 'cost') => {
    const vals = matches.map((r) => r[k]).filter((x): x is number => typeof x === 'number');
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  };
  return { count: matches.length, cpm: avg('cpm'), ctr: avg('ctr'), cvr: avg('cvr'), cost: avg('cost') };
}
