import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

/**
 * All security headers live here (one place), plus locale routing for pages.
 * CSP uses a per-request nonce with 'strict-dynamic', so pages render on request (nonces cannot be baked into static HTML).
 */

const intl = createMiddleware(routing);
const isDev = process.env.NODE_ENV !== 'production';

function contentSecurityPolicy(nonce: string) {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
    // Inline style attributes come from Framer Motion and Recharts; styles cannot run code.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com${isDev ? ' ws:' : ''}`,
    `frame-src https://challenges.cloudflare.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `manifest-src 'self'`,
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

const STATIC_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** Paths that are not locale-routed pages: API, OG images, icons, metadata files. */
const NON_PAGE = /^\/(api|og|pwa-icon|apple-icon|icon\.svg|manifest\.webmanifest|robots\.txt|sitemap\.xml)(\/|$)/;

export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  // Next.js reads the nonce from the request CSP header and applies it to its own scripts.
  request.headers.set('x-nonce', nonce);
  request.headers.set('Content-Security-Policy', csp);

  const response = NON_PAGE.test(request.nextUrl.pathname)
    ? NextResponse.next({ request: { headers: request.headers } })
    : intl(request);

  response.headers.set('Content-Security-Policy', csp);
  for (const [k, v] of Object.entries(STATIC_HEADERS)) response.headers.set(k, v);
  return response;
}

export const config = {
  // Everything except build assets and prefetches.
  matcher: [{ source: '/((?!_next/static|_next/image|_vercel).*)', missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }] }],
};
