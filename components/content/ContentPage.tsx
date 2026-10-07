import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ContentSection = { heading: string; body?: string[]; list?: string[] };

/** Page header used by every inner page: one H1 per page. */
export function PageHeader({ eyebrow, title, intro, className }: { eyebrow?: string; title: string; intro?: string; className?: string }) {
  return (
    <header className={cn('mx-auto max-w-3xl text-center', className)}>
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-fg-muted">{intro}</p>}
    </header>
  );
}

/** Reusable content-page template: header, then H2 sections with paragraphs and lists. */
export function ContentPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  updated?: string;
  sections: ContentSection[];
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      {updated && <p className="mt-4 text-center text-sm text-fg-subtle">{updated}</p>}
      <article className="mx-auto mt-12 flex max-w-3xl flex-col gap-10">
        {sections.map((s) => (
          <section key={s.heading} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">{s.heading}</h2>
            {s.body?.map((p) => (
              <p key={p} className="leading-relaxed text-fg-muted">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="flex list-disc flex-col gap-2 ps-5 text-fg-muted marker:text-accent">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {children}
      </article>
      {footer && <div className="mx-auto mt-14 max-w-5xl">{footer}</div>}
    </main>
  );
}
