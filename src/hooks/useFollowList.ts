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
    queryKey: ['follow-list', profileId, type, user?.id],
    queryFn: async () => {
      if (!profileId) return [];
      
      const queryParams = new URLSearchParams({
        profileId,
        type,
      });
      if (user?.id) queryParams.append('currentUserId', user.id);

      const { data, error } = await supabase.functions.invoke(`get-follow-list?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error fetching follow list');
      }

      // Map snake_case to camelCase
      return (data.profiles || []).map((p: RawFollowerProfile) => ({
        id: p.id,
        username: p.username,
        name: p.name,
        avatarUrl: p.avatar_url,
        tagline: p.tagline,
        isFollowing: type === 'following' ? true : !!p.isFollowing,
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
    refetch: () => queryClient.invalidateQueries({ queryKey: ['follow-list', profileId, type, user?.id] }),
  };
}
