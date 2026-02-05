 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 
 export function useAppLike(appId: string) {
   const { user } = useAuth();
   const [isLiked, setIsLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(0);
   const [isLoading, setIsLoading] = useState(false);
 
   // Check if user has liked this app
   const checkLikeStatus = useCallback(async () => {
     if (!user || !appId) return;
 
     try {
       const { data } = await supabase
         .from('app_likes')
         .select('id')
         .eq('app_id', appId)
         .eq('user_id', user.id)
         .single();
 
       setIsLiked(!!data);
     } catch {
       setIsLiked(false);
     }
   }, [user, appId]);
 
   // Get total like count for this app
   const fetchLikeCount = useCallback(async () => {
     if (!appId) return;
 
     try {
       const { count } = await supabase
         .from('app_likes')
         .select('*', { count: 'exact', head: true })
         .eq('app_id', appId);
 
       setLikeCount(count || 0);
     } catch {
       setLikeCount(0);
     }
   }, [appId]);
 
   useEffect(() => {
     checkLikeStatus();
     fetchLikeCount();
   }, [checkLikeStatus, fetchLikeCount]);
 
   const toggleLike = async () => {
     if (!user || isLoading) return;
 
     setIsLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke('toggle-app-like', {
         body: { app_id: appId },
       });
 
       if (error) {
         console.error('Error toggling like:', error);
         return;
       }
 
       setIsLiked(data.liked);
       setLikeCount(data.count);
     } catch (error) {
       console.error('Error toggling like:', error);
     } finally {
       setIsLoading(false);
     }
   };
 
   return { isLiked, likeCount, isLoading, toggleLike, isAuthenticated: !!user };
 }