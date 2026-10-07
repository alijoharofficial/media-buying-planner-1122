'use client';

import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FormValues } from '@/lib/planner/types';
import { STEP0_QUESTIONS } from './Step0';

/** Summary of Step 0 answers; each chip reopens its question. */
export function SummaryChips({ onEdit }: { onEdit: (step: number) => void }) {
  const t = useTranslations('planner');
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control, name: ['businessType', 'accountStatus', 'platforms', 'goalType'] });

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('chips.label')}>
      <span className="text-sm text-fg-muted">{t('chips.label')}:</span>
      {STEP0_QUESTIONS.map((q, i) => {
        const v = values[i];
        const text = (Array.isArray(v) ? v : [v]).map((x) => t(`step0.options.${x}.label`)).join(' + ');
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onEdit(i)}
            aria-label={t('chips.edit', { item: t(`step0.questions.${q.id}.short`), value: text })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-glow"
          >
            {text}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
