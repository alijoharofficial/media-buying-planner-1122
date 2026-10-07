import { getLocale, getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { breadcrumbs, graph } from '@/lib/jsonld';

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail plus BreadcrumbList structured data. Home is added automatically. */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const locale = await getLocale();
  const t = await getTranslations('common.breadcrumbs');
  const all = [{ name: t('home'), path: '/' }, ...items];
  return (
    <>
      <nav aria-label={t('label')} className="mb-6 flex justify-center">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="rtl-mirror">
                  ›
                </span>
              )}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-fg-muted">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-accent">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbs(locale, all))} />
    </>
  );
}
