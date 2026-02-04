import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FollowerProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  isFollowing: boolean;
}

interface UseFollowListResult {
  profiles: FollowerProfile[];
  loading: boolean;
  refetch: () => void;
}

export function useFollowList(
  profileId: string | undefined,
  type: 'followers' | 'following'
): UseFollowListResult {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get the list of user IDs based on type
      let userIds: string[] = [];

      if (type === 'followers') {
        // Get people who follow this profile (follower_id are the ones following)
        const { data: followsData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', profileId);

        userIds = followsData?.map(f => f.follower_id) || [];
      } else {
        // Get people this profile follows (following_id are the ones being followed)
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profileId);

        userIds = followsData?.map(f => f.following_id) || [];
      }

      if (userIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these user IDs
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url, tagline')
        .in('id', userIds);

      if (!profilesData) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Check which ones the current user is following
      let currentUserFollowing: string[] = [];
      if (user) {
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        currentUserFollowing = followingData?.map(f => f.following_id) || [];
      }

      // Build the final profiles list
      const enrichedProfiles: FollowerProfile[] = profilesData.map(p => ({
        id: p.id,
        username: p.username,
        name: p.name,
        avatar_url: p.avatar_url,
        tagline: p.tagline,
        isFollowing: currentUserFollowing.includes(p.id),
      }));

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error fetching follow list:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [profileId, type, user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
  };
}
