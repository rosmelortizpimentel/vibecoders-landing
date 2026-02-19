import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IdeasTab } from '@/components/me/IdeasTab';
import { useTranslation } from '@/hooks/useTranslation';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { Lightbulb } from 'lucide-react';

export default function Ideas() {
  const { t } = useTranslation('profile');
  const tCommon = useTranslation('common');
  const { setHeaderContent } = usePageHeader();
  const { ideaId } = useParams<{ ideaId?: string }>();

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{tCommon.navigation.myIdeas}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 min-h-0">
        <IdeasTab initialIdeaId={ideaId} />
      </div>
    </div>
  );
}
