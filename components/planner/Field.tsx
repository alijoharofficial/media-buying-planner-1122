'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { ESTIMATE_SOURCES, isRequired, type FieldDef, type RowFieldDef } from '@/lib/planner/fields';
import { COUNTRIES, CURRENCIES, NICHE_GROUPS, displayName, monthNames } from '@/lib/planner/options';
import type { FormValues } from '@/lib/planner/types';
import { usePlanner } from './context';
import { Combobox, NumberInput, TagInput, Toggle, borderFor, inputClass } from './inputs';

type FieldProps = { def: FieldDef | RowFieldDef; /** Form path; defaults to def.id. */ path?: string; compact?: boolean };

/** The one generic field: label, "i" tooltip, required marker, input by kind, source label, inline error or warning. */
export function Field({ def, path = def.id, compact }: FieldProps) {
  const t = useTranslations('planner');
  const locale = useLocale();
  const { control } = useFormContext<FormValues>();
  const { mode, currency, errors, warnings, showIssue, markTouched } = usePlanner();
  const id = `f-${path.replace(/\./g, '-')}`;
  const key = def.labelKey ?? def.id.split('.').pop() ?? def.id;
  const variant = 'labelVariant' in def && def.labelVariant ? `label_${def.labelVariant(mode)}` : 'label';
  const params = def.labelParams?.source ? { source: t(`sources.${def.labelParams.source}`) } : undefined;
  const required = isRequired(def, mode);
  const error = showIssue(path) ? errors.get(path) : undefined;
  const warning = !error && showIssue(path) ? warnings.get(path) : undefined;
  const msgId = `${id}-msg`;
  const describedBy = error || warning ? msgId : undefined;

  const options = useMemo(() => {
    if (def.kind === 'niche')
      return NICHE_GROUPS.flatMap((g) => g.niches.map((n) => ({ value: n, label: t(`niches.${n}`), group: t(`nicheGroups.${g.profile}`) })));
    if (def.kind === 'regions') return COUNTRIES.map((c) => ({ value: c, label: displayName(locale, 'region', c) })).sort((a, b) => a.label.localeCompare(b.label, locale));
    return [];
  }, [def.kind, locale, t]);

  const issueText = (issue: { code: string; params?: Record<string, number | string> }, ns: 'errors' | 'warnings') => t(`${ns}.${issue.code}`, issue.params ?? {});

  return (
    <div className={cn('flex flex-col gap-1.5', compact && 'min-w-0')}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {t(`fields.${key}.${variant}`, params ?? {})}
        </label>
        <Tooltip content={t(`fields.${key}.tooltip`)} label={t('ui.moreInfoAbout', { field: t(`fields.${key}.${variant}`, params ?? {}) })} />
        <span className={cn('ms-auto text-xs', required ? 'text-accent' : 'text-fg-subtle')}>{required ? t('ui.required') : t('ui.optional')}</span>
      </div>

      <Controller
        control={control}
        name={path as never}
        render={({ field }) => {
          const onBlur = () => {
            field.onBlur();
            markTouched(path);
          };
          const a11y = { id, invalid: Boolean(error), describedBy, required };
          const native = { id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined };
          switch (def.kind) {
            case 'currency':
            case 'percent':
            case 'number':
            case 'integer':
              return (
                <NumberInput
                  {...a11y}
                  kind={def.kind}
                  currency={currency}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  placeholder={def.example}
                  value={field.value as number | undefined}
                  onChange={field.onChange}
                  onBlur={onBlur}
                />
              );
            case 'select':
              return (
                <select {...native} value={field.value as string} onChange={field.onChange} onBlur={onBlur} className={cn(inputClass, borderFor(a11y.invalid))}>
                  {def.options?.map((o) => (
                    <option key={o} value={o}>
                      {t(`options.${key}.${o}`)}
                    </option>
                  ))}
                </select>
              );
            case 'month':
              return (
                <select {...native} value={field.value as number} onChange={(e) => field.onChange(Number(e.target.value))} onBlur={onBlur} className={cn(inputClass, borderFor(a11y.invalid))}>
                  {monthNames(locale).map((name, i) => (
                    <option key={name} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
              );
            case 'currencyCode':
              return (
                <select {...native} value={field.value as string} onChange={field.onChange} onBlur={onBlur} className={cn(inputClass, borderFor(a11y.invalid))}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} · {displayName(locale, 'currency', c)}
                    </option>
                  ))}
                </select>
              );
            case 'niche':
            case 'regions':
              return (
                <Combobox
                  {...a11y}
                  options={options}
                  multiple={def.kind === 'regions'}
                  value={field.value as string | string[]}
                  onChange={field.onChange}
                  onBlur={onBlur}
                  placeholder={t(`fields.${key}.placeholder`)}
                />
              );
            case 'toggle':
              return <Toggle id={id} describedBy={describedBy} checked={Boolean(field.value)} onChange={field.onChange} />;
            case 'tags':
              return <TagInput id={id} describedBy={describedBy} value={(field.value as string[]) ?? []} onChange={field.onChange} />;
            default:
              return (
                <input
                  {...native}
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  onBlur={onBlur}
                  className={cn(inputClass, borderFor(a11y.invalid))}
                />
              );
          }
        }}
      />

      {'source' in def && def.source && (
        <Controller
          control={control}
          name={`sources.${def.id}` as never}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-xs text-fg-muted">
              {t('ui.sourceLabel')}
              <select value={(field.value as string) ?? 'guess'} onChange={field.onChange} className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-fg focus-glow">
                {ESTIMATE_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {t(`sources.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        />
      )}

      {(error || warning) && (
        <p id={msgId} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'text-danger' : 'text-warning')}>
          {error ? issueText(error, 'errors') : warning ? issueText(warning, 'warnings') : null}
        </p>
      )}
    </div>
  );
}
