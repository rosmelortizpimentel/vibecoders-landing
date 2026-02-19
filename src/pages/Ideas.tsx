import { IdeasTab } from '@/components/me/IdeasTab';
import { useTranslation } from '@/hooks/useTranslation';

export default function Ideas() {
  const { t } = useTranslation('profile');

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-4 shrink-0">
        <p className="text-muted-foreground text-sm">
          {t('ideas.pageDescription')}
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <IdeasTab />
      </div>
    </div>
  );
}
