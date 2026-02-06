import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BetaSquadApp {
  id: string;
  name: string | null;
  logo_url: string | null;
  tagline: string | null;
  beta_instructions: string | null;
  beta_limit: number;
  testers_count: number;
  spots_remaining: number;
  owner: {
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

export function useBetaSquadsPublic() {
  return useQuery({
    queryKey: ['beta-squads-public'],
    queryFn: async (): Promise<BetaSquadApp[]> => {
      // 1. Get apps with beta_active = true
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select(`
          id, name, logo_url, tagline, beta_instructions, beta_limit, created_at,
          profiles:user_id (username, name, avatar_url)
        `)
        .eq('beta_active', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      if (!apps || apps.length === 0) return [];

      // 2. Get testers count per app
      const appIds = apps.map(a => a.id);
      const { data: testerData, error: testerError } = await supabase
        .from('beta_testers')
        .select('app_id')
        .eq('status', 'accepted')
        .in('app_id', appIds);

      if (testerError) throw testerError;

      // 3. Calculate counts per app
      const countsByApp: Record<string, number> = {};
      testerData?.forEach(t => {
        countsByApp[t.app_id] = (countsByApp[t.app_id] || 0) + 1;
      });

      // 4. Merge and calculate spots remaining
      const appsWithCounts: BetaSquadApp[] = apps.map(app => {
        const testersCount = countsByApp[app.id] || 0;
        const profile = app.profiles as { username: string | null; name: string | null; avatar_url: string | null } | null;
        
        return {
          id: app.id,
          name: app.name,
          logo_url: app.logo_url,
          tagline: app.tagline,
          beta_instructions: app.beta_instructions,
          beta_limit: app.beta_limit,
          testers_count: testersCount,
          spots_remaining: app.beta_limit - testersCount,
          owner: {
            username: profile?.username || null,
            name: profile?.name || null,
            avatar_url: profile?.avatar_url || null,
          }
        };
      });

      // 5. Sort by spots available (ascending = urgency first)
      appsWithCounts.sort((a, b) => a.spots_remaining - b.spots_remaining);

      return appsWithCounts;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
