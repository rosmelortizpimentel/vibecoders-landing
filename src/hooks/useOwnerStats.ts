import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OwnerStats {
  followersCount: number;
  followingCount: number;
}

export function useOwnerStats(ownerId: string | undefined) {
  const [stats, setStats] = useState<OwnerStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    try {
      // Count followers (people following this owner)
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', ownerId);

      // Count following (people this owner follows)
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', ownerId);

      if (followersError) console.error('Error fetching followers count:', followersError);
      if (followingError) console.error('Error fetching following count:', followingError);

      setStats({
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
