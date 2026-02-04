import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseFollowActionResult {
  follow: (targetUserId: string) => Promise<boolean>;
  unfollow: (targetUserId: string) => Promise<boolean>;
  isProcessing: boolean;
}

export function useFollowAction(): UseFollowActionResult {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

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
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

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
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return {
    follow,
    unfollow,
    isProcessing,
  };
}
