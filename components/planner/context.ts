'use client';

import { createContext, useContext } from 'react';
import type { Issue } from '@/lib/planner/validation';
import type { Mode } from '@/lib/planner/types';

export type PlannerCtx = {
  mode: Mode;
  currency: string;
  errors: Map<string, Issue>;
  warnings: Map<string, Issue>;
  /** Inline issues show after blur (touched) or after a calculate attempt. */
  showIssue: (path: string) => boolean;
  markTouched: (path: string) => void;
};

export const PlannerContext = createContext<PlannerCtx | null>(null);

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerContext');
  return ctx;
}
