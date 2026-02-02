import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  const { 
    data: isAdmin = false, 
    isLoading, 
    isFetching 
  } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('[useUserRole] Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Loading es true si:
  // - Auth está cargando
  // - La query de roles está en proceso inicial
  // - Está refetching sin datos confirmados
  const loading = authLoading || isLoading || (isFetching && !isAdmin);

  return { isAdmin, loading };
}
