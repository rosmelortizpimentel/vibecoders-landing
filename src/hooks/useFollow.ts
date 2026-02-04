import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseFollowResult {
  isFollowing: boolean;
  isLoading: boolean;
  followersCount: number;
  followingCount: number;
  toggleFollow: () => Promise<void>;
  refetch: () => void;
}

export function useFollow(profileId: string | undefined): UseFollowResult {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchFollowData = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get followers count (people following this profile)
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);
      
      // Get following count (people this profile follows)
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);
      
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      // Check if current user is following this profile
      if (user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileId)
          .maybeSingle();
        
        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, user]);

  // Fetch follow status and counts
  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const toggleFollow = useCallback(async () => {
    if (!user || !profileId) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileId
          });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }, [user, profileId, isFollowing]);

  return {
    isFollowing,
    isLoading,
    followersCount,
    followingCount,
    toggleFollow,
    refetch: fetchFollowData,
  };
}
