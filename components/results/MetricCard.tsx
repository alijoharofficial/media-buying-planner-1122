import type { ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const toneBar: Record<Tone, string> = {
  neutral: 'bg-border-strong',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/** Generic metric tile used by every result block. */
export function MetricCard({ label, value, hint, tone, tooltip, flag }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone; tooltip?: string; flag?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-soft">
      {tone && <span aria-hidden="true" className={cn('absolute inset-y-0 start-0 w-1', toneBar[tone])} />}
      <div className="flex items-center gap-1.5 text-sm text-fg-muted">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-fg">{value}</div>
      {(hint || flag) && (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          {flag && <span className="font-semibold text-fg">{flag}</span>}
          {hint}
        </div>
      )}
    </div>
  );
}
