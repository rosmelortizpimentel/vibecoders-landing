import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserApp {
  id: string;
  name: string;
  logo_url: string | null;
  beta_active: boolean;
}

export function useUserApps() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-apps', user?.id],
    queryFn: async (): Promise<UserApp[]> => {
      if (!user?.id) return [];

      // Get apps where user is owner
      const { data: ownedApps, error: ownedError } = await supabase
        .from('apps')
        .select('id, name, logo_url, beta_active')
        .eq('user_id', user.id);

      if (ownedError) {
        console.error('Error fetching owned apps:', ownedError);
        throw ownedError;
      }

      // Get apps where user is co-founder
      const { data: foundedApps, error: founderError } = await supabase
        .from('app_founders')
        .select('app:apps(id, name, logo_url, beta_active)')
        .eq('user_id', user.id);

      if (founderError) {
        console.error('Error fetching co-founded apps:', founderError);
        throw founderError;
      }

      const coFoundedApps = (foundedApps || [])
        .map(f => f.app)
        .filter((app): app is UserApp => app !== null);
      
      // Combine and filter duplicates (though unique constraint should prevent them)
      const allApps = [...(ownedApps || []), ...coFoundedApps];
      const uniqueApps = allApps.filter((app, index, self) =>
        index === self.findIndex((t) => t.id === app.id)
      );

      return uniqueApps as UserApp[];
    },
    enabled: !!user?.id,
    staleTime: 0, // Deduplication only, as requested
    gcTime: 0,
  });
}
