import { useState, useMemo, useEffect } from 'react';
import { Search, Rocket, Handshake, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePublicApps, useAllPublicApps } from '@/hooks/usePublicApps';
import { useAppLikesBatch } from '@/hooks/useAppLikesBatch';
import { useAuth } from '@/hooks/useAuth';
import { AppDirectoryCard } from '@/components/apps/AppDirectoryCard';
import { TopAppsSidebar } from '@/components/apps/TopAppsSidebar';
import { FiltersBottomSheet } from '@/components/apps/FiltersBottomSheet';

export default function AppsDirectory() {
  const { filter } = useParams();
  const navigate = useNavigate();
  const { setHeaderContent } = usePageHeader();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Temporary state for bottom sheet (applied on "Aplicar")
  const [pendingFilter, setPendingFilter] = useState<string>('all');
  const [pendingSubFilter, setPendingSubFilter] = useState<string>('all');

  const currentFilter = filter || 'all';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { t } = useTranslation('common');
  const { user } = useAuth();

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePublicApps(debouncedSearch, currentFilter, activeSubFilter);

  const filteredApps = useMemo(() => 
    data?.pages.flatMap(page => page.apps) || [], 
  [data]);

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <Rocket className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{t('navigation.exploreApps')}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent, t]);

  // Sync pending state when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      setPendingFilter(currentFilter);
      setPendingSubFilter(activeSubFilter);
    }
  }, [sheetOpen, currentFilter, activeSubFilter]);

  const filters = [
    { id: 'all', label: 'Todas', path: '/apps' },
    { id: 'open-for-testing', label: 'Open for Testing', path: '/apps/open-for-testing' },
    { id: 'open-to-partnerships', label: 'Open to Partnerships', path: '/apps/open-to-partnerships' },
  ];

  const subFilters = [
    { id: 'all', label: 'Todos' },
    { id: 'investor', label: 'Inversor' },
    { id: 'tech_partner', label: 'Tech Partner' },
    { id: 'growth_partner', label: 'Growth Partner' },
  ];

  // Batch-fetch likes for all visible apps (1 RPC call instead of N*2)
  const appIds = useMemo(() => filteredApps.map(a => a.id), [filteredApps]);
  const { likesMap, invalidate: invalidateLikes } = useAppLikesBatch(appIds);

  // Count active filters for badge
  const activeFilterCount = 
    (currentFilter !== 'all' ? 1 : 0) + 
    (currentFilter === 'open-to-partnerships' && activeSubFilter !== 'all' ? 1 : 0);

  // Bottom sheet sections
  const sheetSections = [
    {
      id: 'type',
      label: 'Tipo',
      options: filters.map(f => ({ id: f.id, label: f.label })),
      value: pendingFilter,
      onChange: (v: string) => setPendingFilter(v),
    },
    {
      id: 'partner',
      label: 'Tipo de Partner',
      options: subFilters,
      value: pendingSubFilter,
      onChange: (v: string) => setPendingSubFilter(v),
      visible: pendingFilter === 'open-to-partnerships',
    },
  ];

  const handleSheetApply = () => {
    const target = filters.find(f => f.id === pendingFilter);
    if (target) navigate(target.path);
    setActiveSubFilter(pendingSubFilter);
  };

  const handleSheetClear = () => {
    setPendingFilter('all');
    setPendingSubFilter('all');
  };

  return (
    <div className="flex-1 w-full max-w-full min-h-screen min-w-0 px-0.5 pb-24 pt-4 bg-background">
      {/* Search + Filters */}
      <div className="mb-6 px-1">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input - expands to left */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar app..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#eeeeee] shadow-sm focus-visible:ring-primary h-10 w-full"
            />
          </div>

          {/* Filters List - horizontal on mobile, aligned right on desktop */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 md:mx-0 md:px-0 pb-1 md:pb-0 md:shrink-0">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(f.path)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border h-10 flex items-center justify-center",
                  currentFilter === f.id || (currentFilter === 'all' && f.id === 'all')
                    ? "bg-[#68CF94] text-[#1C1C1C] border-[#68CF94]" 
                    : "bg-white text-[#1C1C1C]/60 border-[#e5e5e5] hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
            
            {/* Mobile Filter Button - only shows if it opens a sheet with more content */}
            <button
              onClick={() => setSheetOpen(true)}
              className="flex md:hidden items-center gap-1.5 px-4 h-10 rounded-full bg-white border border-[#eeeeee] shadow-sm text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-filters for Partnerships (Desktop and Mobile) */}
        {currentFilter === 'open-to-partnerships' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200 mt-2 pb-1 -mx-1 px-1 md:mx-0 md:px-0">
            <Handshake className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
            {subFilters.map((sf) => (
              <button
                key={sf.id}
                onClick={() => setActiveSubFilter(sf.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border",
                  activeSubFilter === sf.id
                    ? "bg-[#68CF94]/10 text-[#68CF94] border-[#68CF94]/20" 
                    : "bg-white text-[#1C1C1C]/60 border-[#e5e5e5] hover:bg-muted"
                )}
              >
                {sf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 px-1 mt-4">
        {/* Left Column — App List */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #eeeeee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-5 px-4 border-b border-border/60 last:border-b-0">
                  <div className="w-14 h-14 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-muted rounded-full animate-pulse" />
                      <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="w-10 h-14 bg-muted rounded-xl animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #eeeeee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {filteredApps.map(app => (
                  <AppDirectoryCard
                    key={app.id}
                    app={app}
                    likeCount={likesMap[app.id]?.likes_count ?? 0}
                    isLiked={likesMap[app.id]?.is_liked ?? false}
                    isAuthenticated={!!user}
                    onLikeToggled={invalidateLikes}
                    showBetaBadge={currentFilter !== 'open-for-testing'}
                    showPartnershipBadge={currentFilter !== 'open-to-partnerships'}
                  />
                ))}
              </div>

              {/* Pagination Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-2.5 rounded-full bg-white border border-[#eeeeee] shadow-sm text-sm font-semibold text-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
                  >
                    {isFetchingNextPage ? t('loading') : "Cargar más"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border/50 shadow-sm">
              <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">Sin resultados</h3>
              <p className="text-muted-foreground">No se encontraron apps que coincidan con tus filtros.</p>
            </div>
          )}
        </div>

        {/* Right Column — Top Apps Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[5.25rem]">
          <TopAppsSidebar />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <FiltersBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        sections={sheetSections}
        onApply={handleSheetApply}
        onClear={handleSheetClear}
      />
    </div>
  );
}
