import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { BetaSquadApp, BetaTester, UserTesterStatus } from './useBetaSquadsPublic';

export function useMyBetaSquads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-beta-squads', user?.id],
    queryFn: async (): Promise<BetaSquadApp[]> => {
      if (!user) return [];

      // 1. Get apps where current user is a tester
      const { data: testerMemberships, error: membershipError } = await supabase
        .from('beta_testers')
        .select(`
          id,
          status,
          app:apps (
            id, name, logo_url, tagline, beta_instructions, beta_limit, updated_at,
            profiles:user_id (id, username, name, avatar_url)
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;
      if (!testerMemberships || testerMemberships.length === 0) return [];

      const appIds = testerMemberships
        .filter(m => m.app)
        .map(m => (m.app as any).id);

      // 2. Get all testers for these apps to calculate spots and counts
      const { data: allTesters, error: testersError } = await supabase
        .from('beta_testers')
        .select(`
          app_id,
          profiles:user_id (id, username, name, avatar_url, tagline)
        `)
        .eq('status', 'accepted')
        .in('app_id', appIds);

      if (testersError) throw testersError;

      // 3. Process data same as useBetaSquadsPublic
      const testersByApp: Record<string, BetaTester[]> = {};
      const countsByApp: Record<string, number> = {};

      allTesters?.forEach(t => {
        const profile = t.profiles as any;
        if (!profile) return;

        if (!testersByApp[t.app_id]) {
          testersByApp[t.app_id] = [];
        }
        testersByApp[t.app_id].push({
          id: profile.id,
          username: profile.username,
          name: profile.name,
          avatar_url: profile.avatar_url,
          tagline: profile.tagline,
        });
        countsByApp[t.app_id] = (countsByApp[t.app_id] || 0) + 1;
      });

      return testerMemberships
        .filter(membership => membership.app)
        .map(membership => {
          const app = membership.app as any;
          const ownerProfile = app.profiles as any;
          const testersCount = countsByApp[app.id] || 0;

        return {
          id: app.id,
          name: app.name,
          logo_url: app.logo_url,
          tagline: app.tagline,
          beta_instructions: app.beta_instructions,
          beta_limit: app.beta_limit,
          testers_count: testersCount,
          spots_remaining: app.beta_limit - testersCount,
          updated_at: app.updated_at,
          owner: {
            id: ownerProfile?.id || '',
            username: ownerProfile?.username || null,
            name: ownerProfile?.name || null,
            avatar_url: ownerProfile?.avatar_url || null,
          },
          testers: testersByApp[app.id] || [],
          user_tester_status: {
            id: membership.id,
            status: membership.status as 'pending' | 'accepted' | 'rejected',
          },
        };
      });
    },
    enabled: !!user,
  });
}
