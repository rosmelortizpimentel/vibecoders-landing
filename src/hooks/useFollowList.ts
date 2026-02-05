 import { useState, useEffect, useCallback } from 'react';
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
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

   const fetchProfiles = useCallback(async () => {
     // Wait for auth to finish loading before fetching
     if (authLoading) {
       return;
     }
 
     if (!profileId) {
       setLoading(false);
       return;
     }
 
     setLoading(true);
 
     try {
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
 
       if (result.success) {
         setProfiles(result.profiles);
       } else {
         console.error('Error fetching follow list:', result.error);
         setProfiles([]);
       }
     } catch (error) {
       console.error('Error fetching follow list:', error);
       setProfiles([]);
     } finally {
       setLoading(false);
     }
   }, [profileId, type, user, authLoading]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
  };
}
