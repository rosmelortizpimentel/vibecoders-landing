import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface UseFollowActionResult {
  follow: (targetUserId: string) => Promise<boolean>;
  unfollow: (targetUserId: string) => Promise<boolean>;
  isProcessing: boolean;
}

export function useFollowAction(): UseFollowActionResult {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const follow = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) {
        console.error('Error following user:', error);
        return false;
      }

      // Invalidate relevant queries to keep UI in sync
      queryClient.invalidateQueries({ queryKey: ['follow-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient]);

  const unfollow = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) {
        console.error('Error unfollowing user:', error);
        return false;
      }

      // Invalidate relevant queries to keep UI in sync
      queryClient.invalidateQueries({ queryKey: ['follow-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient]);

  return {
    follow,
    unfollow,
    isProcessing,
  };
}
