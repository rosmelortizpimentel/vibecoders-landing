import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserTier = 'founder' | 'free' | 'pro' | 'pending';

export interface FounderStatusResponse {
  tier: UserTier;
  founderNumber: number | null;
  needsPlanSelection: boolean;
  accessClosed?: boolean;
}

export function useFounderStatus() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['founder-status', user?.id],
    queryFn: async (): Promise<FounderStatusResponse> => {
      const { data, error } = await supabase.functions.invoke('check-founder-status');
      if (error) throw error;
      return data as FounderStatusResponse;
    },
    enabled: !!user?.id,
    staleTime: 0, // No persistent cache, only deduplication of concurrent requests
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
