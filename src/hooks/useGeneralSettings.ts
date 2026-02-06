import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GeneralSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ['general-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*');
      
      if (error) throw error;
      return data as GeneralSetting[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function usePioneerBadgeUrl() {
  const { data: settings, isLoading, error } = useGeneralSettings();
  
  const pioneerBadgeUrl = settings?.find(s => s.key === 'pioneer_badge_url')?.value || null;
  
  return { pioneerBadgeUrl, isLoading, error };
}

export function useContributorBadgeUrl() {
  const { data: settings, isLoading, error } = useGeneralSettings();
  
  const contributorBadgeUrl = settings?.find(s => s.key === 'contributor_badge_url')?.value || null;
  
  return { contributorBadgeUrl, isLoading, error };
}
