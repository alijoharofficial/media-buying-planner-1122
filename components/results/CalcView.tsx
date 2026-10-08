'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { StepRecord, StepValue, ValueTag } from '@/lib/engine';
import { cn } from '@/lib/cn';
import { fadeUp } from '@/lib/motion';
import { useFormat } from './useFormat';

const tagStyle: Record<ValueTag, string> = {
  input: 'bg-info-soft text-info',
  assumption: 'bg-warning-soft text-warning',
  setting: 'bg-surface-muted text-fg-muted',
};

/** "Show the calculation": a vertical timeline that maps over the engine's step records. */
export function CalcView({ steps, currency }: { steps: StepRecord[]; currency: string }) {
  const t = useTranslations('results.calc');
  const tv = useTranslations('results.values');
  const ts = useTranslations('results.steps');
  const tsrc = useTranslations('planner.sources');
  const tr = useTranslations('planner.options.rateSource');
  const f = useFormat(currency);
  const [open, setOpen] = useState<Set<number>>(() => new Set(steps.flatMap((s, i) => (s.long ? [] : [i]))));
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);
  const allOpen = steps.every((_, i) => open.has(i));

  // Mini progress rail: highlight the step in view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  const sourceText = (v: StepValue) => (v.source ? (['crm', 'estimate', 'default'].includes(v.source) ? tr(v.source) : tsrc(v.source)) : undefined);

  /** Render a formula template, replacing {key} with either readable names or tagged values. */
  const formula = (s: StepRecord, filled: boolean) => {
    const template = ts.raw(`${s.id}.formula`) as string;
    return template.split(/(\{\w+\})/).map((part, i) => {
      const hit = part.match(/^\{(\w+)\}$/);
      if (!hit) return <Fragment key={i}>{part}</Fragment>;
      const v = s.inputs.find((x) => x.key === hit[1]);
      if (!filled || !v) return <span key={i} className="font-medium">{tv(hit[1] ?? '')}</span>;
      const src = sourceText(v);
      return (
        <span key={i} className={cn('mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 font-semibold tabular-nums', tagStyle[v.tag])} title={`${tv(v.key)} · ${t(`tags.${v.tag}`)}${src ? ` · ${src}` : ''}`}>
          {f.unit(v.value, v.unit)}
        </span>
      );
    });
  };

  return (
    <section aria-labelledby="calc-title" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="calc-title" className="text-lg font-semibold">
            {t('title')}
          </h3>
          <p className="text-sm text-fg-muted">{t('intro')}</p>
        </div>
        <Button size="sm" variant="secondary" className="no-print" onClick={() => setOpen(allOpen ? new Set() : new Set(steps.map((_, i) => i)))} aria-expanded={allOpen}>
          {allOpen ? t('collapseAll') : t('expandAll')}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {(['input', 'assumption', 'setting'] as ValueTag[]).map((tag) => (
          <span key={tag} className={cn('rounded px-2 py-0.5 font-medium', tagStyle[tag])}>
            {t(`tags.${tag}`)}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-4">
        <nav aria-label={t('rail')} className="no-print sticky top-24 hidden h-fit flex-col items-center gap-1.5 sm:flex">
          {steps.map((s, i) => (
            <button
              key={s.id + i}
              type="button"
              aria-label={t('step', { n: i + 1, title: ts(`${s.id}.title`) })}
              aria-current={active === i ? 'step' : undefined}
              onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={cn('size-2.5 rounded-full transition-all', i <= active ? 'bg-accent' : 'bg-border-strong', active === i && 'scale-150')}
            />
          ))}
        </nav>

        <ol className="relative flex flex-col gap-4 border-s-2 border-border ps-6 sm:col-start-2">
          {steps.map((s, i) => {
            const isOpen = open.has(i);
            const toggle = () => setOpen((o) => {
              const n = new Set(o);
              if (n.has(i)) n.delete(i);
              else n.add(i);
              return n;
            });
            return (
              <m.li
                key={s.id + i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="relative"
              >
                <span aria-hidden="true" className="absolute -start-[33px] top-4 flex size-4 items-center justify-center rounded-full border-2 border-accent bg-surface" />
                <article className="rounded-xl border border-border bg-surface p-4 shadow-soft">
                  <button type="button" onClick={toggle} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-3 text-start focus-glow">
                    <span>
                      <span className="block text-sm font-semibold">{t('step', { n: i + 1, title: ts(`${s.id}.title`) })}</span>
                      <span className="mt-1 block text-sm text-fg-muted">{ts(`${s.id}.desc`)}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold tabular-nums text-accent">{f.unit(s.result.value, s.result.unit)}</span>
                  </button>
                  {isOpen && (
                    <dl className="mt-3 grid gap-2 border-t border-border pt-3 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-fg-subtle">{t('formula')}</dt>
                        <dd className="mt-0.5">{formula(s, false)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-fg-subtle">{t('withNumbers')}</dt>
                        <dd className="mt-0.5 leading-loose">
                          {formula(s, true)} <span aria-hidden="true">=</span>{' '}
                          <span className="rounded bg-accent px-1.5 py-0.5 font-bold text-accent-fg tabular-nums">{f.unit(s.result.value, s.result.unit)}</span>
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.inputs.map((v) => (
                          <span key={v.key} className={cn('rounded px-2 py-0.5 text-xs', tagStyle[v.tag])}>
                            {tv(v.key)}: {t(`tags.${v.tag}`)}
                            {sourceText(v) ? ` · ${sourceText(v)}` : ''}
                          </span>
                        ))}
                      </div>
                    </dl>
                  )}
                </article>
              </m.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
