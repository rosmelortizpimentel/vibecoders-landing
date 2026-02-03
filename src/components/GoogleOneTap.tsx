import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CredentialResponse } from '@/types/google';

// Google Client ID - mismo que usas para OAuth en Supabase
const GOOGLE_CLIENT_ID = '787805030135-rm2nv0stobgiuivckbgo2jgoeq12caro.apps.googleusercontent.com';

// Generar nonce aleatorio para seguridad
const generateNonce = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Nota: con FedCM, Google incluye el *hash* del nonce en el id_token.
// Supabase espera que le pasemos el nonce *crudo* y él mismo calcula/verifica el hash.

interface GoogleOneTapProps {
  onSuccess?: () => void;
}

const GoogleOneTap = ({ onSuccess }: GoogleOneTapProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const initializedRef = useRef(false);
  const nonceRef = useRef<string>('');

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: nonceRef.current,
      });

      if (error) {
        console.error('Error signing in with ID token:', error);
        throw error;
      }

      onSuccess?.();
      navigate('/me');
    } catch (error) {
      console.error('Error signing in with One Tap:', error);
    }
  }, [onSuccess, navigate]);

  useEffect(() => {
    // No mostrar si: cargando, ya autenticado, ya cerró el popup, o ya inicializado
    if (loading || user || sessionStorage.getItem('oneTapDismissed') || initializedRef.current) {
      return;
    }

    const initializeOneTap = async () => {
      if (!window.google?.accounts?.id) {
        console.warn('Google Identity Services not loaded');
        return;
      }

      // Marcar como inicializado para evitar múltiples inicializaciones
      initializedRef.current = true;
      
      // Generar nonce único
      nonceRef.current = generateNonce();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: 'signin',
        itp_support: true,
        use_fedcm_for_prompt: true,
        // Chrome 145+: nonce debe ir dentro de `params`
        params: {
          nonce: nonceRef.current, // Google lo hashea internamente y lo inserta en el id_token
        },
      } as any);

      window.google.accounts.id.prompt();
    };

    // Esperar a que el script de Google esté cargado
    if (window.google?.accounts?.id) {
      initializeOneTap();
    } else {
      // El script puede tardar en cargar, usar un pequeño delay
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initializeOneTap();
        }
      }, 100);

      // Limpiar después de 5 segundos si no carga
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [user, loading, handleCredentialResponse]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  // No renderiza UI visible, Google maneja el popup
  return null;
};

export default GoogleOneTap;
