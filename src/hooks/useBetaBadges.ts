import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useBetaBadges() {
  const { user } = useAuth();
  const [ownedAppsCount, setOwnedAppsCount] = useState(0);
  const [publicSquadsCount, setPublicSquadsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOwnedAppsCount(0);
      setPublicSquadsCount(0);
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        // Fetch count of owned apps with beta_active = true
        const { count: ownedCount } = await supabase
          .from('apps')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('beta_active', true);

        setOwnedAppsCount(ownedCount || 0);

        // Fetch count of public beta squads with available spots
        const { data: publicBetas } = await supabase
          .from('apps')
          .select('id, beta_limit')
          .eq('beta_active', true);

        if (publicBetas) {
          // For each beta, check if there are available spots
          const countsPromises = publicBetas.map(async (app) => {
            const { count } = await supabase
              .from('beta_testers')
              .select('id', { count: 'exact', head: true })
              .eq('app_id', app.id)
              .eq('status', 'accepted');

            const currentCount = count || 0;
            return currentCount < app.beta_limit ? 1 : 0;
          });

          const counts = await Promise.all(countsPromises);
          const totalWithSpots = counts.reduce((sum, val) => sum + val, 0);
          setPublicSquadsCount(totalWithSpots);
        } else {
          setPublicSquadsCount(0);
        }
      } catch (error) {
        console.error('Error fetching beta badges:', error);
        setOwnedAppsCount(0);
        setPublicSquadsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // Subscribe to changes in apps and beta_testers
    const appsChannel = supabase
      .channel('beta-badges-apps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, fetchCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beta_testers' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(appsChannel);
    };
  }, [user]);

  return { ownedAppsCount, publicSquadsCount, loading };
}
