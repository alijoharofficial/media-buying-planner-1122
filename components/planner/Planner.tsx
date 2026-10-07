'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, panelId, tabId } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { buildPlan, type PlanResult } from '@/lib/engine';
import { defaultValues, exampleValues, toPlanInput } from '@/lib/planner/convert';
import { visibleTabs } from '@/lib/planner/fields';
import { suggestCurrency } from '@/lib/planner/options';
import { clearDraft, decodeShare, encodeShare, loadDraft, loadScenarios, saveDraft, saveScenario, type Scenario } from '@/lib/planner/storage';
import type { FormValues, TabId } from '@/lib/planner/types';
import { modeOf, validate, type Issue } from '@/lib/planner/validation';
import { PlannerContext, type PlannerCtx } from './context';
import { Results } from '@/components/results/Results';
import { ScenarioPanel } from './ScenarioPanel';
import { Step0 } from './Step0';
import { SummaryChips } from './SummaryChips';
import { TabPanel } from './TabPanel';

const TABS_ID = 'planner-tabs';

/** Planner shell: Step 0, the tabbed form, actions, autosave and the (Phase 4) results hand-off. */
export function Planner() {
  const t = useTranslations('planner');
  const toast = useToast();
  const methods = useForm<FormValues>({ defaultValues: defaultValues(), mode: 'onBlur' });
  const { reset, getValues, setValue, control } = methods;

  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [step0, setStep0] = useState<{ step: number; single: boolean } | null>({ step: 0, single: false });
  const [tab, setTab] = useState<TabId>('setup');
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [panel, setPanel] = useState<'save' | 'scenarios' | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formTopRef = useRef<HTMLFormElement>(null);

  // Load: share link hash first, then the autosaved draft (browser only).
  useEffect(() => {
    const shared = decodeShare(window.location.hash);
    const draft = loadDraft();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from browser storage */
    if (shared) {
      reset(shared);
      setStarted(true);
      setStep0(null);
      toast(t('actions.sharedLoaded'), 'success');
    } else if (draft) {
      reset(draft.values);
      setStarted(draft.started);
      setStep0(draft.started ? null : { step: 0, single: false });
    }
    setScenarios(loadScenarios());
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [reset, t, toast]);

  const values = useWatch({ control }) as FormValues;
  const mode = modeOf(values);
  const validation = useMemo(() => validate(values), [values]);
  const tabs = visibleTabs(mode);
  const activeTab = tabs.includes(tab) ? tab : 'setup';

  // Autosave (debounced).
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => saveDraft({ values, started }), 400);
    return () => clearTimeout(id);
  }, [values, started, loaded]);

  // Suggest a currency when the first region changes.
  const firstRegion = values.regions?.[0];
  const prevRegion = useRef(firstRegion);
  useEffect(() => {
    if (!loaded || firstRegion === prevRegion.current) return;
    prevRegion.current = firstRegion;
    const c = suggestCurrency(firstRegion ? [firstRegion] : []);
    if (c) setValue('currency', c, { shouldDirty: true });
  }, [firstRegion, loaded, setValue]);

  const byPath = (list: Issue[]) => new Map(list.map((i) => [i.path, i]));
  const errors = useMemo(() => byPath(validation.errors), [validation.errors]);
  const warnings = useMemo(() => byPath(validation.warnings), [validation.warnings]);
  const showIssue = useCallback((path: string) => submitted || touched.has(path) || touched.has(path.split('.')[0] ?? ''), [submitted, touched]);
  const markTouched = useCallback((path: string) => setTouched((s) => (s.has(path) ? s : new Set(s).add(path))), []);
  const ctx: PlannerCtx = { mode, currency: values.currency, errors, warnings, showIssue, markTouched };

  const count = (list: Issue[], id: TabId) => list.filter((i) => i.tab === id).length;
  const hardErrors = validation.errors.length;

  const calculate = () => {
    setSubmitted(true);
    if (hardErrors) {
      const first = validation.errors[0];
      if (first) setTab(first.tab);
      toast(t('tabs.fixErrors', { count: hardErrors }), 'danger');
      return;
    }
    setPlan(buildPlan(toPlanInput(getValues())));
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const goTab = (dir: 1 | -1) => {
    const i = tabs.indexOf(activeTab);
    const next = tabs[i + dir];
    if (next) setTab(next);
  };

  const loadValues = (v: FormValues, message: string) => {
    reset(v);
    setStarted(true);
    setStep0(null);
    setTouched(new Set());
    setSubmitted(false);
    setPlan(null);
    toast(message, 'success');
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${encodeShare(getValues())}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, '', url);
      toast(t('actions.shareCopied'), 'success');
    } catch {
      toast(t('actions.shareFailed'), 'danger');
    }
  };

  if (!loaded) return <div className="min-h-96" aria-busy="true" />;

  return (
    <FormProvider {...methods}>
      <PlannerContext.Provider value={ctx}>
        {step0 ? (
          <Step0
            step={step0.step}
            single={step0.single}
            onStep={(n) => setStep0({ step: Math.max(0, n), single: false })}
            onDone={() => {
              setStep0(null);
              setStarted(true);
            }}
          />
        ) : (
          <form ref={formTopRef} noValidate onSubmit={(e) => e.preventDefault()} className="no-print flex scroll-mt-24 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SummaryChips onEdit={(i) => setStep0({ step: i, single: true })} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => loadValues(exampleValues(getValues()), t('actions.exampleLoaded'))}>
                  {t('actions.loadExample')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!confirmClear) {
                      setConfirmClear(true);
                      setTimeout(() => setConfirmClear(false), 3000);
                      return;
                    }
                    setConfirmClear(false);
                    clearDraft();
                    const fresh = defaultValues();
                    loadValues({ ...fresh, ...modeOf(getValues()) }, t('actions.cleared'));
                  }}
                >
                  {confirmClear ? t('actions.clearConfirm') : t('actions.clearAll')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel(panel === 'save' ? null : 'save')} aria-expanded={panel === 'save'}>
                  {t('actions.saveScenario')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel(panel === 'scenarios' ? null : 'scenarios')} aria-expanded={panel === 'scenarios'}>
                  {t('actions.scenarios', { count: scenarios.length })}
                </Button>
                <Button size="sm" variant="secondary" onClick={share}>
                  {t('actions.share')}
                </Button>
              </div>
            </div>

            {panel === 'save' && (
              <Card className="flex flex-wrap items-end gap-3 p-4">
                <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
                  {t('actions.scenarioName')}
                  <input
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    maxLength={60}
                    className="h-11 rounded-lg border border-border-strong bg-surface px-3 text-sm focus-glow"
                  />
                </label>
                <Button
                  disabled={!scenarioName.trim()}
                  onClick={() => {
                    setScenarios(saveScenario(scenarioName.trim(), getValues()));
                    setScenarioName('');
                    setPanel(null);
                    toast(t('actions.savedToast'), 'success');
                  }}
                >
                  {t('actions.save')}
                </Button>
              </Card>
            )}
            {panel === 'scenarios' && (
              <Card className="p-4">
                <ScenarioPanel scenarios={scenarios} onChange={setScenarios} onLoad={(v) => loadValues(v, t('actions.scenarioLoaded'))} />
              </Card>
            )}

            <Tabs
              id={TABS_ID}
              label={t('tabs.label')}
              value={activeTab}
              onChange={(id) => setTab(id as TabId)}
              items={tabs.map((id) => {
                const e = count(validation.errors, id);
                const w = count(validation.warnings, id);
                return {
                  id,
                  label: t(`tabs.${id}`),
                  badge:
                    e || w ? (
                      <span className="flex gap-1">
                        {e > 0 && (
                          <Badge tone="danger" aria-label={t('tabs.errorsCount', { count: e })}>
                            {e}
                          </Badge>
                        )}
                        {w > 0 && (
                          <Badge tone="warning" aria-label={t('tabs.warningsCount', { count: w })}>
                            {w}
                          </Badge>
                        )}
                      </span>
                    ) : undefined,
                };
              })}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                role="tabpanel"
                id={panelId(TABS_ID, activeTab)}
                aria-labelledby={tabId(TABS_ID, activeTab)}
                tabIndex={0}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl focus:outline-none"
              >
                <Card>
                  <TabPanel tab={activeTab} />
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => goTab(-1)} disabled={tabs.indexOf(activeTab) === 0}>
                <span className="rtl-mirror" aria-hidden="true">←</span> {t('tabs.back')}
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                {hardErrors > 0 && (
                  <button type="button" onClick={calculate} className="text-sm text-danger underline-offset-2 hover:underline focus-glow">
                    {t('tabs.showIssues', { count: hardErrors })}
                  </button>
                )}
                {tabs.indexOf(activeTab) < tabs.length - 1 && (
                  <Button variant="secondary" onClick={() => goTab(1)}>
                    {t('tabs.next')} <span className="rtl-mirror" aria-hidden="true">→</span>
                  </Button>
                )}
                <Button onClick={calculate} disabled={hardErrors > 0} shimmer={hardErrors === 0}>
                  {t('tabs.calculate')}
                </Button>
              </div>
            </div>
          </form>
        )}

        <div ref={resultsRef} aria-live="polite">
          {plan && !step0 && (
            <div className="mt-10">
              <Results
                plan={plan}
                currency={values.currency}
                onShare={share}
                onSave={() => {
                  setPanel('save');
                  formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                onRecalculate={() => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            </div>
          )}
        </div>
      </PlannerContext.Provider>
    </FormProvider>
  );
}
