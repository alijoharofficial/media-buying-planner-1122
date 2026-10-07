'use client';

import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import type { RowFieldDef } from '@/lib/planner/fields';
import type { FormValues } from '@/lib/planner/types';
import { usePlanner } from './context';
import { Field } from './Field';

type Props = {
  name: 'metaRows' | 'metaCampaigns';
  defs: RowFieldDef[];
  makeRow: () => FormValues['metaRows'][number] | FormValues['metaCampaigns'][number];
};

/** Add/remove repeating rows, each rendered from the row field config. */
export function RowsEditor({ name, defs, makeRow }: Props) {
  const t = useTranslations('planner');
  const { control } = useFormContext<FormValues>();
  const { mode, errors, showIssue } = usePlanner();
  const { fields, append, remove } = useFieldArray({ control, name: name as never });
  const rows = useWatch({ control, name }) as Array<Record<string, unknown>>;
  const rowLabel = name === 'metaRows' ? 'rowN' : 'campaignN';
  const listError = showIssue(name) ? errors.get(name) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {fields.map((f, i) => {
        const row = rows?.[i] ?? {};
        return (
          <fieldset key={f.id} className="rounded-xl border border-border bg-surface-muted/40 p-4">
            <legend className="px-1 text-sm font-semibold text-fg">
              {t(`ui.${rowLabel}`, { n: i + 1 })}
              {typeof row.country === 'string' && row.country ? ` · ${row.country}` : ''}
              {typeof row.name === 'string' && row.name ? ` · ${row.name}` : ''}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {defs
                .filter((d) => !d.show || d.show(mode, row))
                .map((d) => (
                  <Field key={d.id} def={d} path={`${name}.${i}.${d.id}`} compact />
                ))}
            </div>
            {fields.length > 1 && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => remove(i)}>
                {t('ui.removeItem', { item: t(`ui.${rowLabel}`, { n: i + 1 }) })}
              </Button>
            )}
          </fieldset>
        );
      })}
      {listError && <p role="alert" className="text-xs text-danger">{t(`errors.${listError.code}`)}</p>}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append(makeRow() as never)}>
        + {t(name === 'metaRows' ? 'ui.addCountry' : 'ui.addCampaign')}
      </Button>
    </div>
  );
}
