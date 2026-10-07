'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

type Consent = 'accepted' | 'rejected';
const KEY = 'mbp:consent:v1';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch {
    return null;
  }
}

/** Cookie banner. Analytics (GA4, optional via NEXT_PUBLIC_GA_ID) loads only after consent. */
export function CookieConsent() {
  const t = useTranslations('common.cookie');
  const [consent, setConsent] = useState<Consent | null | 'unknown'>('unknown');

  // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser storage after mount
  useEffect(() => setConsent(readConsent()), []);

  const choose = (c: Consent) => {
    try {
      window.localStorage.setItem(KEY, c);
    } catch {
      /* storage blocked: the choice lasts for this page view */
    }
    setConsent(c);
  };

  return (
    <>
      {consent === 'accepted' && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {consent === null && (
        <div role="region" aria-label={t('label')} className="no-print fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-bg-elevated p-5 shadow-lift">
          <p className="text-sm text-fg">
            {t('text')}{' '}
            <Link href="/cookie-policy" className="font-medium text-accent underline-offset-2 hover:underline">
              {t('policy')}
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose('accepted')}>
              {t('accept')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => choose('rejected')}>
              {t('reject')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
