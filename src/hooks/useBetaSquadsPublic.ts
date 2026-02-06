import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BetaTester {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
}

export interface BetaSquadApp {
  id: string;
  name: string | null;
  logo_url: string | null;
  tagline: string | null;
  beta_instructions: string | null;
  beta_limit: number;
  testers_count: number;
  spots_remaining: number;
  updated_at: string;
  owner: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  testers: BetaTester[];
}

interface BetaSquadsPage {
  apps: BetaSquadApp[];
  nextPage: number | undefined;
}

const PAGE_SIZE = 10;

export function useBetaSquadsPublic() {
  return useInfiniteQuery({
    queryKey: ['beta-squads-public'],
    queryFn: async ({ pageParam = 0 }): Promise<BetaSquadsPage> => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // 1. Get apps with beta_active = true, paginated
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select(`
          id, name, logo_url, tagline, beta_instructions, beta_limit, updated_at,
          profiles:user_id (id, username, name, avatar_url)
        `)
        .eq('beta_active', true)
        .eq('is_visible', true)
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (appsError) throw appsError;
      if (!apps || apps.length === 0) {
        return { apps: [], nextPage: undefined };
      }

      // 2. Get testers (accepted) for these apps with their profiles
      const appIds = apps.map(a => a.id);
      const { data: testersData, error: testersError } = await supabase
        .from('beta_testers')
        .select(`
          app_id,
          profiles:user_id (id, username, name, avatar_url, tagline)
        `)
        .eq('status', 'accepted')
        .in('app_id', appIds);

      if (testersError) throw testersError;

      // 3. Group testers by app_id
      const testersByApp: Record<string, BetaTester[]> = {};
      const countsByApp: Record<string, number> = {};

      testersData?.forEach(t => {
        const profile = t.profiles as { id: string; username: string | null; name: string | null; avatar_url: string | null; tagline: string | null } | null;
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

      // 4. Map apps with all data
      const appsWithData: BetaSquadApp[] = apps.map(app => {
        const testersCount = countsByApp[app.id] || 0;
        const profile = app.profiles as { id: string; username: string | null; name: string | null; avatar_url: string | null } | null;
        
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
            id: profile?.id || '',
            username: profile?.username || null,
            name: profile?.name || null,
            avatar_url: profile?.avatar_url || null,
          },
          testers: testersByApp[app.id] || [],
        };
      });

      return {
        apps: appsWithData,
        nextPage: apps.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
