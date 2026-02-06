import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquadsPublic } from '@/hooks/useBetaSquadsPublic';
import { BetaSquadPublicCard } from '@/components/beta/BetaSquadPublicCard';
import { BetaSquadCardSkeleton } from '@/components/beta/BetaSquadCardSkeleton';

export default function BetaSquads() {
  const t = useTranslation('beta');
  const { data: apps, isLoading } = useBetaSquadsPublic();

  return (
    <div className="container max-w-6xl py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <FlaskConical className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t.directoryTitle}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.directorySubtitle}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <BetaSquadCardSkeleton key={i} />
          ))}
        </div>
      ) : apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <BetaSquadPublicCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <FlaskConical className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t.emptyTitle}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t.emptyMessage}
          </p>
          <Button asChild>
            <Link to="/me/apps">{t.emptyButton}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
