import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { ClientMessages } from '@/components/ClientMessages';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Deterrents } from '@/components/Deterrents';
import { JsonLd } from '@/components/JsonLd';
import { Providers } from '@/components/Providers';
import { graph, organization, website } from '@/lib/jsonld';
import { BRAND_NAME, SITE_URL } from '@/lib/brand';
import { CONSENT_PRECHECK } from '@/lib/consent';
import { fontVariables } from '@/lib/fonts';
import { getDirection, routing } from '@/i18n/routing';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${BRAND_NAME} | ${t('tagline')}`, template: `%s | ${BRAND_NAME}` },
    description: t('description'),
    applicationName: BRAND_NAME,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#060a1f' },
  ],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common.a11y' });
  const tm = await getTranslations({ locale, namespace: 'common.meta' });
  // Reading the per-request CSP nonce (set in proxy.ts) makes pages render on request.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    // suppressHydrationWarning: next-themes sets the theme class before hydration (no flash).
    <html lang={locale} dir={getDirection(locale)} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        {/* Hides the server-rendered cookie banner before first paint when a choice is already saved. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: CONSENT_PRECHECK }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lift"
        >
          {t('skipToContent')}
        </a>
        <ClientMessages>
          <Providers nonce={nonce}>
            <Header />
            {children}
            <Footer />
            <CookieConsent />
            <Deterrents />
            <JsonLd data={graph(organization(), website(locale, tm('description')))} />
          </Providers>
        </ClientMessages>
      </body>
    </html>
  );
}
