import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { namespaces as allNamespaces } from '@/i18n/routing';

type Namespace = (typeof allNamespaces)[number];

/**
 * Sends only the message namespaces a client subtree needs ('common' is always included), instead of
 * serialising every namespace into each page's HTML.
 */
export async function ClientMessages({ namespaces = [], children }: { namespaces?: Namespace[]; children: ReactNode }) {
  const all = await getMessages();
  const messages = Object.fromEntries(['common', ...namespaces].map((ns) => [ns, all[ns]]));
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
