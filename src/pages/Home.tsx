import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Users, ShieldCheck, Rocket, Loader2, User, AppWindow, Trophy, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFreshDrops } from '@/hooks/useFreshDrops';
import { useTranslation } from '@/hooks/useTranslation';
import { StatsCard } from '@/components/home/StatsCard';
import { PendingTestersPanel } from '@/components/home/PendingTestersPanel';
import { AppHealthPanel } from '@/components/home/AppHealthPanel';
import { FreshDropsCarousel } from '@/components/home/FreshDropsCarousel';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { DashboardSkeleton } from '@/components/home/DashboardSkeleton';
import { UpgradeBanner } from '@/components/home/UpgradeBanner';
import { useSubscription } from '@/hooks/useSubscription';

// Modals
import { TrafficModal } from '@/components/home/modals/TrafficModal';
import { LikesModal } from '@/components/home/modals/LikesModal';
import { NetworkModal } from '@/components/home/modals/NetworkModal';
import { ProfileStrengthModal } from '@/components/home/modals/ProfileStrengthModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const { t: tCommon } = useTranslation('common');
  const { stats, isLoading, acceptTester, rejectTester } = useDashboardStats();
  const { setHeaderContent } = usePageHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{tCommon('navigation.home')}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent, tCommon]);
  const { data: freshDrops = [], isLoading: freshDropsLoading } = useFreshDrops();
  const { isFounder, isFree, founderNumber } = useSubscription();

  // Modal States
  const [isTrafficOpen, setIsTrafficOpen] = useState(false);
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isStrengthOpen, setIsStrengthOpen] = useState(false);

  const handleCompleteProfile = () => {
    navigate('/me');
  };

  // Find Top Performer App
  const appList = stats?.likesByApp ? Object.values(stats.likesByApp).sort((a, b) => b.count - a.count) : [];
  const topApp = appList[0] || null;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 space-y-6 w-full max-w-full overflow-x-hidden sm:p-0 min-w-0 px-0.5 pb-24">
      {/* Upgrade Banner for Free Users */}
      {isFree && <UpgradeBanner />}

      {/* Tu Actividad Section */}
      <section className="w-full">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-2 bg-muted rounded-lg">
            <Activity className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            {t('navigation.activity') || 'Tu Actividad'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full min-w-0">
          {/* Card 1: Profile Views */}
          <StatsCard
            onClick={() => setIsTrafficOpen(true)}
            onDoubleClick={() => setIsTrafficOpen(true)}
            icon={User}
            title={t('stats.profileViews') || 'Profile Views'}
            value={isLoading ? '—' : (stats?.profileViews ?? 0)}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
          />

          {/* Card 2: App Clicks */}
          <StatsCard
            onClick={() => setIsTrafficOpen(true)}
            onDoubleClick={() => setIsTrafficOpen(true)}
            icon={AppWindow}
            title={t('stats.appClicks') || 'App Project Clicks'}
            value={isLoading ? '—' : (stats?.appClicks ?? 0)}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75"
          />

          {/* Card 3: App Likes */}
          <StatsCard
            onClick={() => setIsLikesOpen(true)}
            onDoubleClick={() => setIsLikesOpen(true)}
            icon={Heart}
            title={t('stats.engagement') || 'App Likes'}
            value={isLoading ? '—' : (stats?.totalLikes ?? 0)}
            footer={isLoading ? undefined : (topApp && topApp.count > 0 ? `Top: ${topApp.name}` : undefined)}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100"
          />

          {/* Card 4: Followers */}
          <StatsCard
            onClick={() => setIsNetworkOpen(true)}
            onDoubleClick={() => setIsNetworkOpen(true)}
            icon={Users}
            title={t('stats.followers') || 'Followers'}
            value={isLoading ? '—' : (stats?.followersCount ?? 0)}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150"
          />

          {/* Card 5: Following */}
          <StatsCard
            onClick={() => setIsNetworkOpen(true)}
            onDoubleClick={() => setIsNetworkOpen(true)}
            icon={Users}
            title={t('stats.following') || 'Following'}
            value={isLoading ? '—' : (stats?.followingCount ?? 0)}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200"
          />

          {/* Card 6: Profile Strength */}
          <StatsCard
            onClick={() => setIsStrengthOpen(true)}
            onDoubleClick={() => setIsStrengthOpen(true)}
            icon={ShieldCheck}
            iconVariant={stats?.profileStrength === 100 ? "primary" : "neutral"}
            title={t('stats.identity') || 'Profile Strength'}
            value={isLoading ? '—' : `${Math.round(stats?.profileStrength ?? 0)}%`}
            subtitle={stats?.profileStrength === 100 ? "¡Tu perfil está optimizado!" : undefined}
            progress={stats?.profileStrength ?? 0}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300",
              stats?.profileStrength === 100 && "border-primary/30 ring-1 ring-primary/5 shadow-sm"
            )}
          />
        </div>
      </section>

      {/* Action Center - 2 Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
        {/* ... action center content ... */}
      </section>

      {/* Fresh Drops Carousel - Moved to Bottom */}
      <section className="pt-2 w-full max-w-full min-w-0 overflow-hidden pb-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-2 bg-muted rounded-lg">
            <Rocket className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            {t('freshDrops.title') || 'Nuevas Apps'}
          </h2>
        </div>
        
        {freshDropsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <ShowcaseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <FreshDropsCarousel apps={freshDrops} />
        )}
      </section>

      {/* Detail Modals */}
      <TrafficModal 
        isOpen={isTrafficOpen}
        onClose={() => setIsTrafficOpen(false)}
        profileViews={stats?.profileViews ?? 0}
        appClicks={stats?.appClicks ?? 0}
        clicksByApp={stats?.clicksByApp ?? {}}
      />

      <LikesModal 
        isOpen={isLikesOpen}
        onClose={() => setIsLikesOpen(false)}
        likesByApp={stats?.likesByApp ?? {}}
      />

      <NetworkModal 
        isOpen={isNetworkOpen}
        onClose={() => setIsNetworkOpen(false)}
        followers={stats?.followers ?? []}
        following={stats?.following ?? []}
      />

      <ProfileStrengthModal
        isOpen={isStrengthOpen}
        onClose={() => setIsStrengthOpen(false)}
        strength={stats?.profileStrength ?? 0}
      />
    </div>
  );
}
