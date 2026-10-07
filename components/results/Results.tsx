'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { SupportBanner } from '@/components/SupportBanner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getDirection, type Locale } from '@/i18n/routing';
import type { HealthFlag, PlanResult, Verdict, Warning } from '@/lib/engine';
import { BRAND_NAME } from '@/lib/brand';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { fadeUp, revealOnScroll } from '@/lib/motion';
import { CalcView } from './CalcView';
import { CountUp } from './CountUp';
import { Funnel } from './Funnel';
import { MetricCard } from './MetricCard';
import { useFormat } from './useFormat';

const Charts = {
  SplitDonut: dynamic(() => import('./Charts').then((m) => m.SplitDonut), { ssr: false, loading: () => <div className="h-56" /> }),
  ScalingChart: dynamic(() => import('./Charts').then((m) => m.ScalingChart), { ssr: false, loading: () => <div className="h-64" /> }),
};
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)'];

const verdictTone: Record<Verdict, 'success' | 'warning' | 'danger'> = { profitable: 'success', optimize: 'warning', notViable: 'danger' };
const verdictBorder: Record<Verdict, string> = { profitable: 'border-success', optimize: 'border-warning', notViable: 'border-danger' };
const flagTone: Record<HealthFlag, 'success' | 'warning' | 'danger' | 'neutral'> = { green: 'success', amber: 'warning', red: 'danger', neutral: 'neutral' };
const severityTone = { info: 'info', warning: 'warning', danger: 'danger' } as const;

function Block({ title, intro, children, className }: { title: string; intro?: string; children: ReactNode; className?: string }) {
  return (
    <motion.section variants={fadeUp} {...revealOnScroll} className={cn('flex flex-col gap-4', className)}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {intro && <p className="text-sm text-fg-muted">{intro}</p>}
      </div>
      {children}
    </motion.section>
  );
}

type Props = { plan: PlanResult; currency: string; onShare: () => void; onSave: () => void; onRecalculate: () => void };

