import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export function useBetaBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['beta-badges', user?.id],
    queryFn: async () => {
      if (!user) return { ownedAppsCount: 0, publicSquadsCount: 0 };

      // 1. Fetch all active beta apps
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select('id, user_id, beta_limit')
        .eq('beta_active', true);

      if (appsError) throw appsError;
      if (!apps || apps.length === 0) return { ownedAppsCount: 0, publicSquadsCount: 0 };

      // 2. Fetch all accepted testers for these apps in ONE call
      const appIds = apps.map(app => app.id);
      const { data: testers, error: testersError } = await supabase
        .from('beta_testers')
        .select('app_id')
        .eq('status', 'accepted')
        .in('app_id', appIds);

      if (testersError) throw testersError;

      // 3. Calculate counts in memory (solves N+1)
      const testerCountsByApp: Record<string, number> = {};
      testers?.forEach(t => {
        testerCountsByApp[t.app_id] = (testerCountsByApp[t.app_id] || 0) + 1;
      });

      let ownedAppsCount = 0;
      let totalWithSpots = 0;

      apps.forEach(app => {
        // Count owned apps
        if (app.user_id === user.id) {
          ownedAppsCount++;
        }

        // Count apps with available spots
        const currentCount = testerCountsByApp[app.id] || 0;
        if (currentCount < app.beta_limit) {
          totalWithSpots++;
        }
      });

      return {
        ownedAppsCount,
        publicSquadsCount: totalWithSpots
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Realtime subscription with debouncing/query invalidation
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('beta-badges-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, () => {
        queryClient.invalidateQueries({ queryKey: ['beta-badges', user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beta_testers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['beta-badges', user.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    ownedAppsCount: data?.ownedAppsCount || 0,
    publicSquadsCount: data?.publicSquadsCount || 0,
    loading: isLoading
  };
}
