import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  tagline?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  tiktok?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  email_public?: string | null;
  language?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper para extraer username del email
const extractUsernameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0] || '';
  const cleaned = localPart.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return cleaned.slice(0, 20);
};

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: loading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!data) {
        // Create profile if it doesn't exist
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        let usernameToInsert: string | null = null;
        
        if (user.email) {
          const candidateUsername = extractUsernameFromEmail(user.email);
          if (candidateUsername.length >= 1) {
            try {
              const { data: availabilityData } = await supabase.functions.invoke('check-username-available', {
                body: { username: candidateUsername }
              });
              if (availabilityData?.success && availabilityData?.available) {
                usernameToInsert = candidateUsername;
              }
            } catch (err) {
              console.log('Could not check username availability');
            }
          }
        }

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id, 
            username: usernameToInsert,
            name: googleName,
            avatar_url: googleAvatar,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          if (insertError.code === '23505') {
            const { data: retryData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            return retryData as Profile;
          }
          throw insertError;
        }
        return newProfile as Profile;
      }

      const googleName = user.user_metadata?.full_name;
      const googleAvatar = user.user_metadata?.avatar_url;
      return {
        ...data,
        name: data.name || googleName || null,
        avatar_url: data.avatar_url || googleAvatar || null,
      } as Profile;
    },
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!user) throw new Error('No autenticado');
      const normalizedUsername = username.trim().toLowerCase();
      const usernameRegex = /^[a-z0-9_]{1,20}$/;
      if (!usernameRegex.test(normalizedUsername)) {
        throw new Error('El username solo puede contener letras, números y guion bajo (máx. 20 caracteres)');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: normalizedUsername })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          throw new Error('Username no disponible');
        }
        throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    if (!user || !username) return false;
    const normalizedUsername = username.toLowerCase();
    try {
      const { data, error } = await supabase.functions.invoke('check-username-available', {
        body: { username: normalizedUsername }
      });
      return !!(data?.success && data.available);
    } catch (err) {
      console.error('Error invoking check-username-available:', err);
      return false;
    }
  }, [user]);

  return {
    profile: profile || null,
    loading,
    error: error instanceof Error ? error.message : null,
    updateUsername: async (username: string) => {
      try {
        await updateMutation.mutateAsync(username);
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Error al guardar' };
      }
    },
    checkUsernameAvailable,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
  };
}
