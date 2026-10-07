'use client';

import { BRAND_NAME } from '@/lib/brand';
import './globals.css';

// Last-resort error page when the root layout itself fails. Translations are unavailable at this
// point, so it shows only the brand, the error code and a reload control.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-sm font-semibold">{BRAND_NAME}</p>
        <p className="text-7xl font-extrabold">500</p>
        <button type="button" onClick={reset} aria-label="Reload" className="rounded-lg bg-accent px-6 py-3 text-2xl font-semibold text-accent-fg">
          ↻
        </button>
      </body>
    </html>
  );
}
