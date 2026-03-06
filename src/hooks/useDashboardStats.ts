import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfileCompletion } from './useProfileCompletion';
import { useUserApps } from './useUserApps';

interface DashboardStats {
  // Traffic
  profileViews: number;
  appClicks: number;
  totalViews: number;
  
  // Engagement
  totalLikes: number;
  
  // Community
  followersCount: number;
  followingCount: number;
  
  // Identity
  profileStrength: number;
  profileChecklist: { key: string; label: string; completed: boolean }[];
  
  // Pending Testers
  pendingTesters: PendingTester[];
  
  // App Health
  appHealth: AppHealthItem[];

  // Detailed breakdowns
  clicksByApp: Record<string, { name: string, count: number }>;
  likesByApp: Record<string, { name: string, count: number }>;
  followers: ProfileSummary[];
  following: ProfileSummary[];
  community: ProfileSummary[];
}

interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  activeAppsCount?: number;
  mutualConnectionsCount?: number;
  isFollowing?: boolean;
  tagline?: string;
}

interface PendingTester {
  id: string;
  userId: string;
  appId: string;
  appName: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

interface AppHealthItem {
  id: string;
  name: string;
  logoUrl?: string;
  bugCount: number;
  featureCount: number;
}

interface FollowsResponse {
  profiles: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    tagline: string | null;
    apps: { count: number }[];
  };
}

