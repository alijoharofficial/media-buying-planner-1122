import { useTranslations } from 'next-intl';
import { ErrorView } from '@/components/content/ErrorView';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('common.errors');
  return (
    <ErrorView
      code="404"
      title={t('notFoundTitle')}
      text={t('notFoundText')}
      actions={
        <>
          <ButtonLink href="/">{t('home')}</ButtonLink>
          <ButtonLink href="/calculator" variant="secondary">
            {t('planner')}
          </ButtonLink>
        </>
      }
    />
  );
}
