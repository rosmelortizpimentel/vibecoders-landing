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

      const { data, error } = await supabase
        .from('apps')
        .select('id, name, logo_url, beta_active')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user apps:', error);
        throw error;
      }

      return (data || []) as UserApp[];
    },
    enabled: !!user?.id,
    staleTime: 0, // Deduplication only, as requested
    gcTime: 0,
  });
}
