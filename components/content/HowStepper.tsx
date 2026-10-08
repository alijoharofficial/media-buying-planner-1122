import { useTranslations } from 'next-intl';
import { HOW_STEPS } from '@/lib/site';
import { Reveal, RevealItem } from './Reveal';

/** 4-step animated stepper (home and How to Use). */
export function HowStepper({ headingLevel: H = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const t = useTranslations('home.how.steps');
  return (
    <Reveal as="ol" className="relative grid gap-6 md:grid-cols-4">
      <span aria-hidden="true" className="absolute inset-x-8 top-6 hidden h-0.5 bg-gradient-to-r from-accent via-brand to-accent opacity-40 md:block rtl:bg-gradient-to-l" />
      {HOW_STEPS.map((id, i) => (
        <RevealItem key={id} as="li" className="relative flex flex-col items-start gap-3 md:items-center md:text-center">
          <span className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-accent bg-bg text-lg font-bold text-accent shadow-soft">{i + 1}</span>
          <H className="text-base font-semibold">{t(`${id}.title`)}</H>
          <p className="text-sm text-fg-muted">{t(`${id}.desc`)}</p>
        </RevealItem>
      ))}
    </Reveal>
  );
}
