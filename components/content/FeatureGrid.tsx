import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { FEATURES } from '@/lib/site';
import { Reveal, RevealItem } from './Reveal';

/** Feature cards from the shared FEATURES array (home and Features page). */
/** headingLevel: h2 when the grid sits directly under the page's h1 (Features page). */
export function FeatureGrid({ detailed, headingLevel: H = 'h3' }: { detailed?: boolean; headingLevel?: 'h2' | 'h3' }) {
  const t = useTranslations('features.items');
  return (
    <Reveal as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {FEATURES.map((f, i) => (
        <RevealItem key={f.id} as="li" className={detailed ? 'xl:col-span-1' : ''}>
          <article className="group h-full rounded-xl border border-border bg-surface p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lift">
            <span
              className="inline-flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110 motion-safe:animate-[float_6s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <Icon name={f.icon} />
            </span>
            <H className="mt-4 text-base font-semibold">{t(`${f.id}.title`)}</H>
            <p className="mt-1.5 text-sm text-fg-muted">{t(`${f.id}.desc`)}</p>
            {detailed && <p className="mt-3 text-sm text-fg-muted">{t(`${f.id}.long`)}</p>}
          </article>
        </RevealItem>
      ))}
    </Reveal>
  );
}
