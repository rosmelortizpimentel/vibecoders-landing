import { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { PublicApp } from '@/hooks/usePublicApps';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppDirectoryCardProps {
  app: PublicApp;
  likeCount: number;
  isLiked: boolean;
  isAuthenticated: boolean;
  onLikeToggled: () => void;
  showBetaBadge?: boolean;
  showPartnershipBadge?: boolean;
}

export function AppDirectoryCard({ 
  app, 
  likeCount, 
  isLiked, 
  isAuthenticated, 
  onLikeToggled,
  showBetaBadge = true,
  showPartnershipBadge = true
}: AppDirectoryCardProps) {
  const { t: tPartner } = useTranslation('partnerships');
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  const displayLiked = optimisticLiked ?? isLiked;
  const displayCount = optimisticCount ?? likeCount;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      localStorage.setItem('pendingLike', app.id);
      navigate('/choose-plan');
      return;
    }
    if (toggling) return;

    // Optimistic update
    setOptimisticLiked(!displayLiked);
    setOptimisticCount(displayLiked ? displayCount - 1 : displayCount + 1);
    setToggling(true);

    try {
      const { error } = await supabase.functions.invoke('toggle-app-like', {
        body: { app_id: app.id },
      });
      if (!error) {
        onLikeToggled(); // Invalidate batch query to refresh real data
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic on error
      setOptimisticLiked(null);
      setOptimisticCount(null);
    } finally {
      setToggling(false);
      // Clear optimistic state after batch refetch kicks in
      setTimeout(() => {
        setOptimisticLiked(null);
        setOptimisticCount(null);
      }, 1500);
    }
  };

  // Safely extract and deduplicate founders
  const founders = Array.from(new Map(
    [
      ...(app.owner ? [app.owner] : []),
      ...(app.app_founders || []).flatMap(f => {
        // Handle cases where profile might be an array or single object
        const p = f.profile || (f as Record<string, unknown>).profiles;
        if (Array.isArray(p)) return p;
        if (p) return [p];
        return [];
      })
    ]
    .filter(Boolean)
    .map(p => [(p as { id: string }).id, p])
  ).values());

  return (
    <article className="group flex items-start gap-4 py-5 px-4 border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors duration-150 cursor-pointer rounded-lg"
      onClick={() => navigate(`/app/${app.id}`)}
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 p-1.5">
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || ''} className="w-full h-full object-contain" />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">{app.name?.charAt(0) || 'A'}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name + Status Badge */}
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <h3 className="text-base font-bold text-[#1C1C1C] truncate transition-colors">
            {app.name}
          </h3>
          {app.is_verified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1C1C1C] text-white shrink-0">
                    <Check className="w-2 h-2 stroke-[4]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] px-2 py-1">
                  App Verificada por VibeCoders
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {app.status && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border"
              style={{
                color: app.status.slug === 'live' ? '#68CF94' : app.status.slug === 'building' ? '#854d0e' : app.status.color,
                backgroundColor: app.status.slug === 'live' ? '#68CF9426' : app.status.slug === 'building' ? '#FFD90026' : `${app.status.color}15`,
                borderColor: app.status.slug === 'live' ? '#68CF9440' : app.status.slug === 'building' ? '#FFD90040' : `${app.status.color}30`,
              }}
            >
              {app.status.name}
            </span>
          )}
        </div>

        {/* Tagline — always full, up to 2 lines */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{app.tagline}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {app.category && (
            <span className="px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#1C1C1C]/60 text-[10px] font-bold uppercase tracking-wider border border-border/50">
              {app.category.name}
            </span>
          )}
          {app.beta_active && showBetaBadge && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              Open for Testing
            </span>
          )}
          {app.open_to_partnerships && showPartnershipBadge && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
              Partnerships
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          {founders.map(founder => (
            <Link
              key={founder.id}
              to={`/@${founder.username || founder.id}`}
              className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-5 w-5 border border-border shadow-sm">
                <AvatarImage src={founder.avatar_url || undefined} alt={founder.name || ''} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[8px] font-medium">
                  {(founder.name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium whitespace-normal leading-tight">
                {founder.name || founder.username}
              </span>
            </Link>
          ))}

          {app.open_to_partnerships && app.partnership_types?.map((type) => (
            <span 
              key={type} 
              className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100 uppercase whitespace-nowrap"
            >
              Busco {tPartner(`types.${type}`)}
            </span>
          ))}
        </div>
      </div>

      {/* Heart Button — compact inline */}
      <button
        onClick={handleLike}
        disabled={toggling}
        className={cn(
          "flex items-center gap-1 shrink-0 px-2 py-1 rounded-full transition-colors duration-200 ease-in-out self-center",
          displayLiked
            ? "text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-500/10"
            : "text-[#D1D5DB] hover:text-[#EF4444] hover:bg-muted/50"
        )}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all duration-200 ease-in-out",
            displayLiked ? "fill-[#EF4444] text-[#EF4444]" : ""
          )}
        />
        <span className={cn(
          "text-xs font-bold tabular-nums",
          displayLiked ? "text-[#EF4444]" : "text-[#9CA3AF]"
        )}>
          {displayCount}
        </span>
      </button>
    </article>
  );
}
