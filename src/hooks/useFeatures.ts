import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFeatures() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-features', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_user_features', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching features:', error);
        return [];
      }
      
      return (data as string[]) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHasFeature(featureKey: string) {
  const { data: features, isLoading } = useFeatures();
  
  return {
    hasFeature: features?.includes(featureKey) ?? false,
    isLoading
  };
}
