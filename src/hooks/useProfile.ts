import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Si no existe el perfil, lo creamos
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateUsername = async (username: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No autenticado' };

    // Validar formato localmente primero
    const usernameRegex = /^[a-zA-Z0-9_]{1,20}$/;
    if (!usernameRegex.test(username)) {
      return { 
        success: false, 
        error: 'El username solo puede contener letras, números y guion bajo (máx. 20 caracteres)' 
      };
    }

    try {
      // Verificar disponibilidad
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Este username ya está en uso' };
      }

      // Actualizar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refrescar perfil
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Error updating username:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al guardar' 
      };
    }
  };

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    if (!user || !username) return false;

    // Normalizar a minúsculas para validación consistente con updateUsername
    const normalizedUsername = username.toLowerCase();

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', normalizedUsername)
      .neq('id', user.id)
      .maybeSingle();

    return !data;
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateUsername,
    checkUsernameAvailable,
    refetch: fetchProfile,
  };
}
