'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { FormValues } from '@/lib/planner/types';

export const STEP0_QUESTIONS = [
  { id: 'businessType', options: ['leads', 'ecommerce'] },
  { id: 'accountStatus', options: ['new', 'existing'] },
  { id: 'platforms', options: ['meta', 'google'], multi: true, comingSoon: ['shopping', 'youtube', 'tiktok'] },
  { id: 'goalType', options: ['target', 'budget'] },
] as const;

type Props = { step: number; onStep: (n: number) => void; onDone: () => void; /** Editing a single answer from the chip bar. */ single?: boolean };

/** Step 0: one primary question per screen with large selectable cards. */
export function Step0({ step, onStep, onDone, single }: Props) {
  const t = useTranslations('planner.step0');
  const { setValue, control } = useFormContext<FormValues>();
  const values = useWatch({ control, name: ['businessType', 'accountStatus', 'platforms', 'goalType'] });
  const q = STEP0_QUESTIONS[step] ?? STEP0_QUESTIONS[0];
  const current = values[step] as string | string[];
  const total = STEP0_QUESTIONS.length;
  const canNext = Array.isArray(current) ? current.length > 0 : Boolean(current);
  const last = step === total - 1;

  const pick = (opt: string) => {
    if ('multi' in q && q.multi) {
      const list = current as string[];
      const next = list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt];
      setValue('platforms', next as FormValues['platforms'], { shouldDirty: true });
    } else {
      setValue(q.id as 'businessType', opt as never, { shouldDirty: true });
    }
  };

  return (
    <section aria-labelledby="step0-title" className="mx-auto max-w-3xl overflow-x-clip px-1">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium text-fg-muted">
          <span>{t('progress', { current: step + 1, total })}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label={t('progress', { current: step + 1, total })}>
          <m.div className="h-full rounded-full bg-accent" animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* initial={false}: the first question renders visible on the server; later ones slide in. */}
      <AnimatePresence mode="wait" initial={false}>
        <m.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          <h2 id="step0-title" className="text-2xl font-bold tracking-tight md:text-3xl">
            {t(`questions.${q.id}.title`)}
          </h2>
          <p className="mt-2 text-fg-muted">{t(`questions.${q.id}.hint`)}</p>

          <div role={'multi' in q && q.multi ? 'group' : 'radiogroup'} aria-labelledby="step0-title" className="mt-6 grid gap-4 sm:grid-cols-2">
            {q.options.map((opt) => {
              const selected = Array.isArray(current) ? current.includes(opt) : current === opt;
              const multi = 'multi' in q && q.multi;
              return (
                <button
                  key={opt}
                  type="button"
                  role={multi ? 'checkbox' : 'radio'}
                  aria-checked={selected}
                  onClick={() => pick(opt)}
                  className={cn(
                    'group flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-start transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-glow',
                    selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-lg font-semibold">{t(`options.${opt}.label`)}</span>
                    <span aria-hidden="true" className={cn('flex size-6 items-center justify-center rounded-full border-2 text-xs', selected ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong')}>
                      {selected ? '✓' : ''}
                    </span>
                  </span>
                  <span className="text-sm text-fg-muted">{t(`options.${opt}.desc`)}</span>
                </button>
              );
            })}
            {'comingSoon' in q &&
              q.comingSoon.map((opt) => (
                <div key={opt} aria-disabled="true" className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-border p-5 opacity-60">
                  <span className="font-semibold">{t(`options.${opt}.label`)}</span>
                  <Badge>{t('comingSoon')}</Badge>
                </div>
              ))}
          </div>
        </m.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        {single ? (
          <span />
        ) : (
          <Button variant="ghost" onClick={() => onStep(step - 1)} disabled={step === 0}>
            <span className="rtl-mirror" aria-hidden="true">←</span> {t('back')}
          </Button>
        )}
        <Button onClick={() => (single || last ? onDone() : onStep(step + 1))} disabled={!canNext} shimmer={last && !single}>
          {single ? t('done') : last ? t('start') : t('next')} {!single && !last && <span className="rtl-mirror" aria-hidden="true">→</span>}
        </Button>
      </div>
    </section>
  );
}
