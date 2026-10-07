'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_SETTINGS } from '@/lib/engine';
import { formatCurrency } from '@/lib/format';
import { emptyCampaign, emptyMetaRow, settingsToForm } from '@/lib/planner/convert';
import { CAMPAIGN_FIELDS, FIELDS, META_ROW_FIELDS, SETTING_FIELDS, is, isVisible, type FieldDef } from '@/lib/planner/fields';
import { monthNames, profileOfNiche } from '@/lib/planner/options';
import type { FormValues, TabId } from '@/lib/planner/types';
import { BenchmarkPanel } from './BenchmarkPanel';
import { usePlanner } from './context';
import { CsvImport } from './CsvImport';
import { Field } from './Field';
import { NumberInput } from './inputs';
import { RowsEditor } from './RowsEditor';

const grid = 'grid gap-5 sm:grid-cols-2';

function Section({ title, children, collapsible }: { title: string; children: ReactNode; collapsible?: boolean }) {
  if (collapsible)
    return (
      <details className="group rounded-xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold focus-glow">
          {title}
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="px-4 pb-4">{children}</div>
      </details>
    );
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function groupFields(defs: FieldDef[]) {
  const ungrouped = defs.filter((d) => !d.group);
  const groups = new Map<string, FieldDef[]>();
  for (const d of defs) if (d.group) groups.set(d.group, [...(groups.get(d.group) ?? []), d]);
  return { ungrouped, groups };
}

/** Implied cost per result from Meta's "Estimated daily results", as a cross-check. */
function CrossCheck() {
  const t = useTranslations('planner');
  const locale = useLocale();
  const { currency } = usePlanner();
  const [min, max, budget] = useWatch<FormValues, ['eDailyMin', 'eDailyMax', 'eDailyBudget']>({ name: ['eDailyMin', 'eDailyMax', 'eDailyBudget'] });
  if (!min || !max || !budget) return null;
  return (
    <p className="text-sm text-fg-muted">
      {t('crossCheck.implied', { low: formatCurrency(budget / max, locale, currency, 2), high: formatCurrency(budget / min, locale, currency, 2) })}
    </p>
  );
}

/** Seasonal CPM multipliers for the selected niche's profile (editable estimates). */
function SeasonalGrid() {
  const t = useTranslations('planner');
  const locale = useLocale();
  const { control } = useFormContext<FormValues>();
  const { mode } = usePlanner();
  const niche = useWatch({ control, name: 'niche' });
  const profile = profileOfNiche(niche) ?? (is.ecom(mode) ? 'ecommerce' : 'leads');
  const months = monthNames(locale);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-fg-muted">{t('seasonal.intro', { profile: t(`nicheGroups.${profile}`) })}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {months.map((name, i) => (
          <Controller
            key={name}
            control={control}
            name={`settings.seasonalMultipliers.${profile}.${i}` as never}
            render={({ field }) => (
              <label className="flex flex-col gap-1 text-xs font-medium">
                {name}
                <NumberInput kind="number" step={0.05} min={0.1} max={5} value={field.value as number} onChange={field.onChange} />
              </label>
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Renders one tab from the field config, plus the few special blocks (rows, CSV, benchmarks, seasonal). */
export function TabPanel({ tab }: { tab: TabId }) {
  const t = useTranslations('planner');
  const toast = useToast();
  const { setValue, getValues } = useFormContext<FormValues>();
  const { mode } = usePlanner();
  const defs = [...FIELDS, ...SETTING_FIELDS].filter((d) => d.tab === tab && isVisible(d, mode));
  const { ungrouped, groups } = groupFields(defs);
  const advanced = tab === 'advanced';

  const resetDefaults = () => {
    setValue('settings', settingsToForm(DEFAULT_SETTINGS), { shouldDirty: true });
    toast(t('actions.resetDone'), 'success');
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-fg-muted">{t(`tabIntro.${tab}`)}</p>

      {tab === 'estimates' && <BenchmarkPanel />}

      {ungrouped.length > 0 && (
        <div className={grid}>
          {ungrouped.map((d) => (
            <Field key={d.id} def={d} />
          ))}
        </div>
      )}

      {tab === 'account' && is.meta(mode) && (
        <>
          <CsvImport />
          <Section title={t('groups.campaigns')}>
            <RowsEditor name="metaCampaigns" defs={CAMPAIGN_FIELDS} makeRow={emptyCampaign} />
          </Section>
          <Section title={t('groups.metaRows')}>
            <RowsEditor name="metaRows" defs={META_ROW_FIELDS} makeRow={() => emptyMetaRow(getValues('regions')[getValues('metaRows').length] ?? '')} />
          </Section>
        </>
      )}
      {tab === 'account' && !is.meta(mode) && <CsvImport />}

      {Array.from(groups.entries()).map(([group, items]) => (
        <Section key={group} title={t(`groups.${group}`)} collapsible={advanced}>
          <div className={grid}>
            {items.map((d) => (
              <Field key={d.id} def={d} />
            ))}
          </div>
          {group === 'metaCrossCheck' && <CrossCheck />}
        </Section>
      ))}

      {advanced && (
        <>
          <Section title={t('groups.seasonal')} collapsible>
            <SeasonalGrid />
          </Section>
          <p className="text-xs text-fg-subtle">{t('advanced.benchmarksNote')}</p>
          <Button variant="secondary" size="sm" className="self-start" onClick={resetDefaults}>
            {t('actions.resetDefaults')}
          </Button>
        </>
      )}
    </div>
  );
}
