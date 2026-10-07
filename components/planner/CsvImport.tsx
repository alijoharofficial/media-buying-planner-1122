'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { emptyMetaRow } from '@/lib/planner/convert';
import { COLUMN_ALIASES, aggregateGoogle, aggregateMeta, autoMap, parseCsv, type CsvTable, type CsvTarget } from '@/lib/planner/csv';
import type { FormValues, MetaRowForm } from '@/lib/planner/types';
import { usePlanner } from './context';
import { inputClass } from './inputs';

/** Upload a Meta Ads Manager or Google Ads export, confirm the auto-mapped columns, then fill the fields. */
export function CsvImport() {
  const t = useTranslations('planner');
  const toast = useToast();
  const { setValue } = useFormContext<FormValues>();
  const { mode } = usePlanner();
  const fileId = useId();
  const [table, setTable] = useState<CsvTable | null>(null);
  const [target, setTarget] = useState<CsvTarget>('meta');
  const [map, setMap] = useState<Record<string, number>>({});
  const targets: CsvTarget[] = (['meta', 'google'] as CsvTarget[]).filter((p) => mode.platforms.includes(p));

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.headers.length || !parsed.rows.length) throw new Error('empty');
      // Detect the export type from its columns.
      const scores = targets.map((tg) => ({ tg, score: Object.values(autoMap(parsed.headers, tg)).filter((i) => i >= 0).length }));
      const best = scores.sort((a, b) => b.score - a.score)[0]?.tg ?? 'meta';
      setTable(parsed);
      setTarget(best);
      setMap(autoMap(parsed.headers, best));
    } catch {
      toast(t('csv.error'), 'danger');
    }
  };

  const confirm = () => {
    if (!table) return;
    if (target === 'meta') {
      const rows = aggregateMeta(table, map).map((r) => ({ ...emptyMetaRow(), ...r }) as MetaRowForm);
      setValue('metaRows', rows, { shouldDirty: true });
      toast(t('csv.imported', { rows: rows.length }), 'success');
    } else {
      const totals = aggregateGoogle(table, map);
      for (const [k, v] of Object.entries(totals)) setValue(k as keyof FormValues, v as never, { shouldDirty: true });
      toast(t('csv.imported', { rows: 1 }), 'success');
    }
    setTable(null);
  };

  return (
    <div className="rounded-xl border border-dashed border-border-strong p-4">
      <h4 className="text-sm font-semibold">{t('csv.title')}</h4>
      <p className="mt-1 text-xs text-fg-muted">{t('csv.intro')}</p>
      <label htmlFor={fileId} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-within:shadow-[0_0_0_4px_var(--color-ring)]">
        {t('csv.choose')}
        <input id={fileId} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>

      {table && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{t('csv.mappingTitle')}</span>
            <select
              aria-label={t('csv.targetLabel')}
              value={target}
              onChange={(e) => {
                const tg = e.target.value as CsvTarget;
                setTarget(tg);
                setMap(autoMap(table.headers, tg));
              }}
              className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
            >
              {targets.map((tg) => (
                <option key={tg} value={tg}>
                  {t(`csv.target.${tg}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.keys(COLUMN_ALIASES[target]).map((field) => (
              <label key={field} className="flex flex-col gap-1 text-xs font-medium">
                {t(`csv.fields.${field}`)}
                <select value={map[field] ?? -1} onChange={(e) => setMap({ ...map, [field]: Number(e.target.value) })} className={`${inputClass} border-border h-9`}>
                  <option value={-1}>{t('csv.notMapped')}</option>
                  {table.headers.map((h, i) => (
                    <option key={`${h}-${i}`} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={confirm}>
              {t('csv.confirm')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTable(null)}>
              {t('actions.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