/** "Your Media Buying Plan": every block renders from the engine's output object. */
export function Results({ plan, currency, onShare, onSave, onRecalculate }: Props) {
  const t = useTranslations('results');
  const tp = useTranslations('planner');
  const locale = useLocale() as Locale;
  const f = useFormat(currency);
  const [showCalc, setShowCalc] = useState(false);
  const { budget, newAccount: na, input } = plan;
  const leads = input.businessType === 'leads';
  const kind = input.businessType;
  const fixed = input.goalType === 'budget';
  const rtl = getDirection(locale) === 'rtl';

  const exportPdf = () => {
    const prev = document.title;
    document.title = `${t('actions.pdfTitle')} | ${BRAND_NAME}`;
    window.print();
    document.title = prev;
  };

  const warningParams = (w: Warning) =>
    Object.fromEntries(
      Object.entries(w.params ?? {}).map(([k, v]) => [
        k,
        k === 'platform' ? t(`split.platforms.${v}`) : k === 'ceiling' ? f.money(Number(v)) : typeof v === 'number' ? f.num(v, v % 1 ? 1 : 0) : v,
      ]),
    );

  const splitLines = plan.split.lines.filter((l) => l.amount > 0.5);
  const splitTotal = splitLines.reduce((s, l) => s + l.amount, 0);

  return (
    <div id="print-area" className="flex flex-col gap-10">
      <div className="print-only">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Logo size={28} />
          <span className="text-sm">{t('actions.generated', { date: formatDate(new Date(), locale) })}</span>
        </div>
        <p className="mt-2 text-xs">{t('actions.pdfNote')}</p>
        <div className="print-watermark" aria-hidden="true">
          {BRAND_NAME}
        </div>
      </div>

      {/* 1. Headline */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card glass className="p-6 md:p-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('title')}</h2>
          {na ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-fg-muted">{t('headline.affordTitle')}</p>
                <p className="mt-1 text-sm text-fg-muted">{leads ? t('headline.testBudgetLeads') : t('headline.testBudgetEcom')}</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">
                  <CountUp value={na.test.testBudget} format={(v) => f.money(v, 0)} />
                </p>
                <p className="mt-2 text-sm text-fg-muted">{t('headline.testDaily', { amount: f.money(na.test.testDaily), days: na.test.testBudget > 0 ? Math.round(na.test.testBudget / Math.max(na.test.testDaily, 1e-9)) : 0 })}</p>
                {na.test.optionB?.recommended && (
                  <div className="mt-3 rounded-lg bg-info-soft p-3 text-sm text-fg">
                    <strong>{t('headline.optionBTitle')}</strong> {t('headline.optionBDesc', { cost: f.money(na.test.optionB.maxCostPerATC) })}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-fg-muted">{t(fixed ? 'headline.scaleTitleFixed' : 'headline.scaleTitle')}</p>
                  <Badge tone="warning">{t('headline.estimateTag')}</Badge>
                </div>
                <p className="mt-2 text-3xl font-bold tabular-nums">{f.money(na.scaleEstimate.expected, 0)}</p>
                <p className="text-sm text-fg-muted">{t('headline.range', { low: f.money(na.scaleEstimate.low, 0), high: f.money(na.scaleEstimate.high, 0) })}</p>
                <p className="mt-2 text-sm">{t(`headline.scaleResults_${kind}`, { results: f.num(na.scaleEstimate.results, 0) })}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-fg-muted">{fixed ? t('headline.fixedBudget') : t('headline.monthly')}</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">
                  <CountUp value={budget.monthly} format={(v) => f.money(v, 0)} />
                </p>
                {!fixed && <p className="mt-2 text-sm text-fg-muted">{t('headline.range', { low: f.money(budget.low, 0), high: f.money(budget.high, 0) })}</p>}
              </div>
              <div>
                <p className="text-sm font-medium text-fg-muted">{t('headline.daily')}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{f.money(budget.daily, 0)}</p>
                <p className="mt-2 text-sm text-fg-muted">{t(`headline.results_${kind}`, { results: f.num(budget.results, 0) })}</p>
              </div>
            </div>
          )}
          {!budget.reachable && <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger">{t('headline.unreachable')}</p>}
          <Button variant="secondary" size="sm" className="no-print mt-6" onClick={() => setShowCalc((s) => !s)} aria-expanded={showCalc}>
            {showCalc ? t('headline.hideCalc') : t('headline.toggleCalc')}
          </Button>
          {showCalc && <CalcView steps={plan.steps} currency={currency} />}
        </Card>
      </motion.div>

      {/* 2. What it delivers */}
      <Block title={t('deliver.title')} intro={t(`deliver.intro_${kind}`)}>
        <Funnel stages={plan.funnel} currency={currency} />
      </Block>

      {/* 3. Costs + 4. Verdict */}
      <Block title={t('costs.title')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label={t(`costs.cost_${kind}`)} value={f.money(budget.cpa)} hint={t('costs.limit', { value: f.money(plan.costLimits.max) })} tone={budget.cpa <= plan.costLimits.max ? 'success' : 'danger'} tooltip={t(`costs.tip_${kind}`)} />
          {leads && budget.cac !== undefined && (
            <MetricCard
              label={t('costs.cac')}
              value={f.money(budget.cac)}
              hint={plan.limits.kind === 'leads' ? t('costs.limit', { value: f.money(plan.limits.maxCAC) }) : undefined}
              tone={plan.limits.kind === 'leads' && budget.cac <= plan.limits.maxCAC ? 'success' : 'danger'}
              tooltip={t('costs.tip_cac')}
            />
          )}
          <MetricCard
            label={t('costs.roas')}
            value={`${f.num(budget.roas, 2)}×`}
            hint={plan.limits.kind === 'ecommerce' ? t('costs.beRoas', { value: `${f.num(plan.limits.breakEvenROAS, 2)}×` }) : undefined}
            tooltip={t('costs.tip_roas')}
          />
          {plan.google && (
            <MetricCard label={t('costs.googleMax')} value={f.num(plan.google.maxResults, 0)} hint={t('costs.googleMaxHint', { spend: f.money(plan.google.maxSpend, 0) })} tooltip={t('costs.tip_google')} />
          )}
        </div>
        <div className={cn('flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between', verdictBorder[plan.verdict])}>
          <div>
            <p className="text-sm text-fg-muted">{t('verdict.title')}</p>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
              <Badge tone={verdictTone[plan.verdict]} className="mt-1 px-3 py-1 text-sm">
                {t(`verdict.${plan.verdict}`)}
              </Badge>
            </motion.div>
            <p className="mt-2 text-sm text-fg-muted">{t(`verdict.desc_${plan.verdict}`)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-fg-muted">{t(`verdict.max_${kind}`)}</dt>
            <dd className="text-end font-semibold tabular-nums">{f.money(plan.costLimits.max)}</dd>
            <dt className="text-fg-muted">{t(`verdict.target_${kind}`)}</dt>
            <dd className="text-end font-semibold tabular-nums">{f.money(plan.costLimits.target)}</dd>
            {plan.limits.kind === 'ecommerce' ? (
              <>
                <dt className="text-fg-muted">{t('verdict.beRoas')}</dt>
                <dd className="text-end font-semibold tabular-nums">{f.num(plan.limits.breakEvenROAS, 2)}×</dd>
              </>
            ) : (
              <>
                <dt className="text-fg-muted">{t('verdict.maxCac')}</dt>
                <dd className="text-end font-semibold tabular-nums">{f.money(plan.limits.maxCAC)}</dd>
              </>
            )}
          </dl>
        </div>
      </Block>

      {/* 5. Budget split */}
      {splitLines.length > 0 && (
        <Block title={t('split.title')} intro={t('split.intro')}>
          <div className="grid items-center gap-6 md:grid-cols-[14rem_1fr]">
            <Charts.SplitDonut
              label={t('split.chartLabel')}
              format={(v) => f.money(v, 0)}
              data={splitLines.map((l, i) => ({ label: `${t(`split.platforms.${l.platform}`)}: ${t(`split.items.${l.item}`)}`, value: l.amount, color: SERIES[i % SERIES.length] ?? 'var(--series-1)' }))}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-start text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="py-2 text-start font-medium">{t('split.item')}</th>
                    <th className="py-2 text-end font-medium">{t('split.amount')}</th>
                    <th className="py-2 text-end font-medium">{t('split.share')}</th>
                    <th className="py-2 ps-4 text-start font-medium">{t('split.why')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {splitLines.map((l, i) => (
                    <tr key={`${l.platform}-${l.item}`}>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className="size-3 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
                          {t(`split.platforms.${l.platform}`)}: {t(`split.items.${l.item}`)}
                        </span>
                      </td>
                      <td className="py-2 text-end font-semibold tabular-nums">{f.money(l.amount, 0)}</td>
                      <td className="py-2 text-end tabular-nums text-fg-muted">{f.pct(l.amount / Math.max(splitTotal, 1), 0)}</td>
                      <td className="py-2 ps-4 text-fg-muted">{t(`split.reasons.${l.reason}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-fg-muted">
                {(Object.entries(plan.split.reasons) as Array<[string, string]>).map(([p, r]) => (
                  <li key={p}>
                    <strong className="text-fg">{t(`split.platforms.${p}`)}:</strong> {t(`split.platformReasons.${r}`)}
                  </li>
                ))}
                {plan.learning && <li>{t('split.adSets', { count: plan.learning.recommendedAdSets })}</li>}
              </ul>
            </div>
          </div>
          {plan.split.ramp.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold">{t('split.rampTitle')}</h4>
              <p className="text-xs text-fg-muted">{t('split.rampIntro')}</p>
              <ol className="mt-2 flex flex-wrap gap-2">
                {plan.split.ramp.map((r) => (
                  <li key={r.day} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs">
                    <span className="text-fg-muted">{t('split.day', { day: r.day })}</span> <strong className="tabular-nums">{f.money(r.daily, 0)}</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Block>
      )}

      {/* 6. Bottleneck finder */}
      {plan.bottleneck && (
        <Block title={t('bottleneck.title')} intro={t('bottleneck.intro')}>
          <div className="grid gap-4 sm:grid-cols-3">
            {plan.bottleneck.stages.map((s) => (
              <MetricCard
                key={s.stage}
                label={t(`bottleneck.stages.${s.stage}`)}
                value={`${f.pct(s.rate, 0)} → ${f.pct(s.improvedRate, 0)}`}
                tone={plan.bottleneck?.weakest === s.stage ? 'warning' : undefined}
                flag={plan.bottleneck?.weakest === s.stage ? t('bottleneck.weakest') : undefined}
                hint={s.budgetSaved !== undefined ? t('bottleneck.saved', { amount: f.money(s.budgetSaved, 0) }) : t('bottleneck.extra', { clients: f.num(s.extraClients ?? 0, 1) })}
              />
            ))}
          </div>
        </Block>
      )}

      {/* 7. Account health */}
      {plan.health && (
        <Block title={t('health.title')} intro={t('health.intro')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['cpm', 'ctr', 'cvr', 'frequency'] as const).map((k) => {
              const h = plan.health?.[k];
              if (!h) return null;
              const value = k === 'cpm' ? f.money(h.value) : k === 'frequency' ? f.num(h.value, 2) : f.pct(h.value, 2);
              return <MetricCard key={k} label={t(`health.${k}`)} value={value} tone={flagTone[h.flag]} flag={t(`health.flags.${h.flag}`)} tooltip={t(`health.tip_${k}`)} />;
            })}
          </div>
        </Block>
      )}

      {/* 8. Scaling table + chart */}
      {plan.scaling.rows.length > 0 && (
        <Block
          title={t('scaling.title')}
          intro={plan.scaling.profitableLimit === null ? t('scaling.noLimit') : t('scaling.limit', { amount: f.money(plan.scaling.profitableLimit, 0) })}
        >
          <Charts.ScalingChart
            data={plan.scaling.rows.map((r) => ({ budget: r.budget, cpa: r.cpa }))}
            maxCost={plan.costLimits.max}
            limit={plan.scaling.profitableLimit}
            rtl={rtl}
            money={(v) => f.money(v, 0)}
            label={t('scaling.chartLabel')}
            costLabel={t(`scaling.cpa_${kind}`)}
            breakEvenLabel={t('scaling.breakEven')}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-fg-subtle">
                  <th className="py-2 text-start font-medium">{t('scaling.budget')}</th>
                  <th className="py-2 text-end font-medium">{t(`scaling.results_${kind}`)}</th>
                  <th className="py-2 text-end font-medium">{t(`scaling.cpa_${kind}`)}</th>
                  {leads && <th className="py-2 text-end font-medium">{t('scaling.cac')}</th>}
                  <th className="py-2 text-end font-medium">{t('scaling.roas')}</th>
                  <th className="py-2 text-end font-medium">{t('scaling.profitable')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plan.scaling.rows.map((r) => (
                  <tr key={r.budget} className={cn(Math.abs(r.budget - budget.monthly) < 1 && 'bg-accent-soft')}>
                    <td className="py-2 font-semibold tabular-nums">{f.money(r.budget, 0)}</td>
                    <td className="py-2 text-end tabular-nums">{f.num(r.results, 0)}</td>
                    <td className="py-2 text-end tabular-nums">{f.money(r.cpa)}</td>
                    {leads && <td className="py-2 text-end tabular-nums">{f.money(r.cac ?? 0)}</td>}
                    <td className="py-2 text-end tabular-nums">{f.num(r.roas, 2)}×</td>
                    <td className="py-2 text-end">
                      <Badge tone={r.profitable ? 'success' : 'danger'}>{r.profitable ? t('scaling.yes') : t('scaling.no')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      )}

      {/* 9. Decision rules and stop-loss (new accounts) */}
      {na && (
        <Block title={t('decision.title')} intro={t('decision.intro')}>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label={t('decision.scaleLabel')} value={`≤ ${f.money(na.test.decision.scaleBelow)}`} tone="success" hint={t('decision.scale')} />
            <MetricCard label={t('decision.optimizeLabel')} value={`${f.money(na.test.decision.scaleBelow)} – ${f.money(na.test.decision.stopAbove)}`} tone="warning" hint={t('decision.optimize')} />
            <MetricCard label={t('decision.stopLabel')} value={`> ${f.money(na.test.decision.stopAbove)}`} tone="danger" hint={t('decision.stop')} />
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            <li>{t('decision.stopLoss', { low: f.money(na.test.stopLoss.low, 0), high: f.money(na.test.stopLoss.high, 0) })}</li>
            <li>
              {t('decision.viabilityTitle')}{' '}
              <Badge tone={verdictTone[plan.verdict]}>{t(`decision.viability.${na.viability}`)}</Badge>
            </li>
            {na.biggestAssumption && <li>{t('decision.biggestAssumption', { field: t(`decision.assumptionFields.${na.biggestAssumption}`) })}</li>}
            <li>{t('decision.creativeCheck', { amount: f.money(na.test.creativeCost, 0) })}</li>
          </ul>
        </Block>
      )}

      {/* 10. Warnings */}
      <Block title={t('warnings.title')}>
        {plan.warnings.length === 0 ? (
          <p className="text-sm text-fg-muted">{t('warnings.none')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {plan.warnings.map((w, i) => (
              <li key={`${w.code}-${i}`} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
                <Badge tone={severityTone[w.severity]} className="mt-0.5 shrink-0">
                  {t(`warnings.severity.${w.severity}`)}
                </Badge>
                <span>
                  {t(`warnings.codes.${w.code}`, warningParams(w))}
                  {w.code === 'learningLimited' && plan.learning?.optimizeForATC && ` ${t('warnings.codes.optimizeATC')}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      {/* 11. Support banner */}
      <div className="no-print">
        <SupportBanner />
      </div>

      {/* 12. Actions */}
      <div className="no-print flex flex-wrap gap-3">
        <Button onClick={exportPdf}>{t('actions.pdf')}</Button>
        <Button variant="secondary" onClick={onShare}>
          {tp('actions.share')}
        </Button>
        <Button variant="secondary" onClick={onSave}>
          {tp('actions.saveScenario')}
        </Button>
        <Button variant="ghost" onClick={onRecalculate}>
          {t('actions.recalculate')}
        </Button>
      </div>
      <p className="text-xs text-fg-subtle">{t('actions.pdfNote')}</p>
    </div>
  );
}
