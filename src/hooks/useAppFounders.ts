import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AppFounder {
  id: string;
  app_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useAppFounders(appId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: founders = [], isLoading, error } = useQuery({
    queryKey: ['app-founders', appId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_founders')
        .select(`
          *,
          profile:profiles(name, username, avatar_url)
        `)
        .eq('app_id', appId);

      if (error) throw error;
      return data as AppFounder[];
    },
    enabled: !!appId,
  });

  const inviteFounder = useMutation({
    mutationFn: async ({ userId, role = 'co-founder' }: { userId: string; role?: string }) => {
      const { data, error } = await supabase
        .from('app_founders')
        .insert({
          app_id: appId,
          user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este usuario ya es co-founder de esta app');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-founders', appId] });
      toast.success('Co-founder invitado exitosamente');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al invitar co-founder');
    },
  });

  const removeFounder = useMutation({
    mutationFn: async (founderId: string) => {
      const { error } = await supabase
        .from('app_founders')
        .delete()
        .eq('id', founderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-founders', appId] });
      toast.success('Co-founder eliminado');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar co-founder');
    },
  });

  const canManageFounders = founders.some(f => f.user_id === user?.id && f.role === 'owner');

  return {
    founders,
    isLoading,
    error,
    inviteFounder,
    removeFounder,
    canManageFounders,
  };
}