export function useDashboardStats() {
  const { user } = useAuth();
  const profileCompletion = useProfileCompletion();
  const { data: userApps = [], isLoading: appsLoading } = useUserApps();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch profile stats (views, clicks, likes)
      const { data: profileStats } = await supabase.functions.invoke('get-profile-stats');
      
      // Fetch followers/following counts
      const [followersCountRes, followingCountRes] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id),
      ]);

      const followersCount = followersCountRes.count || 0;
      const followingCount = followingCountRes.count || 0;

      // Fetch community profiles (users to discover)
      // Note: We don't exclude 'following' anymore here because we don't have the list.
      // We can either fetch the following IDs or just accept a bit of overlap in the "Community" tab
      // until the user actually follows them.
      const { data: communityData } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, banner_url, tagline, apps(count), app_founders(count)')
        .not('id', 'eq', user.id)
        .not('username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      const community: ProfileSummary[] = (communityData || []).map((p: {
        id: string;
        name: string | null;
        username: string | null;
        avatar_url: string | null;
        banner_url: string | null;
        tagline: string | null;
        apps?: { count: number }[];
        app_founders?: { count: number }[];
      }) => ({
        id: p.id,
        name: p.name || 'User',
        username: p.username || 'unknown',
        avatarUrl: p.avatar_url || undefined,
        bannerUrl: p.banner_url || undefined,
        tagline: p.tagline || undefined,
        activeAppsCount: (p.apps?.[0]?.count || 0) + (p.app_founders?.[0]?.count || 0),
        isFollowing: false,
      }));

      // Fetch user's apps (Already handled by useUserApps hook - we use the data from there)
      const appIds = userApps.map(app => app.id);

      // Fetch pending testers for all user's apps
      let pendingTesters: PendingTester[] = [];
      if (appIds.length > 0) {
        const { data: testersData } = await supabase
          .from('beta_testers')
          .select(`
            id,
            user_id,
            app_id,
            joined_at,
            apps!beta_testers_app_id_fkey(name),
            profiles!beta_testers_user_id_fkey(name, username, avatar_url)
          `)
          .in('app_id', appIds)
          .eq('status', 'pending')
          .order('joined_at', { ascending: false })
          .limit(5);

        interface TesterData {
          id: string;
          user_id: string;
          app_id: string;
          joined_at: string;
          apps: { name: string } | null;
          profiles: { name: string | null; username: string | null; avatar_url: string | null } | null;
        }

        pendingTesters = ((testersData as unknown as TesterData[]) || []).map((t) => ({
          id: t.id,
          userId: t.user_id,
          appId: t.app_id,
          appName: t.apps?.name || 'Unknown App',
          userName: t.profiles?.name || t.profiles?.username || 'Unknown User',
          userAvatar: t.profiles?.avatar_url || undefined,
          createdAt: t.joined_at,
        }));
      }

      // Fetch feedback counts per app
      let appHealth: AppHealthItem[] = [];
      if (appIds.length > 0) {
        const { data: feedbackData } = await supabase
          .from('beta_feedback')
          .select('app_id, type')
          .in('app_id', appIds)
          .eq('status', 'open');

        // Aggregate feedback by app
        interface FeedbackItem { app_id: string; type: string }
        const feedbackByApp = (feedbackData as FeedbackItem[] || []).reduce((acc: Record<string, { bugs: number; features: number }>, f) => {
          if (!acc[f.app_id]) acc[f.app_id] = { bugs: 0, features: 0 };
          if (f.type === 'bug') acc[f.app_id].bugs++;
          if (f.type === 'feature') acc[f.app_id].features++;
          return acc;
        }, {});

        appHealth = (userApps || [])
          .map(app => ({
            id: app.id,
            name: app.name || 'Unnamed App',
            logoUrl: app.logo_url,
            bugCount: feedbackByApp[app.id]?.bugs || 0,
            featureCount: feedbackByApp[app.id]?.features || 0,
          }))
          .filter(app => app.bugCount > 0 || app.featureCount > 0);
      }

      // Calculate total likes
      const likesObject = (profileStats?.app_likes || {}) as Record<string, number>;
      const totalLikes = Object.values(likesObject).reduce(
        (sum, likes) => sum + (likes || 0),
        0
      );

      // Build detailed maps for clicks and likes
      const clicksByApp: Record<string, { name: string, count: number }> = {};
      const likesByApp: Record<string, { name: string, count: number }> = {};
      
      const appClicksMap = (profileStats?.app_clicks_by_app || {}) as Record<string, number>;
      const appLikesMap = (profileStats?.app_likes || {}) as Record<string, number>;

      (userApps || []).forEach(app => {
        clicksByApp[app.id] = {
          name: app.name || 'Unnamed App',
          count: appClicksMap[app.id] || 0
        };
        likesByApp[app.id] = {
          name: app.name || 'Unnamed App',
          count: appLikesMap[app.id] || 0
        };
      });

      setStats({
        profileViews: profileStats?.profile_views || 0,
        appClicks: profileStats?.app_clicks || 0,
        totalViews: (profileStats?.profile_views || 0) + (profileStats?.app_clicks || 0),
        totalLikes,
        followersCount,
        followingCount,
        followers: [], // Now fetched on-demand via useFollowList
        following: [], // Now fetched on-demand via useFollowList
        community,
        clicksByApp,
        likesByApp,
        profileStrength: 0, // Will be set from profileCompletion
        profileChecklist: [],
        pendingTesters,
        appHealth,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Fetch stats once when user is available
  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, fetchStats]);

  // Combine stats with profileCompletion (separate to avoid infinite loops)
  const combinedStats = stats ? {
    ...stats,
    profileStrength: profileCompletion.percentage,
    profileChecklist: profileCompletion.checklist,
  } : null;


  const acceptTester = useCallback(async (testerId: string) => {
    const { error } = await supabase
      .from('beta_testers')
      .update({ status: 'accepted' })
      .eq('id', testerId);

    if (!error) {
      setStats(prev => prev ? {
        ...prev,
        pendingTesters: prev.pendingTesters.filter(t => t.id !== testerId),
      } : null);
    }
    return !error;
  }, []);

  const rejectTester = useCallback(async (testerId: string) => {
    const { error } = await supabase
      .from('beta_testers')
      .update({ status: 'rejected' })
      .eq('id', testerId);

    if (!error) {
      setStats(prev => prev ? {
        ...prev,
        pendingTesters: prev.pendingTesters.filter(t => t.id !== testerId),
      } : null);
    }
    return !error;
  }, []);

  return {
    stats: combinedStats,
    isLoading: isLoading || profileCompletion.loading || appsLoading,
    refetch: fetchStats,
    acceptTester,
    rejectTester,
  };
}
