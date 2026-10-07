'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Platform } from '@/lib/engine';
import { defaultBenchmark } from '@/lib/planner/convert';
import { displayName, monthNames, profileOfNiche } from '@/lib/planner/options';
import { addBenchmark, averageBenchmarks, deleteBenchmark, loadBenchmarks, type BenchmarkRow } from '@/lib/planner/storage';
import type { FormValues } from '@/lib/planner/types';
import { usePlanner } from './context';
import { NumberInput } from './inputs';

const round = (x: number) => Math.round(x * 100) / 100;

/** "My benchmarks" library (localStorage) plus the "Use my benchmarks" fill action. */
export function BenchmarkPanel() {
  const t = useTranslations('planner');
  const locale = useLocale();
  const toast = useToast();
  const { setValue, control } = useFormContext<FormValues>();
  const { mode, currency } = usePlanner();
  const [niche, regions, month] = useWatch({ control, name: ['niche', 'regions', 'month'] });
  // The planner renders client-side only (after the draft loads), so localStorage is safe here.
  const [rows, setRows] = useState<BenchmarkRow[]>(loadBenchmarks);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ platform: Platform; cpm?: number; ctr?: number; cvr?: number; cost?: number }>({ platform: 'meta' });

  const fillFrom = (platform: Platform, vals: { cpm?: number; ctr?: number; cvr?: number; cpc?: number }, source: 'accounts' | 'benchmark') => {
    const set = (id: keyof FormValues, v: number | undefined) => {
      if (v === undefined) return;
      setValue(id, round(v) as never, { shouldDirty: true });
      setValue(`sources.${id}` as never, source as never);
    };
    if (platform === 'meta') {
      set('eCpm', vals.cpm);
      set('eCtr', vals.ctr);
      set(mode.businessType === 'leads' && mode.leadSource === 'form' ? 'eFormRate' : 'eCvr', vals.cvr);
    } else {
      set('gCtrNew', vals.ctr);
      set('gCvrNew', vals.cvr);
      if (vals.cpc !== undefined) {
        set('gBidLow', vals.cpc * 0.7);
        set('gBidHigh', vals.cpc * 1.3);
      }
    }
  };

  const useMine = () => {
    let usedMine = 0;
    let usedDefault = false;
    for (const platform of mode.platforms) {
      const avg = averageBenchmarks(rows, niche, regions, platform);
      if (avg) {
        usedMine += avg.count;
        fillFrom(platform, avg, 'accounts');
      } else {
        const def = defaultBenchmark(profileOfNiche(niche) ?? (mode.businessType === 'ecommerce' ? 'ecommerce' : 'leads'), platform);
        if (def) {
          usedDefault = true;
          fillFrom(platform, { cpm: def.cpm, cpc: def.cpc, ctr: def.ctr * 100, cvr: def.cvr * 100 }, 'benchmark');
        }
      }
    }
    toast(usedMine ? t('benchmarks.used', { count: usedMine }) : usedDefault ? t('benchmarks.usedDefaults') : t('benchmarks.none'), usedMine ? 'success' : 'info');
  };

  const save = () => {
    if (!niche) {
      toast(t('errors.nicheFirst'), 'warning');
      return;
    }
    setRows(addBenchmark({ niche, region: regions[0] ?? '', month, ...draft }));
    setDraft({ platform: draft.platform });
    toast(t('benchmarks.saved'), 'success');
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">{t('benchmarks.title')}</h4>
          <p className="text-xs text-fg-muted">{t('benchmarks.intro')}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={useMine}>
            {t('benchmarks.use')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {t('benchmarks.manage', { count: rows.length })}
          </Button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <label className="flex flex-col gap-1 text-xs font-medium">
              {t('benchmarks.platform')}
              <select value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value as Platform })} className="h-11 rounded-lg border border-border-strong bg-surface px-2 text-sm">
                <option value="meta">{t('step0.options.meta.label')}</option>
                <option value="google">{t('step0.options.google.label')}</option>
              </select>
            </label>
            {(['cpm', 'ctr', 'cvr', 'cost'] as const).map((k) => (
              <label key={k} className="flex flex-col gap-1 text-xs font-medium">
                {t(`benchmarks.${k}`)}
                <NumberInput kind={k === 'ctr' || k === 'cvr' ? 'percent' : 'currency'} currency={currency} value={draft[k]} onChange={(v) => setDraft({ ...draft, [k]: v })} />
              </label>
            ))}
            <div className="flex items-end">
              <Button size="sm" className="w-full" onClick={save}>
                {t('benchmarks.add')}
              </Button>
            </div>
          </div>
          <p className="text-xs text-fg-subtle">{t('benchmarks.context', { region: regions[0] ? displayName(locale, 'region', regions[0]) : '-', month: monthNames(locale)[month] ?? '' })}</p>
          {rows.length === 0 ? (
            <p className="text-sm text-fg-muted">{t('benchmarks.empty')}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {t(`niches.${r.niche}`)} · {r.region ? displayName(locale, 'region', r.region) : '-'} · {t(`step0.options.${r.platform}.label`)} · {monthNames(locale)[r.month]}
                    <span className="text-fg-muted">
                      {' '}
                      {[r.cpm !== undefined && `CPM ${r.cpm}`, r.ctr !== undefined && `CTR ${r.ctr}%`, r.cvr !== undefined && `CVR ${r.cvr}%`, r.cost !== undefined && `CPA ${r.cost}`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setRows(deleteBenchmark(r.id))}>
                    {t('actions.delete')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
