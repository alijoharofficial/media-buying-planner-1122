'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export const inputClass =
  'h-11 w-full rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-ring)]';
export const borderFor = (invalid?: boolean) => (invalid ? 'border-danger' : 'border-border-strong');

type A11y = { id?: string; invalid?: boolean; describedBy?: string; required?: boolean };

// ---------- Number input ----------

function separators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return { group: parts.find((p) => p.type === 'group')?.value ?? ',', decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.' };
}

export function currencySymbol(locale: string, currency: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}

type NumberInputProps = A11y & {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onBlur?: () => void;
  kind: 'currency' | 'percent' | 'number' | 'integer';
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: number;
  className?: string;
};

/** Text-based number input: thousand separators when idle, raw while typing, ArrowUp/Down and +/- steppers. */
export function NumberInput({ value, onChange, onBlur, kind, currency = 'USD', min, max, step, placeholder, className, ...a11y }: NumberInputProps) {
  const locale = useLocale();
  const t = useTranslations('planner.ui');
  const { group, decimal } = useMemo(() => separators(locale), [locale]);
  const [draft, setDraft] = useState<string | null>(null);
  const maxFrac = kind === 'integer' ? 0 : 4;
  const fmt = (n: number | undefined) => (n === undefined ? '' : new Intl.NumberFormat(locale, { maximumFractionDigits: maxFrac }).format(n));
  const stepSize = step ?? (kind === 'integer' || kind === 'currency' ? 1 : kind === 'percent' ? 1 : 0.1);

  const parse = (s: string): number | undefined => {
    const cleaned = s.split(group).join('').replace(/\s/g, '').split(decimal).join('.').replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return undefined;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  };
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const bump = (dir: 1 | -1) => {
    const next = clamp(Math.round(((value ?? 0) + dir * stepSize) * 1e6) / 1e6);
    onChange(next);
    if (draft !== null) setDraft(String(next).replace('.', decimal));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      bump(e.key === 'ArrowUp' ? 1 : -1);
    }
  };

  const prefix = kind === 'currency' ? currencySymbol(locale, currency) : undefined;
  const suffix = kind === 'percent' ? '%' : undefined;

  return (
    <div className={cn('group relative flex items-stretch', className)}>
      {prefix && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-fg-subtle">
          {prefix}
        </span>
      )}
      <input
        id={a11y.id}
        type="text"
        inputMode={kind === 'integer' ? 'numeric' : 'decimal'}
        autoComplete="off"
        aria-invalid={a11y.invalid || undefined}
        aria-describedby={a11y.describedBy}
        aria-required={a11y.required || undefined}
        value={draft ?? fmt(value)}
        placeholder={placeholder !== undefined ? fmt(placeholder) : undefined}
        onFocus={() => setDraft(value === undefined ? '' : String(value).replace('.', decimal))}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parse(e.target.value));
        }}
        onBlur={() => {
          setDraft(null);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        className={cn(inputClass, borderFor(a11y.invalid), 'tabular-nums pe-16', prefix && (prefix.length > 1 ? 'ps-11' : 'ps-7'))}
      />
      <span className="absolute inset-y-0 end-1 flex items-center gap-0.5">
        {suffix && <span aria-hidden="true" className="me-1 text-sm text-fg-subtle">{suffix}</span>}
        {(['-', '+'] as const).map((sign) => (
          <button
            key={sign}
            type="button"
            tabIndex={-1}
            aria-label={sign === '+' ? t('increase') : t('decrease')}
            onClick={() => bump(sign === '+' ? 1 : -1)}
            className="flex size-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
          >
            {sign === '+' ? '+' : '−'}
          </button>
        ))}
      </span>
    </div>
  );
}

// ---------- Toggle ----------

export function Toggle({ checked, onChange, id, describedBy }: { checked: boolean; onChange: (v: boolean) => void; id?: string; describedBy?: string }) {
  const t = useTranslations('planner.ui');
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className="inline-flex h-11 items-center gap-3 rounded-lg text-sm font-medium text-fg focus-glow"
    >
      <span className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-border-strong')}>
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start]', checked ? 'start-[22px]' : 'start-0.5')} />
      </span>
      {checked ? t('yes') : t('no')}
    </button>
  );
}

// ---------- Tag input ----------

export function TagInput({ value, onChange, id, describedBy }: { value: string[]; onChange: (v: string[]) => void; id?: string; describedBy?: string }) {
  const t = useTranslations('planner.ui');
  const [text, setText] = useState('');
  const add = () => {
    const tag = text.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setText('');
  };
  return (
    <div className={cn(inputClass, borderFor(), 'flex h-auto min-h-11 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-accent')}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
          {tag}
          <button type="button" aria-label={t('removeItem', { item: tag })} onClick={() => onChange(value.filter((x) => x !== tag))} className="rounded hover:text-fg">
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        aria-describedby={describedBy}
        value={text}
        placeholder={t('tagsHint')}
        onChange={(e) => setText(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}

// ---------- Combobox (searchable, grouped, single or multi) ----------

export type ComboOption = { value: string; label: string; group?: string };

type ComboboxProps = A11y & {
  options: ComboOption[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  onBlur?: () => void;
  multiple?: boolean;
  placeholder?: string;
};

/** WAI-ARIA combobox with a filterable listbox. */
export function Combobox({ options, value, onChange, onBlur, multiple, placeholder, ...a11y }: ComboboxProps) {
  const t = useTranslations('planner.ui');
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [options, query]);

  const choose = (o: ComboOption) => {
    if (multiple) onChange(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value]);
    else {
      onChange(o.value);
      setOpen(false);
    }
    setQuery('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      const o = filtered[active];
      if (o) choose(o);
    } else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Backspace' && multiple && !query && selected.length) onChange(selected.slice(0, -1));
  };

  return (
    <div className="relative">
      <div
        className={cn(inputClass, borderFor(a11y.invalid), 'flex h-auto min-h-11 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--color-ring)]')}
        onClick={() => inputRef.current?.focus()}
      >
        {multiple &&
          selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {labelOf(v)}
              <button
                type="button"
                aria-label={t('removeItem', { item: labelOf(v) })}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((x) => x !== v));
                }}
                className="rounded hover:text-fg"
              >
                ×
              </button>
            </span>
          ))}
        <input
          ref={inputRef}
          id={a11y.id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={a11y.invalid || undefined}
          aria-describedby={a11y.describedBy}
          aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={open || multiple ? query : selected[0] ? labelOf(selected[0]) : ''}
          placeholder={selected.length && multiple ? '' : placeholder ?? t('search')}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
            onBlur?.();
          }}
          onKeyDown={onKeyDown}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-bg-elevated p-1 shadow-lift"
        >
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-fg-subtle">{t('noResults')}</li>}
          {filtered.map((o, i) => {
            const header = o.group && o.group !== filtered[i - 1]?.group ? o.group : undefined;
            const isSel = selected.includes(o.value);
            return (
              <li key={o.value} role="presentation">
                {header && <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{header}</div>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSel}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  onMouseEnter={() => setActive(i)}
                  className={cn('flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm', i === active ? 'bg-surface-muted' : '', isSel && 'font-semibold text-accent')}
                >
                  {o.label}
                  {isSel && <span aria-hidden="true">✓</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
