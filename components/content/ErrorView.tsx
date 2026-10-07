import type { ReactNode } from 'react';

/** Shared layout for the 404 and 500 pages. */
export function ErrorView({ code, title, text, actions }: { code: string; title: string; text: string; actions: ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="bg-gradient-to-r from-brand to-accent bg-clip-text text-7xl font-extrabold tracking-tight text-transparent md:text-8xl">{code}</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-3 text-fg-muted">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
    </main>
  );
}
