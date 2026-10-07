import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { FaqAccordion } from '@/components/content/FaqAccordion';
import { GuideCard, GuideCover } from '@/components/content/GuideCard';
import { AuthorBox, Byline, TryPlanner } from '@/components/guides/ArticleParts';
import { JsonLd } from '@/components/JsonLd';
import { SupportBanner } from '@/components/SupportBanner';
import { locales } from '@/i18n/routing';
import { BRAND_NAME } from '@/lib/brand';
import { GUIDE_CONTENT, contentLocale, getGuide, publishedGuides, readingMinutes } from '@/lib/guides';
import { article, faqPage, graph } from '@/lib/jsonld';
import { buildMetadata, ogImageUrl } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => publishedGuides().map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const t = await getTranslations({ locale, namespace: 'guides' });
  const title = t(`items.${slug}.title`);
  return buildMetadata({
    locale,
    path: `/guides/${slug}`,
    title: `${title} | ${BRAND_NAME} ${t('article.titleSuffix')}`,
    absoluteTitle: true,
    ogTitle: title,
    description: t(`items.${slug}.summary`),
    type: 'article',
    publishedTime: guide.date,
  });
}

/** Shared article layout: cover, H1, byline, MDX body, FAQ, CTA, author box, related guides, support banner. */
export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('guides');
  const tn = await getTranslations('common.nav');
  const format = await getFormatter();
  const load = GUIDE_CONTENT[`${contentLocale(locale, slug)}/${slug}`];
  if (!load) notFound();
  const { default: Body, faq = [] } = await load();
  const title = t(`items.${slug}.title`);
  const minutes = readingMinutes(locale, slug);
  const related = publishedGuides()
    .filter((g) => g.slug !== slug)
    .sort((a, b) => Number(b.category === guide.category) - Number(a.category === guide.category))
    .slice(0, 3);

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ name: tn('guides'), path: '/guides' }, { name: title, path: `/guides/${slug}` }]} />
      <JsonLd
        data={graph(
          article({ locale, path: `/guides/${slug}`, title, description: t(`items.${slug}.summary`), date: guide.date, image: ogImageUrl(title, locale) }),
          ...(faq.length ? [faqPage(faq)] : []),
        )}
      />
      <header className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{t(`categories.${guide.category}`)}</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{t(`items.${slug}.summary`)}</p>
        <div className="mt-5">
          <Byline minutes={minutes} date={<time dateTime={guide.date}>{format.dateTime(new Date(guide.date), { dateStyle: 'long' })}</time>} />
        </div>
      </header>
      <div className="group mx-auto mt-10 max-w-4xl">
        <GuideCover guide={guide} large />
      </div>

      <article className="prose-article mx-auto mt-12 max-w-3xl">
        <Body />
      </article>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-10">
        {faq.length > 0 && (
          <section aria-labelledby="article-faq">
            <h2 id="article-faq" className="mb-4 text-2xl font-bold tracking-tight">
              {t('article.faqTitle')}
            </h2>
            <FaqAccordion items={faq} />
          </section>
        )}
        <TryPlanner />
        <AuthorBox />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="mb-6 text-2xl font-bold tracking-tight">
            {t('article.relatedTitle')}
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((g) => (
              <li key={g.slug}>
                <GuideCard guide={g} minutes={readingMinutes(locale, g.slug)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SupportBanner className="mt-16" />
    </main>
  );
}
