import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useMyFeedback } from '@/hooks/useMyFeedback';
import { BetaFeedbackCompactCard } from '@/components/beta/BetaFeedbackCompactCard';
import { cn } from '@/lib/utils';

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
  const { data: myFindings = [], isLoading: isLoadingMyFindings } = useMyFeedback();

  const [activeTab, setActiveTab] = useState<'findings' | 'squads'>('findings');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['open', 'in_review']);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Set initial tab once data is loaded
  useEffect(() => {
    if (!isLoadingMyFindings && myFindings.length === 0 && mySquads.length > 0) {
      setActiveTab('squads');
    }
  }, [isLoadingMyFindings, myFindings.length, mySquads.length]);

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

  const isLoading = isLoadingPublic || (user && (isLoadingMySquads || isLoadingMyFindings));

  const filteredFindings = useMemo(() => {
    if (selectedStatuses.length === 0) return myFindings;
    return myFindings.filter(f => selectedStatuses.includes(f.status));
  }, [myFindings, selectedStatuses]);

  const filterStats = [
    { id: 'open', label: 'Abierto', color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/20' },
    { id: 'in_review', label: 'En Revisión', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20' },
    { id: 'closed', label: 'Resuelto', color: 'bg-[#68CFA2]', text: 'text-[#68CFA2]', border: 'border-[#68CFA2]/20' },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      {/* Hero Section */}
      <div className="container max-w-2xl pt-8 pb-4 px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <FlaskConical className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t.t('directoryTitle')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.t('directorySubtitle')}
        </p>
      </div>

      {/* User Squads Section (ONLY IF LOGGED IN AND HAS SQUADS) */}
      {user && (mySquads.length > 0 || myFindings.length > 0 || isLoadingMySquads || isLoadingMyFindings) && (
        <section className="w-full bg-muted/10 border-y border-border/50 py-8 mb-8">
          <div className="container max-w-4xl px-4">
            {/* Tabs Selector */}
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('findings')}
                className={cn(
                  "flex items-center gap-2 pb-4 px-2 transition-all relative whitespace-nowrap",
                  activeTab === 'findings' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("p-1.5 rounded-lg", activeTab === 'findings' ? "bg-orange-500/10" : "bg-transparent")}>
                  <FlaskConical className={cn("h-4 w-4", activeTab === 'findings' ? "text-orange-500" : "text-muted-foreground")} />
                </div>
                <span>{t.t('myFindingsTitle') || "Mis Hallazgos"}</span>
                {activeTab === 'findings' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" />}
              </button>

              <button 
                onClick={() => setActiveTab('squads')}
                className={cn(
                  "flex items-center gap-2 pb-4 px-2 transition-all relative whitespace-nowrap",
                  activeTab === 'squads' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("p-1.5 rounded-lg", activeTab === 'squads' ? "bg-primary/10" : "bg-transparent")}>
                  <LayoutGrid className={cn("h-4 w-4", activeTab === 'squads' ? "text-primary" : "text-muted-foreground")} />
                </div>
                <span>{t.t('mySquadsTitle')}</span>
                {activeTab === 'squads' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
              </button>
            </div>

            {/* Mis Hallazgos Content */}
            {activeTab === 'findings' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {filterStats.map(stat => {
                    const isSelected = selectedStatuses.includes(stat.id);
                    return (
                      <button
                        key={stat.id}
                        onClick={() => toggleStatus(stat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1.5",
                          isSelected 
                            ? `${stat.text} ${stat.border} bg-background shadow-sm` 
                            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isSelected ? stat.color : "bg-muted-foreground/40")} />
                        {stat.label}
                      </button>
                    );
                  })}
                </div>

                {isLoadingMyFindings ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-[140px] bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : filteredFindings.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredFindings.slice(0, 8).map((feedback) => (
                      <div key={feedback.id}>
                        <BetaFeedbackCompactCard feedback={feedback} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                    <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-xs">No se encontraron hallazgos con los filtros seleccionados.</p>
                    {selectedStatuses.length < 3 && (
                      <button 
                        onClick={() => setSelectedStatuses(['open', 'in_review', 'closed'])}
                        className="mt-2 text-primary font-bold hover:underline"
                      >
                        Mostrar todos
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mis Squads Content */}
            {activeTab === 'squads' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                {isLoadingMySquads ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-[140px] bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : mySquads.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {mySquads.map((app) => (
                      <div key={app.id}>
                        <BetaSquadCompactCard app={app} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No te has unido a ningún Beta Squad todavía.</p>
                  </div>
                )}
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
              {t.t('exploreTitle')}
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
                  <span>{t.t('loading')}</span>
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
              {t.t('emptyTitle')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t.t('emptyMessage')}
            </p>
            <Button asChild>
              <Link to="/me/apps">{t.t('emptyButton')}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
