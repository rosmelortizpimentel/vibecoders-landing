import { useState } from 'react';
import { Trophy, Heart } from 'lucide-react';
import { useTopApps, TopAppEntry } from '@/hooks/useAppLikesBatch';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Period = 'week' | 'month' | 'all';

const tabs: { id: Period; label: string }[] = [
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'all', label: 'General' },
];

export function TopAppsSidebar() {
  const [activePeriod, setActivePeriod] = useState<Period>('week');
  const { data: topApps = [], isLoading } = useTopApps(activePeriod);

  return (
    <div className="bg-white rounded-xl overflow-hidden lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto no-scrollbar" style={{ border: '1px solid #eeeeee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <h2 className="text-lg font-bold text-foreground">Top Apps</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePeriod(tab.id)}
            className={cn(
              "px-3 py-2.5 text-xs font-semibold transition-all relative whitespace-nowrap",
              activePeriod === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activePeriod === tab.id && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Ranking List */}
      <div className="py-2">
        {isLoading ? (
          <div className="space-y-1 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-6 h-4 bg-muted rounded animate-pulse" />
                <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : topApps.length > 0 ? (
          topApps.map((app: TopAppEntry, index: number) => (
            <div
              key={app.app_id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
            >
              {/* Position Number */}
              <span className="w-6 text-center font-bold text-sm tabular-nums shrink-0 mt-1.5" style={{
                color: index === 0 ? '#FFD900' : '#6B7280'
              }}>
                {index + 1}
              </span>

              {/* App Logo */}
              <Link to={`/app/${app.app_id}`} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5">
                {app.logo_url ? (
                  <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{app.name?.charAt(0)}</span>
                )}
              </Link>

              {/* App Info & Founders */}
              <div className="flex-1 flex flex-col min-w-0">
                <Link to={`/app/${app.app_id}`} className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {app.name}
                </Link>
                {/* Founders */}
                {app.founders && app.founders.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-0">
                    {app.founders.map(founder => (
                      <Link 
                        key={founder.id} 
                        to={`/profile/${founder.username}`}
                        className="flex items-center hover:opacity-80 transition-opacity"
                        title={founder.name}
                      >
                        <span className="text-[10px] text-muted-foreground hover:text-primary hover:underline transition-colors whitespace-normal leading-tight">
                          {founder.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Heart Count */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 mt-1">
                <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span className="font-bold tabular-nums">{app.likes_count}</span>
              </span>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center">
            <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {activePeriod === 'week' ? 'Aún no hay votos esta semana' :
               activePeriod === 'month' ? 'Aún no hay votos este mes' :
               'Aún no hay votos'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
