import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Users, ShieldCheck, Rocket, Loader2, User, AppWindow, Trophy } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFreshDrops } from '@/hooks/useFreshDrops';
import { useTranslation } from '@/hooks/useTranslation';
import { StatsCard } from '@/components/home/StatsCard';
import { PendingTestersPanel } from '@/components/home/PendingTestersPanel';
import { AppHealthPanel } from '@/components/home/AppHealthPanel';
import { FreshDropsCarousel } from '@/components/home/FreshDropsCarousel';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { DashboardSkeleton } from '@/components/home/DashboardSkeleton';
import { FounderWelcome } from '@/components/home/FounderWelcome';
import { UpgradeBanner } from '@/components/home/UpgradeBanner';
import { useSubscription } from '@/hooks/useSubscription';

// Modals
import { TrafficModal } from '@/components/home/modals/TrafficModal';
import { LikesModal } from '@/components/home/modals/LikesModal';
import { NetworkModal } from '@/components/home/modals/NetworkModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation('home');
  const { stats, isLoading, acceptTester, rejectTester } = useDashboardStats();
  const { data: freshDrops = [], isLoading: freshDropsLoading } = useFreshDrops();
  const { isFounder, isFree, founderNumber, founderWelcomeSeen } = useSubscription();
  const queryClient = useQueryClient();

  // Modal States
  const [isTrafficOpen, setIsTrafficOpen] = useState(false);
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

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
      {/* Founder Welcome Popup */}
      {isFounder && founderNumber && (
        <FounderWelcome
          founderNumber={founderNumber}
          open={!founderWelcomeSeen}
          onDismiss={() => queryClient.invalidateQueries({ queryKey: ['subscription'] })}
        />
      )}

      {/* Upgrade Banner for Free Users */}
      {isFree && <UpgradeBanner />}

      {/* Fresh Drops Carousel - Moved to Top */}
      <section className="pt-2 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-2 bg-muted rounded-lg">
            <Rocket className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            {t.freshDrops?.title || 'Fresh out of the oven'}
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

      {/* Stats Row - 4 Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full min-w-0">
        {/* Card A: Traffic (Vistas) */}
        <StatsCard
          onClick={() => setIsTrafficOpen(true)}
          rows={[
            { icon: User, label: t.stats?.profileViews || 'Profile Views', value: isLoading ? '—' : (stats?.profileViews ?? 0) },
            { icon: AppWindow, label: t.stats?.appClicks || 'App Project Clicks', value: isLoading ? '—' : (stats?.appClicks ?? 0) }
          ]}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500"
        />

        {/* Card B: Engagement (Likes) */}
        <StatsCard
          onClick={() => setIsLikesOpen(true)}
          headline={topApp && topApp.count > 0 ? {
            icon: Trophy,
            label: 'Top App',
            highlight: topApp.name
          } : undefined}
          icon={Heart}
          title={t.stats?.engagement || 'App Likes'}
          value={isLoading ? '—' : (topApp?.count ?? 0)}
          footer={isLoading ? undefined : `Total likes: ${stats?.totalLikes ?? 0}`}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75"
        />

        {/* Card C: Community (Seguidores) */}
        <StatsCard
          onClick={() => setIsNetworkOpen(true)}
          split={{
            left: { value: isLoading ? '—' : (stats?.followersCount ?? 0), label: t.stats?.followers || 'Followers' },
            right: { value: isLoading ? '—' : (stats?.followingCount ?? 0), label: t.stats?.following || 'Following' }
          }}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150"
        />

        {/* Card D: Identity / Profile Strength */}
        <StatsCard
          icon={ShieldCheck}
          title={t.stats?.identity || 'Profile Strength'}
          value={isLoading ? '—' : `${Math.round(stats?.profileStrength ?? 0)}%`}
          progress={stats?.profileStrength ?? 0}
          action={
            (stats?.profileStrength ?? 0) < 100
              ? {
                  label: t.stats?.completeProfile || 'Complete Profile',
                  onClick: handleCompleteProfile,
                }
              : undefined
          }
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200"
        />
      </section>

      {/* Action Center - 2 Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
        {/* Pending Testers Panel (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <PendingTestersPanel
            testers={stats?.pendingTesters || []}
            onAccept={acceptTester}
            onReject={rejectTester}
            isLoading={isLoading}
          />
        </div>

        {/* App Health Panel (1/3 width on desktop) */}
        <div className="lg:col-span-1">
          <AppHealthPanel
            apps={stats?.appHealth || []}
            isLoading={isLoading}
          />
        </div>
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
    </div>
  );
}
