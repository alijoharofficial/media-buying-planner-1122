'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildPlan, type Verdict } from '@/lib/engine';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { toPlanInput } from '@/lib/planner/convert';
import { deleteScenario, type Scenario } from '@/lib/planner/storage';
import { validate } from '@/lib/planner/validation';
import type { FormValues } from '@/lib/planner/types';

const MAX_COMPARE = 3;
const verdictTone: Record<Verdict, 'success' | 'warning' | 'danger'> = { profitable: 'success', optimize: 'warning', notViable: 'danger' };

type Props = { scenarios: Scenario[]; onChange: (s: Scenario[]) => void; onLoad: (v: FormValues) => void };

/** Saved scenarios: load, delete, and compare up to 3 side by side. */
export function ScenarioPanel({ scenarios, onChange, onLoad }: Props) {
  const t = useTranslations('planner');
  const locale = useLocale();
  const [picked, setPicked] = useState<string[]>([]);

  const compared = useMemo(
    () =>
      scenarios
        .filter((s) => picked.includes(s.id))
        .map((s) => ({ s, plan: validate(s.values).errors.length ? undefined : buildPlan(toPlanInput(s.values)) })),
    [scenarios, picked],
  );

  if (!scenarios.length) return <p className="text-sm text-fg-muted">{t('actions.noScenarios')}</p>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-fg-muted">{t('actions.compareHint', { max: MAX_COMPARE })}</p>
      <ul className="divide-y divide-border">
        {scenarios.map((s) => {
          const checked = picked.includes(s.id);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-2">
              <label className="flex flex-1 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--color-accent)]"
                  checked={checked}
                  disabled={!checked && picked.length >= MAX_COMPARE}
                  onChange={() => setPicked(checked ? picked.filter((x) => x !== s.id) : [...picked, s.id])}
                />
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-fg-subtle">{formatDate(new Date(s.savedAt), locale)}</span>
              </label>
              <Button size="sm" variant="ghost" onClick={() => onLoad(s.values)}>
                {t('actions.load')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPicked(picked.filter((x) => x !== s.id));
                  onChange(deleteScenario(s.id));
                }}
              >
                {t('actions.delete')}
              </Button>
            </li>
          );
        })}
      </ul>

      {compared.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {compared.map(({ s, plan }) => (
            <Card key={s.id} className="p-4">
              <h4 className="font-semibold">{s.name}</h4>
              {plan ? (
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-fg-muted">{t('compare.budget')}</dt>
                  <dd className="text-end font-semibold tabular-nums">{formatCurrency(plan.budget.monthly, locale, s.values.currency)}</dd>
                  <dt className="text-fg-muted">{t('compare.results')}</dt>
                  <dd className="text-end tabular-nums">{formatNumber(plan.budget.results, locale)}</dd>
                  <dt className="text-fg-muted">{t(`compare.cpa_${plan.input.businessType}`)}</dt>
                  <dd className="text-end tabular-nums">{formatCurrency(plan.budget.cpa, locale, s.values.currency, 2)}</dd>
                  <dt className="text-fg-muted">{t('compare.verdict')}</dt>
                  <dd className="text-end">
                    <Badge tone={verdictTone[plan.verdict]}>{t(`compare.verdicts.${plan.verdict}`)}</Badge>
                  </dd>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-warning">{t('compare.incomplete')}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
