import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Status {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  display_order: number;
}

export function useStatuses() {
  const { data: statuses = [], isLoading: loading, error } = useQuery({
    queryKey: ['app-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_statuses')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (metadata changes rarely)
  });

  return { 
    statuses, 
    loading, 
    error: error instanceof Error ? error : error ? new Error('Error al cargar estados') : null 
  };
}
