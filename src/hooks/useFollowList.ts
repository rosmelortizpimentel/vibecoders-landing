 import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface FollowerProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  tagline: string | null;
  isFollowing: boolean;
  activeAppsCount?: number;
}

interface RawFollowerProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  isFollowing: boolean;
  activeAppsCount?: number;
}

interface UseFollowListOptions {
  enabled?: boolean;
}

export function useFollowList(
  profileId: string | undefined,
  type: 'followers' | 'following',
  options: UseFollowListOptions = { enabled: true }
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['follow-list', profileId, type],
    queryFn: async () => {
      if (!profileId) return [];

      const params = new URLSearchParams({
        profileId,
        type,
      });
      
      if (user?.id) {
        params.append('currentUserId', user.id);
      }

      const response = await fetch(
        `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/get-follow-list?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error fetching follow list');
      }

      // Map snake_case to camelCase
      return (result.profiles || []).map((p: RawFollowerProfile) => ({
        id: p.id,
        username: p.username,
        name: p.name,
        avatarUrl: p.avatar_url,
        tagline: p.tagline,
        isFollowing: p.isFollowing,
        activeAppsCount: p.activeAppsCount
      })) as FollowerProfile[];
    },
    enabled: options.enabled && !!profileId,
    staleTime: 30 * 1000, // 30 seconds (connections change more often than statuses)
  });

  return {
    profiles,
    loading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['follow-list', profileId, type] }),
  };
}
