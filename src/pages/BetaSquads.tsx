import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquadsPublic } from '@/hooks/useBetaSquadsPublic';
import { useMyBetaSquads } from '@/hooks/useMyBetaSquads';
import { BetaSquadFeedCard } from '@/components/beta/BetaSquadFeedCard';
import { BetaSquadCompactCard } from '@/components/beta/BetaSquadCompactCard';
import { BetaSquadCardSkeleton } from '@/components/beta/BetaSquadCardSkeleton';
import { useAuth } from '@/hooks/useAuth';

export default function BetaSquads() {
  const t = useTranslation('beta');
  const { user } = useAuth();
  const { 
    data, 
    isLoading: isLoadingPublic, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage 
  } = useBetaSquadsPublic();

  const { data: mySquads = [], isLoading: isLoadingMySquads } = useMyBetaSquads();

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

  // Flatten all pages and filter out apps user is already in
  const exploreApps = useMemo(() => {
    const allApps = data?.pages.flatMap(page => page.apps) || [];
    const mySquadIds = new Set(mySquads.map(app => app.id));
    return allApps.filter(app => !mySquadIds.has(app.id));
  }, [data?.pages, mySquads]);

  const isLoading = isLoadingPublic || (user && isLoadingMySquads);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      {/* Hero Section */}
      <div className="container max-w-2xl pt-8 pb-4 px-4 text-center">
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

      {/* User Squads Section (ONLY IF LOGGED IN AND HAS SQUADS) */}
      {user && (mySquads.length > 0 || isLoadingMySquads) && (
        <section className="w-full bg-muted/10 border-y border-border/50 py-8 mb-8">
          <div className="container max-w-4xl px-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {t.mySquadsTitle}
              </h2>
            </div>

            {isLoadingMySquads ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="min-w-[240px] h-[160px] bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mySquads.map((app) => (
                  <div key={app.id}>
                    <BetaSquadCompactCard app={app} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Exploration Section */}
      <div className="container max-w-2xl px-4 pb-16">
        {user && mySquads.length > 0 && (
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t.exploreTitle}
            </h2>
          </div>
        )}

        {isLoadingPublic && exploreApps.length === 0 ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <BetaSquadCardSkeleton key={i} />
            ))}
          </div>
        ) : exploreApps.length > 0 ? (
          <div className="space-y-6">
            {exploreApps.map((app) => (
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
        ) : !isLoadingPublic && (
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
    </div>
  );
}
