import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
}

export function useFeatureFlags() {
  const queryClient = useQueryClient();

  const { data: flags, isLoading, error } = useQuery({
    queryKey: ['feature_flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as FeatureFlag[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_flags'] });
    },
  });

  const getFlag = (key: string) => flags?.find(f => f.key === key)?.enabled ?? false;

  return {
    flags,
    isLoading,
    error,
    toggleFlag,
    getFlag,
  };
}
