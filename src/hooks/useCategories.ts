import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
}

export function useCategories() {
  const { data: categories = [], isLoading: loading, error } = useQuery({
    queryKey: ['app-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    categories, 
    loading, 
    error: error instanceof Error ? error : error ? new Error('Error al cargar categorías') : null 
  };
}
