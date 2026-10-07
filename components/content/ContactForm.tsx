'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { inputClass } from '@/components/planner/inputs';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { contactSchema } from '@/lib/contact';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Turnstile = { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
type Field = 'name' | 'email' | 'message';

export function ContactForm() {
  const t = useTranslations('pages.contact');
  const toast = useToast();
  const [values, setValues] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [token, setToken] = useState<string>();
  const [sending, setSending] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (!SITE_KEY || !scriptReady || !ts || !widgetRef.current || widgetId.current) return;
    widgetId.current = ts.render(widgetRef.current, { sitekey: SITE_KEY, callback: setToken, 'expired-callback': () => setToken(undefined) });
  }, [scriptReady]);

  const check = (field?: Field) => {
    const r = contactSchema.safeParse(values);
    const next: Partial<Record<Field, string>> = {};
    if (!r.success) for (const i of r.error.issues) next[i.path[0] as Field] ??= i.message;
    setErrors(field ? { ...errors, [field]: next[field] } : next);
    return r.success;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!check()) return;
    if (SITE_KEY && !token) {
      toast(t('errors.verification'), 'warning');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, token }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'unavailable');
      toast(t('success'), 'success');
      setValues({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      const code = err instanceof Error && ['rateLimited', 'verification', 'invalid'].includes(err.message) ? err.message : 'unavailable';
      toast(t(`errors.${code}`), 'danger');
    } finally {
      setSending(false);
      const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (widgetId.current) ts?.reset(widgetId.current);
      setToken(undefined);
    }
  };

  const field = (name: Field, multiline = false) => {
    const id = `contact-${name}`;
    const err = errors[name];
    const props = {
      id,
      name,
      value: values[name],
      required: true,
      'aria-invalid': Boolean(err) || undefined,
      'aria-describedby': err ? `${id}-err` : undefined,
      onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => check(name),
      className: cn(inputClass, err ? 'border-danger' : 'border-border-strong', multiline && 'h-40 py-3'),
    };
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {t(`fields.${name}`)}
        </label>
        {multiline ? <textarea {...props} /> : <input {...props} type={name === 'email' ? 'email' : 'text'} autoComplete={name === 'email' ? 'email' : 'name'} />}
        {err && (
          <p id={`${id}-err`} role="alert" className="text-xs text-danger">
            {t(`errors.${err}`)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      {SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onReady={() => setScriptReady(true)} />}
      {field('name')}
      {field('email')}
      {field('message', true)}
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">{t('fields.website')}</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))} />
      </div>
      {SITE_KEY && <div ref={widgetRef} />}
      <Button type="submit" size="lg" disabled={sending} className="self-start">
        {sending ? t('sending') : t('send')}
      </Button>
      <p className="text-xs text-fg-subtle">{t('privacy')}</p>
    </form>
  );
}
