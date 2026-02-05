 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 
 interface ProfileStats {
   profileViews: number;
   appClicks: number;
   appLikes: Record<string, number>;
 }
 
 export function useProfileStats(profileId: string | null) {
   const { user } = useAuth();
   const [stats, setStats] = useState<ProfileStats | null>(null);
   const [isLoading, setIsLoading] = useState(false);
 
   const isOwnProfile = user?.id === profileId;
 
   const fetchStats = useCallback(async () => {
     if (!isOwnProfile || !profileId) {
       setStats(null);
       return;
     }
 
     setIsLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke('get-profile-stats');
 
       if (error) {
         console.error('Error fetching profile stats:', error);
         return;
       }
 
       setStats({
         profileViews: data.profile_views || 0,
         appClicks: data.app_clicks || 0,
         appLikes: data.app_likes || {},
       });
     } catch (error) {
       console.error('Error fetching profile stats:', error);
     } finally {
       setIsLoading(false);
     }
   }, [isOwnProfile, profileId]);
 
   useEffect(() => {
     fetchStats();
   }, [fetchStats]);
 
   return { stats, isLoading, isOwnProfile, refetch: fetchStats };
 }