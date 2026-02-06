import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquadsPublic } from '@/hooks/useBetaSquadsPublic';
import { BetaSquadFeedCard } from '@/components/beta/BetaSquadFeedCard';
import { BetaSquadCardSkeleton } from '@/components/beta/BetaSquadCardSkeleton';

export default function BetaSquads() {
  const t = useTranslation('beta');
  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage 
  } = useBetaSquadsPublic();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  // Flatten all pages into a single array
  const allApps = data?.pages.flatMap(page => page.apps) || [];

  return (
    <div className="container max-w-2xl py-8 px-4">
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
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <BetaSquadCardSkeleton key={i} />
          ))}
        </div>
      ) : allApps.length > 0 ? (
        <div className="space-y-6">
          {allApps.map((app) => (
            <BetaSquadFeedCard key={app.id} app={app} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t.loading}</span>
              </div>
            )}
          </div>
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
