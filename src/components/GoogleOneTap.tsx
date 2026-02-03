import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { CredentialResponse, PromptNotification } from '@/types/google';

// Google Client ID - mismo que usas para OAuth en Supabase
const GOOGLE_CLIENT_ID = '650134857892-uvvnuq2ivb55i7uoq48fqp4sddvngdph.apps.googleusercontent.com';

interface GoogleOneTapProps {
  onSuccess?: () => void;
}

const GoogleOneTap = ({ onSuccess }: GoogleOneTapProps) => {
  const { user, loading, signInWithIdToken } = useAuth();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      await signInWithIdToken(response.credential);
      onSuccess?.();
      navigate('/me');
    } catch (error) {
      console.error('Error signing in with One Tap:', error);
    }
  }, [signInWithIdToken, onSuccess, navigate]);

  useEffect(() => {
    // No mostrar si: cargando, ya autenticado, ya cerró el popup, o ya inicializado
    if (loading || user || sessionStorage.getItem('oneTapDismissed') || initializedRef.current) {
      return;
    }

    const initializeOneTap = () => {
      if (!window.google?.accounts?.id) {
        console.warn('Google Identity Services not loaded');
        return;
      }

      // Marcar como inicializado para evitar múltiples inicializaciones
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: 'signin',
        itp_support: true,
        use_fedcm_for_prompt: true,
      });

      window.google.accounts.id.prompt((notification: PromptNotification) => {
        // Con FedCM, los métodos isNotDisplayed/isDismissedMoment/isSkippedMoment 
        // no funcionan. Solo usamos getDismissedReason que sigue disponible.
        const dismissReason = notification.getDismissedReason?.();
        
        if (dismissReason === 'credential_returned') {
          // Éxito - el credential fue enviado al callback principal
          return;
        }
        
        // Para cualquier otro dismiss, no molestar más en esta sesión
        if (dismissReason) {
          console.log('One Tap dismissed:', dismissReason);
          sessionStorage.setItem('oneTapDismissed', 'true');
        }
      });
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
