'use client';

import dynamic from 'next/dynamic';

/**
 * The planner form loads after the page is interactive: its JavaScript (form, validation, engine) is
 * the heaviest on the site, and nothing in it needs server rendering (drafts and share links live in
 * the browser). The placeholder keeps the space so the page does not shift when it arrives.
 */
const Planner = dynamic(() => import('./Planner').then((m) => m.Planner), {
  ssr: false,
  loading: () => (
    <div aria-hidden="true" className="mx-auto min-h-[540px] max-w-3xl animate-pulse rounded-2xl bg-surface-muted/60 sm:min-h-[350px]" />
  ),
});

export function PlannerLazy() {
  return <Planner />;
}
