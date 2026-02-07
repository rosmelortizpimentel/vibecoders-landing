import { BetaTab } from '@/components/me/BetaTab';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { Loader2 } from 'lucide-react';

export default function Beta() {
  const appsHook = useApps();
  const { t } = useTranslation('beta');

  if (appsHook.loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('managementDescription')}
        </p>
      </div>
      <BetaTab appsHook={appsHook} />
    </div>
  );
}
