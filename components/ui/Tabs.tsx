'use client';

import { motion } from 'framer-motion';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TabItem = { id: string; label: ReactNode; badge?: ReactNode; disabled?: boolean };

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
};

/** Accessible tab list (WAI-ARIA tabs pattern) with an animated active indicator. */
export function Tabs({ items, value, onChange, label, className }: TabsProps) {
  const groupId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = items.filter((i) => !i.disabled);

  const onKeyDown = (e: KeyboardEvent) => {
    const current = enabled.findIndex((i) => i.id === value);
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const map: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
    };
    let next: number | undefined;
    if (e.key in map) next = (current + (map[e.key] ?? 0) + enabled.length) % enabled.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = enabled.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    const target = enabled[next];
    if (!target) return;
    onChange(target.id);
    refs.current[items.indexOf(target)]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface-muted p-1', className)}
    >
      {items.map((item, idx) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            id={tabId(groupId, item.id)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId(groupId, item.id)}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-glow disabled:opacity-40',
              selected ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`tab-indicator-${groupId}`}
                className="absolute inset-0 rounded-lg bg-surface shadow-soft"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{item.label}</span>
            {item.badge != null && <span className="relative">{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export const tabId = (group: string, id: string) => `${group}-tab-${id}`;
export const panelId = (group: string, id: string) => `${group}-panel-${id}`;
