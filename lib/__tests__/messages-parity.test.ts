import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { locales, namespaces } from '@/i18n/routing';

/** Every translated namespace must have exactly the English keys and the same {placeholders}. */

type Json = Record<string, unknown>;
const load = (locale: string, ns: string): Json | undefined => {
  const p = join(process.cwd(), 'messages', locale, `${ns}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as Json) : undefined;
};

function flatten(obj: unknown, prefix = '', out: Record<string, string> = {}) {
  if (Array.isArray(obj)) obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  else out[prefix] = String(obj);
  return out;
}

/** Top-level ICU argument names (ignores plural branches). */
const args = (s: string) => new Set(Array.from(s.matchAll(/\{(\w+)(?=[,}])/g), (m) => m[1]));

describe.each(locales.filter((l) => l !== 'en'))('%s messages', (locale) => {
  for (const ns of namespaces) {
    const target = load(locale, ns);
    it.skipIf(!target)(`${ns}: same keys and placeholders as en`, () => {
      const en = flatten(load('en', ns));
      const tr = flatten(target);
      expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort());
      for (const [k, v] of Object.entries(en)) expect([...args(tr[k] ?? '')].sort(), `${ns}.${k}`).toEqual([...args(v)].sort());
      for (const v of Object.values(tr)) expect(v.includes('Media Buying Planner'), 'brand must come from the constant').toBe(false);
      for (const v of Object.values(tr)) expect(v.includes('—'), 'no em dashes').toBe(false);
      // In ICU messages an apostrophe directly before a brace escapes it, which would print the placeholder literally.
      for (const [k, v] of Object.entries(tr)) expect(/['’]\{/.test(v), `${ns}.${k}: apostrophe before placeholder`).toBe(false);
    });
  }
});
