import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  username: string | null;
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

      // Si no existe el perfil, lo creamos con username derivado del email
      if (!data) {
        let usernameToInsert: string | null = null;
        
        // Extraer username candidato del email
        if (user.email) {
          const candidateUsername = extractUsernameFromEmail(user.email);
          
          // Solo intentar si tiene al menos 1 caracter válido
          if (candidateUsername.length >= 1) {
            // Verificar disponibilidad usando la Edge Function
            try {
              const { data: availabilityData } = await supabase.functions.invoke('check-username-available', {
                body: { username: candidateUsername }
              });
              
              if (availabilityData?.success && availabilityData?.available) {
                usernameToInsert = candidateUsername;
              }
            } catch (err) {
              console.log('Could not check username availability, creating profile without username');
            }
          }
        }
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, username: usernameToInsert })
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

    // Normalizar a minúsculas
    const normalizedUsername = username.trim().toLowerCase();

    // Validar formato localmente primero
    const usernameRegex = /^[a-z0-9_]{1,20}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return { 
        success: false, 
        error: 'El username solo puede contener letras, números y guion bajo (máx. 20 caracteres)' 
      };
    }

    try {
      // Actualizar directamente - la constraint única manejará duplicados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: normalizedUsername })
        .eq('id', user.id);

      if (updateError) {
        // Mapear error de constraint única a mensaje amigable
        if (updateError.code === '23505') {
          return { success: false, error: 'Username no disponible' };
        }
        throw updateError;
      }

      // Refrescar perfil
      await fetchProfile();
      return { success: true };
    } catch (err: unknown) {
      console.error('Error updating username:', err);
      
      // Check for constraint violation in catch block too
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        return { success: false, error: 'Username no disponible' };
      }
      
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al guardar' 
      };
    }
  };

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    if (!user || !username) return false;

    // Normalizar a minúsculas
    const normalizedUsername = username.toLowerCase();

    try {
      // Llamar a la Edge Function que usa service role para bypasear RLS
      const { data, error } = await supabase.functions.invoke('check-username-available', {
        body: { username: normalizedUsername }
      });

      if (error) {
        console.error('Error checking username availability:', error);
        // En caso de error, retornar false para ser conservadores
        return false;
      }

      if (data && data.success) {
        return data.available;
      }

      // Si la respuesta no es exitosa, retornar false
      return false;
    } catch (err) {
      console.error('Error invoking check-username-available:', err);
      return false;
    }
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
