'use client';

import { useTranslations } from 'next-intl';
import { ErrorView } from '@/components/content/ErrorView';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common.errors');
  return (
    <ErrorView
      code="500"
      title={t('serverTitle')}
      text={t('serverText')}
      actions={
        <>
          <Button onClick={reset}>{t('retry')}</Button>
          <ButtonLink href="/" variant="secondary">
            {t('home')}
          </ButtonLink>
        </>
      }
    />
  );
}
