import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading: loading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      console.log('[useUserRole] Checking admin role for user:', user.id);
      
      // Query user_roles table directly to check for admin role
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
      
      const isAdminResult = !!data;
      console.log('[useUserRole] Admin check result:', isAdminResult, 'data:', data);
      return isAdminResult;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { isAdmin, loading };
}
